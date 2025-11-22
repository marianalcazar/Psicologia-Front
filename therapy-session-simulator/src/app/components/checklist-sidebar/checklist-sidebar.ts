import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

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
export class ChecklistSidebar {
  @Input() checklistItems: ChecklistItem[] = [
    {
      id: 'rapport-inicial',
      title: 'Rapport (Bienvenida)',
      description: 'Establecimiento de la conexión inicial con el paciente, creando un ambiente de confianza y comodidad para facilitar la comunicación terapéutica.',
      completed: false
    },
    {
      id: 'pregunta-refleja',
      title: 'Pregunta Refleja',
      description: 'Técnica que devuelve al paciente sus propias palabras o emociones expresadas, ayudándole a profundizar en su autoconocimiento y reflexión',
      completed: false
    },
    {
      id: 'validacion',
      title: 'Validación',
      description: 'Reconocimiento y legitimación de las emociones y experiencias del paciente, transmitiendo que sus sentimientos son comprensibles y aceptables.',
      completed: false
    },
    {
      id: 'therapeutic-intervention',
      title: 'Therapeutic Intervention',
      description: 'Introduce technique or key question for reflection',
      completed: false
    },
    {
      id: 'objetivo-terapeutico',
      title: 'Objetivo Terapéutico',
      description: 'Identificación y definición clara de las metas específicas que el paciente desea alcanzar durante el proceso terapéutico.',
      completed: false
    }
  ];

  getCompletedCount(): number {
    return this.checklistItems.filter(item => item.completed).length;
  }

  getCompletionPercentage(): number {
    return (this.getCompletedCount() / this.checklistItems.length) * 100;
  }
}
