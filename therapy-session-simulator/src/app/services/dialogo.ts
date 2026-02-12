// src/app/features/therapy-session/services/dialogo.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, catchError, from, map, Observable, switchMap, tap, throwError } from 'rxjs';
import { environment } from "../../../enviroment";
import { AuthService } from './auth';
import { ResumenPaciente } from '../interfaces/resumenpaciente.interface';
import { checklistTerapeutico } from '../interfaces/checklistTerapeutico.interface';
import { EstadoSesion } from '../interfaces/EstadoSesion.interface';
import { ResumenPacienteExtendido } from '../interfaces/ResumenPacienteExtendido.interface';
import { DialogoResponse } from '../interfaces/DialogoResponse.interface';
import { Estadisticainterface } from '../interfaces/Estadistica.interface';
import { FinalizarSesion } from '../interfaces/FinalizarSesion.interface';

@Injectable({
  providedIn: 'root'
})
export class DialogoService {

  private apiUrl = environment.apiUrl;

  private checklistSubject = new BehaviorSubject<checklistTerapeutico | null>(null);
  public checklist$ = this.checklistSubject.asObservable();

  private estadoSesionActual = new BehaviorSubject<EstadoSesion | null>(null);
  public estadoSesion$ = this.estadoSesionActual.asObservable();

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {

  }

  private getHeaders(): Observable<HttpHeaders> {
    return from(this.auth.getToken()).pipe(
      map(token => {
        if (!token) {
          throw new Error('No se pudo obtener el token de autenticación');
        }
        return new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });
      }),
      catchError(error => {
        console.error('Error al obtener headers:', error);
        return throwError(() => new Error('Error de autenticación'));
      })
    );
  }

  inicializarPaciente(): Observable<ResumenPacienteExtendido> {
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.post<string>(
          `${this.apiUrl}/paciente/inicializar`,
          {},
          { headers }
        )
      ),tap(response => {
      console.log("📦 Response crudo del backend:", response);
    }),
      map(resumenStr => JSON.parse(resumenStr) as ResumenPacienteExtendido),
      tap(() => {
      }),
      catchError(error => {
        console.error('❌ Error al inicializar paciente:', error);
        return throwError(() => new Error('Error al inicializar el paciente'));
      })
    );
  }


  obtenerResumenPaciente(): Observable<ResumenPacienteExtendido> {
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.get<ResumenPacienteExtendido>(
          `${this.apiUrl}/paciente/resumen`,
          { headers }
        )
      ),
      tap(resumen => console.log('📋 Resumen del paciente:', resumen)),
      catchError(error => {
        console.error('❌ Error al obtener resumen:', error);
        return throwError(() => new Error('No se pudo obtener el resumen del paciente'));
      })
    );
  }

  enviarMensaje(userInput: string): Observable<DialogoResponse> {
    if (!userInput || !userInput.trim()) {
      return throwError(() => new Error('El mensaje no puede estar vacío'));
    }

    const datos = {
      user_input: userInput.trim()
    };


    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.post<DialogoResponse>(
          `${this.apiUrl}/enviar_mensaje`,
          datos,
          { headers }
        )
      ),
      tap(response => {
        console.log('💬 Respuesta recibida:', response);

      }),
      catchError(error => {
        console.error('❌ Error al enviar mensaje:', error);
        const errorMsg = error.error?.detail || 'Error al enviar el mensaje';
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  isChecklistCompleto(checklist: checklistTerapeutico | null): boolean {
    if (!checklist) return false;
    return Object.values(checklist).every(item => item.completed);
  }

}