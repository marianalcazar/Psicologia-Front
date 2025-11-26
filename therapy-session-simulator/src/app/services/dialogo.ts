import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaderResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { from, map, Observable, switchMap } from 'rxjs';
import { environment } from "../../../enviroment";
import { AuthService } from './auth';
import { ResumenPaciente } from '../interfaces/resumenpaciente.interface';

@Injectable({
  providedIn: 'root'
})
export class DialogoService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) { }


  obtenerDialogo(userInput?: string): Observable<{ mensaje: string, checklist_terapeutico: any }> {
    let params = new HttpParams();
    if (userInput) {
      params = params.set('user_input', userInput);
    }

    return from(this.auth.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        });

        return this.http.get<{ mensaje: string, checklist_terapeutico: any }>(`${this.apiUrl}/obtener_dialogo`, {
          params,
          headers
        });
      })
    );
  }

  inicializarPaciente(): Observable<ResumenPaciente> {
    return from(this.auth.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        });

        return this.http.post<ResumenPaciente>(
          `${this.apiUrl}/paciente/inicializar`,
          {}, // Body vacío
          { headers }
        );
      })
    );
  }
  obtenerResumenPaciente(): Observable<ResumenPaciente> {
    return from(this.auth.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        });

        return this.http.get<ResumenPaciente>(
          `${this.apiUrl}/paciente/resumen`,
          { headers }
        );
      })
    );
  }
}
