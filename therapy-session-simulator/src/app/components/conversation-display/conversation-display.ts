import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface Message {
  id: string;
  sender: 'paciente' | 'terapeuta';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-conversation-display',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './conversation-display.html',
  styleUrl: './conversation-display.css'
})
export class ConversationDisplay {
  @Input() messages: Message[] = [];
  @Output() sendMessage = new EventEmitter<string>();
  @Output() submitSession = new EventEmitter<void>();

  therapistMessage: string = '';

  onKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      this.onSendMessage();
    }
  }

  onSendMessage() {
    if (this.therapistMessage.trim()) {
      this.sendMessage.emit(this.therapistMessage);
      this.therapistMessage = '';
    }
  }

  onSubmitSession() {
    this.submitSession.emit();
  }
}
