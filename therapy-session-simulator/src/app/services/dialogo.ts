import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "../../../enviroment";

@Injectable({
  providedIn: 'root'
})
export class DialogoService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  obtenerDialogo(userInput?: string): Observable<string> {
    let params = new HttpParams();
    if (userInput) {
      params = params.set('user_input', userInput);
    }

    return this.http.get(`${this.apiUrl}/obtener_dialogo`, {
      params,
      responseType: 'text'
    });
  }
}
