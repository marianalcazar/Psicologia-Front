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
    'rapport-inicial': 'Inicio / Rapport',
    'explora-motivo-consulta': 'Explora Motivo de Consulta',
    'pregunta-refleja': 'Reflejar',
    'validacion': 'Validar',
    'objetivo-terapeutico': 'Plantear Objetivo'
  };

  private checklistDescriptions: { [key: string]: string } = {
    'rapport-inicial': 'Establecer rapport, crear ambiente de confianza y comodidad. Mantener actitud profesional y acogedora.',
    'explora-motivo-consulta': 'Explorar circunstancias, recursos, excepciones y consecuencias del motivo de consulta.',
    'pregunta-refleja': 'Parafrasear y devolver palabras clave, hechos y emociones para que el consultante se sienta comprendido.',
    'validacion': 'Normalizar y despatologizar las emociones. Expresar comprensión y aceptación.',
    'objetivo-terapeutico': 'Plantear un objetivo relacionado con el motivo de consulta, comprensible y acordado con el consultante.'
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
    // Inicializar con items por defecto para Primera Sesión Terapéutica
    this.checklistItems = [
      {
        id: 'rapport-inicial',
        title: this.checklistLabels['rapport-inicial'],
        description: this.checklistDescriptions['rapport-inicial'],
        completed: false
      },
      {
        id: 'explora-motivo-consulta',
        title: this.checklistLabels['explora-motivo-consulta'],
        description: this.checklistDescriptions['explora-motivo-consulta'],
        completed: false
      },
      {
        id: 'pregunta-refleja',
        title: this.checklistLabels['pregunta-refleja'],
        description: this.checklistDescriptions['pregunta-refleja'],
        completed: false
      },
      {
        id: 'validacion',
        title: this.checklistLabels['validacion'],
        description: this.checklistDescriptions['validacion'],
        completed: false
      },
      {
        id: 'objetivo-terapeutico',
        title: this.checklistLabels['objetivo-terapeutico'],
        description: this.checklistDescriptions['objetivo-terapeutico'],
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