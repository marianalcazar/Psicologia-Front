// src/app/features/therapy-session/components/session-view/session-view.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PatientProfile } from '../patient-profile/patient-profile';
import { ChecklistSidebar, ChecklistItem } from '../checklist-sidebar/checklist-sidebar';
import { ConversationDisplay, Message } from '../conversation-display/conversation-display';
import { TherapyApi } from '../../services/therapy-api';
import { AuthService } from '../../services/auth';
import { DialogoService } from '../../services/dialogo';

@Component({
  selector: 'app-session-view',
  standalone: true,
  imports: [
    CommonModule,
    PatientProfile,
    ChecklistSidebar,
    ConversationDisplay
  ],
  templateUrl: './session-view.html',
  styleUrls: ['./session-view.css']
})
export class SessionView implements OnInit, OnDestroy {


  messages: Message[] = [];
  pacienteActual: any = null;
  checklistItems: ChecklistItem[] = [
    {
      id: 'rapport',
      title: 'Rapport (Bienvenida)',
      description: 'Establecimiento de la conexión inicial con el paciente',
      completed: false
    },
    {
      id: 'pregunta_refleja',
      title: 'Pregunta Refleja',
      description: 'Técnica que devuelve al paciente sus propias palabras',
      completed: false
    },
    {
      id: 'validacion',
      title: 'Validación',
      description: 'Reconocimiento de las emociones del paciente',
      completed: false
    },
    {
      id: 'objetivo_terapeutico',
      title: 'Objetivo Terapéutico',
      description: 'Identificación de metas específicas',
      completed: false
    }
  ];

  isLoading: boolean = false;
  isSending: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private therapyApi: TherapyApi,
    private auth: AuthService,
    private dialogoService: DialogoService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadPatientData();
    this.suscribirseAChecklist();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadPatientData(): Promise<void> {
    this.isLoading = true;

    try {
      const token = await this.auth.getToken();
      console.log("Token en session view: " + token);

      this.therapyApi.getPatientDataMock().subscribe({
        next: (patient) => {
          console.log('Patient data loaded:', patient);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading patient data:', error);
          this.snackBar.open(
            'Error al cargar datos del paciente',
            'Cerrar',
            { duration: 3000 }
          );
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error getting token:', error);
      this.isLoading = false;
    }
  }

  private suscribirseAChecklist(): void {
    this.dialogoService.checklist$
      .pipe(takeUntil(this.destroy$))
      .subscribe(checklist => {
        if (checklist) {
          this.actualizarChecklist(checklist);
        }
      });
  }

  onSendMessage(textoRespuesta: string): void {
    if (!textoRespuesta?.trim() || this.isSending) {
      return;
    }

    const terapeutaMensaje: Message = {
      id: Date.now().toString(),
      sender: 'terapeuta',
      text: textoRespuesta.trim(),
      timestamp: new Date()
    };

    this.messages = [...this.messages, terapeutaMensaje];
    this.isSending = true;

    this.dialogoService.enviarMensaje(textoRespuesta.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Respuesta completa del backend:', response);

          const pacienteMensaje: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'paciente',
            text: response.mensaje_paciente,
            timestamp: new Date()
          };

          this.messages = [...this.messages, pacienteMensaje];

          if (response.checklist_terapeutico) {
            this.actualizarChecklist(response.checklist_terapeutico);
          }

          if (response.sesionCompletada) {
            this.snackBar.open(
              '🎉 ¡Felicidades! Checklist completado',
              'OK',
              { duration: 5000 }
            );
          }

          this.isSending = false;
        },
        error: (error) => {
          console.error('Error al enviar mensaje:', error);
          this.snackBar.open(
            'Error al obtener respuesta del paciente',
            'Cerrar',
            { duration: 3000 }
          );
          this.isSending = false;
        }
      });
  }

  private actualizarChecklist(checklistData: any): void {
    if (!checklistData || typeof checklistData !== 'object') {
      console.warn('Checklist data inválido:', checklistData);
      return;
    }

    const mapeoChecklist: { [key: string]: string } = {
      'rapport': 'rapport',
      'pregunta_refleja': 'pregunta_refleja',
      'validacion': 'validacion',
      'objetivo_terapeutico': 'objetivo_terapeutico'
    };

    console.log('Actualizando checklist con:', checklistData);

    Object.keys(checklistData).forEach(key => {
      const itemId = mapeoChecklist[key];

      if (itemId) {
        const item = this.checklistItems.find(i => i.id === itemId);

        if (item) {
          const wasCompleted = item.completed;
          item.completed = checklistData[key]?.completed === true;

          if (!wasCompleted && item.completed) {
            console.log(`✅ Item "${item.title}" completado`);
          }
        }
      }
    });

    this.checklistItems = [...this.checklistItems];
  }

  async logout(): Promise<void> {
    await this.auth.logout();
  }

  onPacienteChange(paciente: any) {
    this.pacienteActual = paciente;
  }

}