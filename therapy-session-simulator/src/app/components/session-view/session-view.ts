import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientProfile, Patient } from '../patient-profile/patient-profile';
import { AnimatedAvatar } from '../animated-avatar/animated-avatar';
import { ChecklistSidebar, ChecklistItem } from '../checklist-sidebar/checklist-sidebar';
import { ConversationDisplay, Message } from '../conversation-display/conversation-display';
import { TherapyApi } from '../../services/therapy-api';

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
  patient: Patient | null = null;
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

  constructor(private therapyApi: TherapyApi) {}

  ngOnInit() {
    this.loadPatientData();
  }

  loadPatientData() {
    this.isLoading = true;
    this.therapyApi.getPatientDataMock().subscribe({
      next: (patient) => {
        this.patient = patient;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading patient data:', error);
        this.isLoading = false;
      }
    });
  }

  onSendMessage(messageText: string) {
    const therapistMessage: Message = {
      id: Date.now().toString(),
      sender: 'therapist',
      text: messageText,
      timestamp: new Date()
    };
    
    this.messages.push(therapistMessage);
    
    this.isTalking = true;
    this.therapyApi.getPatientResponseMock(messageText).subscribe({
      next: (patientMessage) => {
        this.messages.push(patientMessage);
        this.isTalking = false;
      },
      error: (error) => {
        console.error('Error getting patient response:', error);
        this.isTalking = false;
      }
    });
  }

  onSubmitSession() {
    this.isLoading = true;
    this.therapyApi.submitSessionMock(this.messages).subscribe({
      next: (result) => {
        console.log('Session submitted successfully:', result);
        
        if (result.checklistResults) {
          Object.keys(result.checklistResults).forEach(key => {
            const item = this.checklistItems.find(i => i.id === key);
            if (item) {
              item.completed = result.checklistResults[key];
            }
          });
        }
        
        alert(`Session completed!\nScore: ${result.score}%\nFeedback: ${result.feedback}`);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error submitting session:', error);
        this.isLoading = false;
      }
    });
  }
}
