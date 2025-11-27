import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { DialogoService } from '../../services/dialogo';
import { checklistTerapeutico } from '../../interfaces/checklistTerapeutico.interface';

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

@Component({
  selector: 'app-checklist-sidebar',
  imports: [CommonModule, MatIconModule],
  templateUrl: './checklist-sidebar.html',
  styleUrl: './checklist-sidebar.css'
})
export class ChecklistSidebar implements OnInit, OnDestroy {
  checklistItems: ChecklistItem[] = [];
  private destroy$ = new Subject<void>();
  private checklistActual: checklistTerapeutico | null = null;

  private checklistLabels: { [key: string]: string } = {
    'rapport': 'Rapport (Bienvenida)',
    'pregunta_refleja': 'Pregunta Refleja',
    'validacion': 'Validación',
    'objetivo_terapeutico': 'Objetivo Terapéutico'
  };

  private checklistDescriptions: { [key: string]: string } = {
    'rapport': 'Establecimiento de la conexión inicial con el paciente, creando un ambiente de confianza y comodidad para facilitar la comunicación terapéutica.',
    'pregunta_refleja': 'Técnica que devuelve al paciente sus propias palabras o emociones expresadas, ayudándole a profundizar en su autoconocimiento y reflexión.',
    'validacion': 'Reconocimiento y legitimación de las emociones y experiencias del paciente, transmitiendo que sus sentimientos son comprensibles y aceptables.',
    'objetivo_terapeutico': 'Identificación y definición clara de las metas específicas que el paciente desea alcanzar durante el proceso terapéutico.'
  };

  constructor(
    private dialogoService: DialogoService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.inicializarChecklist();
    this.suscribirseAChecklist();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private inicializarChecklist(): void {
    // Inicializar con items por defecto
    this.checklistItems = [
      {
        id: 'rapport',
        title: this.checklistLabels['rapport'],
        description: this.checklistDescriptions['rapport'],
        completed: false
      },
      {
        id: 'pregunta_refleja',
        title: this.checklistLabels['pregunta_refleja'],
        description: this.checklistDescriptions['pregunta_refleja'],
        completed: false
      },
      {
        id: 'validacion',
        title: this.checklistLabels['validacion'],
        description: this.checklistDescriptions['validacion'],
        completed: false
      },
      {
        id: 'objetivo_terapeutico',
        title: this.checklistLabels['objetivo_terapeutico'],
        description: this.checklistDescriptions['objetivo_terapeutico'],
        completed: false
      }
    ];

    // Verificar si hay una sesión activa con checklist
    this.dialogoService.verificarSessionActiva()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (estado) => {
          if (estado.tiene_sesion_activa && estado.checklist_actual) {
            this.checklistActual = estado.checklist_actual;
            this.convertirChecklistAItems(estado.checklist_actual);
          }
        },
        error: (error) => {
          console.error('Error al verificar sesión:', error);
        }
      });
  }

  private suscribirseAChecklist(): void {
    this.dialogoService.checklist$
      .pipe(takeUntil(this.destroy$))
      .subscribe(checklist => {
        if (checklist) {
          const checklistAnterior = this.checklistActual;
          this.checklistActual = checklist;
          
          // Convertir al formato de items
          this.convertirChecklistAItems(checklist);
          
          // Mostrar notificaciones cuando se complete un item
          if (checklistAnterior) {
            Object.entries(checklist).forEach(([key, item]) => {
              const itemAnterior = checklistAnterior[key as keyof checklistTerapeutico];
              if (!itemAnterior?.completed && item.completed) {
                this.snackBar.open(
                  `✅ ${this.checklistLabels[key]} completado!`,
                  'OK',
                  { duration: 3000 }
                );
              }
            });
          }
        }
      });
  }

  private convertirChecklistAItems(checklist: checklistTerapeutico): void {
    this.checklistItems = Object.entries(checklist).map(([key, item]) => ({
      id: key,
      title: this.checklistLabels[key] || key,
      description: this.checklistDescriptions[key] || '',
      completed: item.completed
    }));
  }

  getCompletedCount(): number {
    return this.checklistItems.filter(item => item.completed).length;
  }

  getCompletionPercentage(): number {
    if (this.checklistItems.length === 0) return 0;
    return (this.getCompletedCount() / this.checklistItems.length) * 100;
  }
}