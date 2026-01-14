import { Injectable, signal, computed } from "@angular/core";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, User, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { environment } from "../../../enviroment";
import { Router } from "@angular/router";
import { RegisterUserPayload } from "../interfaces/registrar-user.model";


@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth;
  public user = signal<User | null>(null);
  private usuarioUrl = environment.usuarioUrl;


  constructor(private router: Router) {


    initializeApp(environment.firebaseConfig);
    this.auth = getAuth();


    onAuthStateChanged(this.auth, (user: any) => this.user.set(user));
  }

  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      this.user.set(userCredential.user);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error(error);
      throw new Error("Error al iniciar sesión");
    }
  }
  async register(email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    console.log("Usuario registrado:", userCredential.user);
    this.user.set(userCredential.user);
    this.router.navigate(['/dashboard']);
  }
  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;

      const payload: RegisterUserPayload = {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        photoUrl: user.photoURL,
        provider: 'google'
      };

      await this.registerUser(payload);
      this.user.set(user);
      this.user.set(result.user);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error(error);
      throw new Error("Error al iniciar sesión con Google");
    }
  }
  async logout() {
    try {
      await signOut(this.auth);
      this.user.set(null);
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');

      this.router.navigate(['/login']);
    } catch (error) {
      console.error(error);
      throw new Error("Error al cerrar sesión");
    }
  }

  isLoggedIn(): boolean {
    return !!this.user();
  }
  async getToken() {
    return this.user()?.getIdToken() ?? null;
  }

  async registerUser(data: RegisterUserPayload): Promise<void> {
    const response = await fetch(`${environment.usuarioUrl}/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error('Error al registrar el usuario');
    }
  }



}

