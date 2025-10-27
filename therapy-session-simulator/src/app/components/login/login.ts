import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router,RouterModule } from '@angular/router';
import{ AuthService } from '../../services/auth';
 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})

export class Login {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private auth: AuthService,private router:Router)  {}
async login(){
  try{
    await this.auth.login(this.email,this.password);
  }catch(error){
    this.errorMessage="Error al iniciar sesión";
    console.error(this.errorMessage);
  }
}

async loginWithGoogle(){
try{
  await this.auth.loginWithGoogle();
}catch(error){
  this.errorMessage="Error al iniciar sesión con Google";
  console.error(this.errorMessage);
}

}
  async signUp(){
    
        this.router.navigate(['/signup']);
     
  }
}
