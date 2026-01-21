// src/app/features/therapy-session/components/conversation-display/conversation-display.component.ts

import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, OnDestroy, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, interval } from 'rxjs';
import { checklistTerapeutico } from '../../interfaces/checklistTerapeutico.interface';
import { DialogoService } from '../../services/dialogo';
import { ChecklistSidebar } from '../checklist-sidebar/checklist-sidebar';
import { AuthService } from '../../services/auth';

export interface Message {
  id: string;
  sender: 'paciente' | 'terapeuta';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-conversation-display',
  standalone: true,
  templateUrl: './conversation-display.html',
  styleUrls: ['./conversation-display.css'],
  animations: [
    trigger('messageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTooltipModule,
    ChecklistSidebar
  ]
})
export class ConversationDisplay implements OnInit, AfterViewChecked, OnDestroy, OnChanges {

  @ViewChild('messagesArea') private messagesArea!: ElementRef;

  @Input() messages: Message[] = [];
  @Output() sendMessage = new EventEmitter<string>();
  @Input() numeroSesion: number = 1;
  @Input() paciente: any;
  therapistMessage: string = '';
  isLoading: boolean = false;
  isSending: boolean = false;

  checklistActual: checklistTerapeutico | null = null;
  tiempoTranscurrido: number = 0;
  tiempoRestante: number = 60;

  private destroy$ = new Subject<void>();
  private shouldScroll = false;
  private timerSubscription: any;

  constructor(
    private dialogoService: DialogoService,
    private snackBar: MatSnackBar,
    private auth: AuthService

  ) { }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['paciente']?.currentValue) {
      this.numeroSesion = changes['paciente'].currentValue.numeroSesion;
    }
  }

  ngOnInit(): void {
    this.isLoading = false;
    this.iniciarTimer();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }


  private iniciarTimer(): void {
    this.timerSubscription = interval(60000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.tiempoRestante > 0) {
          this.tiempoRestante--;
          this.tiempoTranscurrido++;

          if (this.tiempoRestante === 10) {
            this.snackBar.open(
              '⚠️ Quedan 10 minutos para finalizar la sesión',
              'OK',
              { duration: 5000 }
            );
          }

          if (this.tiempoRestante === 5) {
            this.snackBar.open(
              '⏰ Últimos 5 minutos de la sesión',
              'OK',
              { duration: 5000 }
            );
          }

          if (this.tiempoRestante === 0) {
            this.snackBar.open(
              '⏱️ Se acabó el tiempo. Finalizando sesión...',
              'OK',
              { duration: 7000 }
            ).afterDismissed().subscribe(async () => {
              await this.auth.logout();
            });

          }
        }
      });
  }


  onSendMessage(): void {
    if (!this.therapistMessage.trim() || this.isSending) {
      return;
    }

    const messageText = this.therapistMessage.trim();
    this.therapistMessage = '';
    this.isSending = true;
    this.shouldScroll = true;

    this.sendMessage.emit(messageText);

    setTimeout(() => {
      this.isSending = false;
    }, 4500);
  }


  private scrollToBottom(): void {
    try {
      if (this.messagesArea) {
        this.messagesArea.nativeElement.scrollTop =
          this.messagesArea.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error al hacer scroll:', err);
    }
  }

}