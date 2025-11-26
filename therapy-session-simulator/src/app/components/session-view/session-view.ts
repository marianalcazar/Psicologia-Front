import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientProfile, } from '../patient-profile/patient-profile';
import { AnimatedAvatar } from '../animated-avatar/animated-avatar';
import { ChecklistSidebar, ChecklistItem } from '../checklist-sidebar/checklist-sidebar';
import { ConversationDisplay, Message } from '../conversation-display/conversation-display';
import { TherapyApi } from '../../services/therapy-api';
import { AuthService } from '../../services/auth';
import { DialogoService } from '../../services/dialogo';
import { ThreeAvatar } from '../three-avatar/three-avatar';

declare var webkitSpeechRecognition: any;
@Component({
  selector: 'app-session-view',
  imports: [
    CommonModule,
    PatientProfile,
    ThreeAvatar,
    ChecklistSidebar,
    ConversationDisplay
  ],
  templateUrl: './session-view.html',
  styleUrl: './session-view.css'
})

export class SessionView implements OnInit {

  messages: Message[] = [];
  isRecording: boolean = false;
  recognition: any;
  checklistItems: ChecklistItem[] = [
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
      id: 'objetivo-terapeutico',
      title: 'Objetivo Terapéutico',
      description: 'Identificación y definición clara de las metas específicas que el paciente desea alcanzar durante el proceso terapéutico.',
      completed: false
    }
  ];
  isTalking: boolean = false;
  isLoading: boolean = false;

  constructor(private therapyApi: TherapyApi, private auth: AuthService, private dialogoService: DialogoService) { }

  ngOnInit() {
    this.loadPatientData();
    //this.setupVoiceRecognition();
  }

  async loadPatientData() {
    this.isLoading = true;
    var token = await this.auth.getToken();
    console.log("Token en session view: " + token);

    this.therapyApi.getPatientDataMock().subscribe({
      next: (patient) => {

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading patient data:', error);
        this.isLoading = false;
      }
    });
  }

  async setupVoiceRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech Recognition API not supported in this browser.');
      return;
    }
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'es-ES';
    this.recognition.interimResults = false;
    this.recognition.continuous = false;

    this.recognition.onresult = (event: any) => {
      const texto = event.results[0][0].transcript;
      console.log('Texto reconocido:', texto);
      this.onSendMessage(texto);
      this.isRecording = false;
    }
    this.recognition.onerror = (event: any) => {
      console.error('Error en el reconocimiento de voz:', event.error);
      this.isRecording = false;
    }
    this.recognition.onend = () => (this.isRecording = false);
  }
  startRecording() {
    if (!this.recognition) return;
    this.isRecording = true;
    this.recognition.start();

  }
  stopRecording() {
    if (this.recognition && this.isRecording) {
      this.isRecording = false;
      this.recognition.stop();
    }
  }

  onSendMessage(textoRespuesta: string) {
    const terapeutaMensaje: Message = {
      id: Date.now().toString(),
      sender: 'terapeuta',
      text: textoRespuesta,
      timestamp: new Date()
    };

    this.messages.push(terapeutaMensaje);

    this.dialogoService.obtenerDialogo(textoRespuesta).subscribe({
      next: (response) => {
        console.log('Respuesta completa del backend:', response);

        const mensajePaciente = response.mensaje;
        const checklistData = response.checklist_terapeutico;

        const paciente: Message = {
          id: Date.now().toString(),
          sender: 'paciente',
          text: mensajePaciente,
          timestamp: new Date()
        };

        console.log("Mensaje del paciente:", mensajePaciente);
        console.log("Checklist recibido:", checklistData);

        this.messages.push(paciente);

        if (checklistData) {
          this.actualizarChecklist(checklistData);
        }
      },
      error: (err) => {
        console.error('Error getting patient response:', err);
      }
    });
  }

  private actualizarChecklist(checklistData: any) {

    if (!checklistData || typeof checklistData !== 'object') {
      console.warn('Checklist data inválido:', checklistData);
      return;
    }

    const mapeoChecklist: { [key: string]: string } = {
      'rapport': 'rapport-inicial',
      'pregunta_refleja': 'pregunta-refleja',
      'validacion': 'validacion',
      'objetivo_terapeutico': 'objetivo-terapeutico'
    };

    console.log('Datos del checklist recibidos:', checklistData);

    Object.keys(checklistData).forEach(key => {
      const itemId = mapeoChecklist[key];

      if (itemId) {
        const item = this.checklistItems.find(i => i.id === itemId);

        if (item) {
          item.completed = checklistData[key] === true;
          console.log(`Item "${itemId}" actualizado a:`, item.completed);
        } else {
          console.warn(`Item con id "${itemId}" no encontrado en checklistItems`);
        }
      } else {
        console.warn(`Key "${key}" no tiene mapeo en mapeoChecklist`);
      }
    });

    console.log('Checklist actualizado:', this.checklistItems);
  }

  async speakText(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1;

    this.isTalking = true; // activar movimiento de boca

    utterance.onend = () => {
      this.isTalking = false; // desactivar movimiento al terminar
    };

    speechSynthesis.speak(utterance);
  }
  async logout() {
    await this.auth.logout();
  }

}
