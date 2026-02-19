import { Component, OnInit, OnDestroy, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { DialogoService } from '../../services/dialogo';
import { checklistTerapeutico } from '../../interfaces/checklistTerapeutico.interface';
import { MatTooltipModule } from '@angular/material/tooltip';



export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  tips?: string;
}

@Component({
  selector: 'app-checklist-sidebar',
  imports: [CommonModule, MatIconModule, MatTooltipModule],
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
    'rapport': 'Tips:\nGracias por estar aquí hoy.\n¿Qué te gustaría que este espacio te ofreciera?\nPodemos ir paso a paso, sin prisa.\nMe interesa conocer tu historia desde tu mirada.',
    'pregunta_refleja': 'Tips:\nA ver si te sigo… ¿esto ha estado presente desde hace tiempo?\nEntonces, cuando pasa ___, tú sueles sentirte ___, ¿cierto?\nSi le pusieras un nombre a esto, ¿cómo lo llamarías?\n *Refleja para que la persona se escuche a sí misma.',
    'validacion': 'Tips:\nTiene mucho sentido que te sientas así con lo que has vivido.\nNo estás exagerando, esto realmente importa.\nHas estado haciendo lo mejor posible con las herramientas que tenías.\n *Reconoce la experiencia sin minimizar.',
    'objetivo_terapeutico': 'Tips:\nSi esta conversación fuera útil, ¿qué tendría que pasar hoy?\nImagina que mañana amanece un poco mejor… ¿qué notarías diferente?\n¿Qué sería una señal pequeña de avance esta semana?\n *Objetivos concretos y alcanzables.',
    'genograma': 'Tips:\nPara entender tu contexto, ¿quiénes han sido importantes en tu vida?\n¿De quién has recibido apoyo en momentos difíciles?\n¿Hay historias familiares que influyan en cómo ves este problema?\n *Explora vínculos y significados, con cuidado.',
    'cierre_sesion': 'Tips:\nAntes de cerrar, ¿qué te llevas de lo que hablamos hoy?\n¿Qué parte de tu historia te gustaría seguir explorando la próxima vez?\n¿Cuál sería un paso pequeño que valga la pena intentar esta semana?\n *Cierre con resumen y dirección.'
  };




  private checklistFullDescriptions: { [key: string]: string } = {
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
        description: this.checklistFullDescriptions['rapport'],
        completed: false,
        tips: this.checklistDescriptions['rapport']
      },
      {
        id: 'pregunta_refleja',
        title: this.checklistLabels['pregunta_refleja'],
        description: this.checklistFullDescriptions['pregunta_refleja'],
        completed: false,
        tips: this.checklistDescriptions['pregunta_refleja']
      },
      {
        id: 'validacion',
        title: this.checklistLabels['validacion'],
        description: this.checklistFullDescriptions['validacion'],
        completed: false,
        tips: this.checklistDescriptions['validacion']
      },
      {
        id: 'genograma',
        title: this.checklistLabels['genograma'],
        description: this.checklistFullDescriptions['genograma'],
        completed: false,
        tips: this.checklistDescriptions['genograma']

      },
      {
        id: 'objetivo_terapeutico',
        title: this.checklistLabels['objetivo_terapeutico'],
        description: this.checklistFullDescriptions['objetivo_terapeutico'],
        completed: false,
        tips: this.checklistDescriptions['objetivo_terapeutico']
      },
      {
        id: 'cierre_sesion',
        title: this.checklistLabels['cierre_sesion'],
        description: this.checklistFullDescriptions['cierre_sesion'],
        completed: false,
        tips: this.checklistDescriptions['cierre_sesion']
      }

    ];

  }


  getCompletedCount(): number {
    return this.checklistItems.filter(item => item.completed).length;
  }
  getLineHeight(): string {
    const itemCount = this.checklistItems.length;
    const itemHeight = 80; // altura aproximada por item (ajusta según tu contenido)
    const totalHeight = (itemCount - 1) * itemHeight;
    return `${totalHeight}px`;
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