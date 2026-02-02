import { Component, OnInit, OnDestroy, Input, SimpleChanges } from '@angular/core';
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
  @Input() checklistSesion: any = null;

  private checklistLabels: { [key: string]: string } = {
    'rapport': 'Rapport (Bienvenida)',
    'pregunta_refleja': 'Pregunta Refleja',
    'validacion': 'Validación',
    'objetivo_terapeutico': 'Objetivo Terapéutico',
    'genograma': 'Genograma',
    'cierre_sesion': 'Cierre de Sesión'
  };

  private checklistDescriptions: { [key: string]: string } = {
    'rapport': 'Establecimiento de la conexión inicial con el paciente, creando un ambiente de confianza y comodidad para facilitar la comunicación terapéutica.',
    'pregunta_refleja': 'Técnica que devuelve al paciente sus propias palabras o emociones expresadas, ayudándole a profundizar en su autoconocimiento y reflexión.',
    'validacion': 'Reconocimiento y legitimación de las emociones y experiencias del paciente, transmitiendo que sus sentimientos son comprensibles y aceptables.',
    'objetivo_terapeutico': 'Identificación y definición clara de las metas específicas que el paciente desea alcanzar durante el proceso terapéutico.',
    'genograma': 'Herramienta gráfica que permite representar la estructura familiar y las relaciones entre sus miembros a lo largo de varias generaciones.',
    'cierre_sesion': 'Conclusión de la sesión terapéutica, preguntando al paciente sobre su experiencia y cómo se sintió durante la sesión.'
  };

  constructor(
    private dialogoService: DialogoService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.inicializarChecklist();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      this.actualizarChecklist(this.checklistSesion);
    }

  }

  private inicializarChecklist(): void {

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
        id: 'genograma',
        title: this.checklistLabels['genograma'],
        description: this.checklistDescriptions['genograma'],
        completed: false

      },
      {
        id: 'objetivo_terapeutico',
        title: this.checklistLabels['objetivo_terapeutico'],
        description: this.checklistDescriptions['objetivo_terapeutico'],
        completed: false
      },
      {
        id: 'cierre_sesion',
        title: this.checklistLabels['cierre_sesion'],
        description: this.checklistDescriptions['cierre_sesion'],
        completed: false
      }

    ];

  }


  getCompletedCount(): number {
    return this.checklistItems.filter(item => item.completed).length;
  }

  getCompletionPercentage(): number {
    if (this.checklistItems.length === 0) return 0;
    return (this.getCompletedCount() / this.checklistItems.length) * 100;
  }

  actualizarChecklist(checklist: any): void {
    this.checklistItems = this.checklistItems.map(item => ({
      ...item,
      completed: checklist[item.id]?.estatus ?? item.completed
    }));


  }
}