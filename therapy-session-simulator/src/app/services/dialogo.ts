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
    this.verificarSessionActiva().subscribe({
      next: () => console.log('Sesión verificada al iniciar servicio'),
      error: (err) => console.warn('No hay sesión activa:', err)
    });
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
        this.http.post<ResumenPacienteExtendido>(
          `${this.apiUrl}/paciente/inicializar`,
          {},
          { headers }
        )
      ),
      tap(resumen => {
        console.log('✅ Paciente inicializado:', resumen);
        this.verificarSessionActiva().subscribe();
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

    const params = new HttpParams().set('user_input', userInput.trim());

    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.post<DialogoResponse>(
          `${this.apiUrl}/enviar_mensaje`,
          {},
          { headers, params }
        )
      ),
      tap(response => {
        console.log('💬 Respuesta recibida:', response);
        
        if (response.checklist_terapeutico) {
          this.checklistSubject.next(response.checklist_terapeutico);
        }
        
        if (response.sesionCompletada) {
          console.log('🎉 ¡Sesión completada! Checklist completo');
          this.verificarSessionActiva().subscribe();
        }
      }),
      catchError(error => {
        console.error('❌ Error al enviar mensaje:', error);
        const errorMsg = error.error?.detail || 'Error al enviar el mensaje';
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  verificarSessionActiva(): Observable<EstadoSesion> {
    return this.getHeaders().pipe(
      switchMap(headers => 
        this.http.get<EstadoSesion>(
          `${this.apiUrl}/sesion/estado`,
          { headers }
        )
      ),
      tap(estado => {
        this.estadoSesionActual.next(estado);
        
        if (estado.tiene_sesion_activa && estado.checklist_actual) {
          this.checklistSubject.next(estado.checklist_actual);
        }
        
        console.log('🔍 Estado de sesión:', {
          activa: estado.tiene_sesion_activa,
          numero: estado.numero_sesion,
          tiempo_restante: estado.tiempo_restante_minutos
        });
      }),
      catchError(error => {
        console.warn('⚠️ Error al verificar sesión:', error);
        
        const estadoVacio: EstadoSesion = {
          tiene_sesion_activa: false,
          mensaje: 'No hay sesión activa'
        };
        this.estadoSesionActual.next(estadoVacio);
        
        return throwError(() => error);
      })
    );
  }

  finalizarSesion(): Observable<FinalizarSesion> {
    return this.getHeaders().pipe(
      switchMap(headers => 
        this.http.post<FinalizarSesion>(
          `${this.apiUrl}/sesion/finalizar`,
          {},
          { headers }
        )
      ),
      tap(resultado => {
        console.log('✅ Sesión finalizada:', resultado);
        
        this.checklistSubject.next(null);
        this.estadoSesionActual.next({
          tiene_sesion_activa: false,
          mensaje: 'Sesión finalizada'
        });
      }),
      catchError(error => {
        console.error('❌ Error al finalizar sesión:', error);
        const errorMsg = error.error?.detail || 'No se pudo finalizar la sesión';
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  obtenerEstadisticas(): Observable<Estadisticainterface> {
    return this.getHeaders().pipe(
      switchMap(headers => 
        this.http.get<Estadisticainterface>(
          `${this.apiUrl}/estadisticas`,
          { headers }
        )
      ),
      tap(stats => console.log('📊 Estadísticas:', stats)),
      catchError(error => {
        console.error('❌ Error al obtener estadísticas:', error);
        return throwError(() => new Error('No se pudieron obtener las estadísticas'));
      })
    );
  }

  isChecklistCompleto(checklist: checklistTerapeutico | null): boolean {
    if (!checklist) return false;
    return Object.values(checklist).every(item => item.completed);
  }

  getChecklistProgress(checklist: checklistTerapeutico | null): number {
    if (!checklist) return 0;
    
    const items = Object.values(checklist);
    if (items.length === 0) return 0;
    
    const completados = items.filter(item => item.completed).length;
    return Math.round((completados / items.length) * 100);
  }

  resetearEstado(): void {
    this.checklistSubject.next(null);
    this.estadoSesionActual.next(null);
    console.log('🔄 Estado del servicio reseteado');
  }
}