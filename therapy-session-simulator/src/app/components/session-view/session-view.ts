import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientProfile,  } from '../patient-profile/patient-profile';
import { AnimatedAvatar } from '../animated-avatar/animated-avatar';
import { ChecklistSidebar, ChecklistItem } from '../checklist-sidebar/checklist-sidebar';
import { ConversationDisplay, Message } from '../conversation-display/conversation-display';
import { TherapyApi } from '../../services/therapy-api';
import { AuthService } from '../../services/auth';
import { DialogoService } from '../../services/dialogo';

@Component({
  selector: 'app-session-view',
  imports: [
    CommonModule,
    PatientProfile,
    AnimatedAvatar,
    ChecklistSidebar,
    ConversationDisplay
  ],
  templateUrl: './session-view.html',
  styleUrl: './session-view.css'
})
export class SessionView implements OnInit {
 
  messages: Message[] = [];
  checklistItems: ChecklistItem[] = [
    {
      id: 'initial-summary',
      title: 'Initial Summary',
      description: 'Start with an open-ended question that connects to the previous session',
      completed: false
    },
    {
      id: 'topic-development',
      title: 'Topic Development',
      description: 'Patient presents a new challenge or delves deeper into previous topic',
      completed: false
    },
    {
      id: 'empathy-listening',
      title: 'Empathy & Active Listening',
      description: 'Show empathy and include clarification questions',
      completed: false
    },
    {
      id: 'therapeutic-intervention',
      title: 'Therapeutic Intervention',
      description: 'Introduce technique or key question for reflection',
      completed: false
    },
    {
      id: 'session-closure',
      title: 'Homework & Closure',
      description: 'Suggest homework task and summarize key points',
      completed: false
    }
  ];
  isTalking: boolean = false;
  isLoading: boolean = false;

  constructor(private therapyApi: TherapyApi,private auth:AuthService, private dialogoService: DialogoService) {}

  ngOnInit() {
    this.loadPatientData();
  }

  async loadPatientData() {
    this.isLoading = true;
    var token= await this.auth.getToken();
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

  onSendMessage(textoRespuesta: string) {
    const teraputaMensaje: Message = {
      id: Date.now().toString(),
      sender: 'terapeuta',
      text: textoRespuesta,
      timestamp: new Date()
    };

    this.messages.push(teraputaMensaje);

    this.dialogoService.obtenerDialogo(textoRespuesta).subscribe({
      next: (pacienteRespuesta) => {
        const paciente: Message = {
          id: Date.now().toString(),
          sender: 'paciente',
          text: pacienteRespuesta,
          timestamp: new Date()
        };
        console.log("Paciente" + paciente)
        console.log("Paciente" + pacienteRespuesta)
        this.messages.push(paciente);
      },
      error: (err) => {
        console.error('Error getting patient response:', err);
      }
    })
  }
async logout(){
    await this.auth.logout();
}

}
