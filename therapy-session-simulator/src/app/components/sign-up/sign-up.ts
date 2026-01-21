import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css'
})
export class SignUp {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private auth: AuthService) { }
  async register() {
    try {
      await this.auth.register(this.email, this.password);
    } catch (error) {
      this.errorMessage = "Error al crear la cuenta";
      console.error(this.errorMessage);
    }
  }

  async registerWithGoogle() {
    try {
      await this.auth.loginWithGoogle();
    } catch (error) {
      this.errorMessage = "Error al crear la cuenta con Google";
      console.error(this.errorMessage);
    }
  }

  goToLogin() {
    window.location.href = '/login';

  }
}
