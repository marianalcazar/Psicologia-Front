import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';

import { Message } from '../components/conversation-display/conversation-display';
import { ResumenPaciente } from '../interfaces/resumenpaciente.interface';

@Injectable({
  providedIn: 'root'
})
export class TherapyApi {
  private apiUrl = '/api';

  constructor(private http: HttpClient) { }

  /* getPatientData(patientId: string): Observable<ResumenPaciente> {
     return this.http.get<ResumenPaciente>(`${this.apiUrl}/patient/${patientId}`);
   }*/

  getPatientDataMock(): Observable<ResumenPaciente> {
    const mockPatient: ResumenPaciente = {
      nombre: 'John Smith',
      imagen: '',
      edad: '35 años',

    };

    return of(mockPatient).pipe(delay(500));
  }

  sendTherapistMessage(sessionId: string, message: string): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/session/${sessionId}/message`, { message });
  }

  getPatientResponseMock(therapistMessage: string): Observable<Message> {
    const responses = [
      "This week was really challenging. I tried to set boundaries, but my manager kept pushing back.",
      "I felt anxious when I had to say no to a colleague's request. I'm not sure if I did the right thing.",
      "It's hard to balance everything. Sometimes I feel like I'm failing at both work and personal life.",
      "I appreciate your support. This is really helping me see things differently."
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    const patientMessage: Message = {
      id: Date.now().toString(),
      sender: 'paciente',
      text: randomResponse,
      timestamp: new Date()
    };

    return of(patientMessage).pipe(delay(1000));
  }

  submitSession(sessionId: string, messages: Message[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/session/${sessionId}/submit`, { messages });
  }

  submitSessionMock(messages: Message[]): Observable<any> {
    return of({
      success: true,
      score: 85,
      feedback: 'Good session! You covered most checklist items effectively.',
      checklistResults: {
        'initial-summary': true,
        'topic-development': true,
        'empathy-listening': true,
        'therapeutic-intervention': false,
        'session-closure': true
      }
    }).pipe(delay(1000));
  }
}
