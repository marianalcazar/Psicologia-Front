import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

export interface Patient {
  name: string;
  sessionNumber: number;
  mainConcerns: string[];
  profession?: string;
  treatmentGoals?: string[];
  lastSessionSummary?: string;
}

@Component({
  selector: 'app-patient-profile',
  imports: [CommonModule, MatCardModule, MatChipsModule],
  templateUrl: './patient-profile.html',
  styleUrl: './patient-profile.css'
})
export class PatientProfile {
  @Input() patient: Patient | null = null;
}
