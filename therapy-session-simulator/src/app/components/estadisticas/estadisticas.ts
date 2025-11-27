import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogoService } from '../../services/dialogo';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatCard, MatCardContent } from "@angular/material/card";
import { MatProgressBar } from "@angular/material/progress-bar";
import { Estadisticainterface } from '../../interfaces/Estadistica.interface';

@Component({
  selector: 'app-estadisticas',
  imports: [CommonModule, MatIcon, MatProgressSpinner, MatCard, MatCardContent, MatProgressBar],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css',
})
export class Estadisticas {
 estadisticas: Estadisticainterface | null = null;
  isLoading: boolean = true;

  constructor(
    private dialogoService: DialogoService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.isLoading = true;

    this.dialogoService.obtenerEstadisticas().subscribe({
      next: (stats) => {
        this.estadisticas = stats;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        this.snackBar.open(
          'Error al cargar estadísticas',
          'Cerrar',
          { duration: 5000 }
        );
        this.isLoading = false;
      }
    });
  }

  get porcentajeChecklistCompleto(): number {
    if (!this.estadisticas || this.estadisticas.total_sesiones === 0) {
      return 0;
    }
    return Math.round(
      (this.estadisticas.sesion_checklist_completados / this.estadisticas.total_sesiones) * 100
    );
  }

  formatearTiempo(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = Math.round(minutos % 60);
    
    if (horas > 0) {
      return `${horas}h ${mins}m`;
    }
    return `${mins}m`;
  }
}
