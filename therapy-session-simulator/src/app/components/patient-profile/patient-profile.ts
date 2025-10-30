import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DialogoService } from '../../services/dialogo';
import { ResumenPaciente } from '../../interfaces/resumenpaciente.interface';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatChipsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './patient-profile.html',
  styleUrl: './patient-profile.css'
})
export class PatientProfile implements OnInit {
  patient: ResumenPaciente | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  pacienteInicializado: boolean = false;

  constructor(private dialogo: DialogoService) {}

  ngOnInit() {
    this.inicializarPaciente();
  }

 inicializarPaciente() {
    this.isLoading = true;
    this.error = null;

    this.dialogo.inicializarPaciente().subscribe({
      next: (resumen: ResumenPaciente) => {
        console.log('Paciente inicializado:', resumen);
        this.patient = resumen;
        this.pacienteInicializado = true;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al inicializar paciente:', error);
        this.error = 'No se pudo cargar el paciente. Intenta de nuevo.';
        this.isLoading = false;
        this.pacienteInicializado = false;
      }
    });
  }
  obtenerResumen() {
    if (!this.pacienteInicializado) {
      // Si no hay paciente inicializado, inicializar primero
      this.inicializarPaciente();
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.dialogo.obtenerResumenPaciente().subscribe({
      next: (resumen: ResumenPaciente) => {
        console.log('Resumen actualizado:', resumen);
        this.patient = resumen;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener resumen:', error);
        
        // Si el error es 404, probablemente no hay paciente asignado
        if (error.status === 404) {
          this.error = 'No hay paciente asignado. Inicializando...';
          this.pacienteInicializado = false;
          // Reinicializar automáticamente
          setTimeout(() => this.inicializarPaciente(), 1000);
        } else {
          this.error = 'Error al cargar información del paciente.';
        }
        
        this.isLoading = false;
      }
    });
  }
}