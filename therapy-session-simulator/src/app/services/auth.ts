import { Injectable, signal, computed } from "@angular/core";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, User, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { environment } from "../../../enviroment";
import { Router } from "@angular/router";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth;
  public user = signal<User | null>(null);

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
    this.user.set(userCredential.user);
    this.router.navigate(['/dashboard']);
  }
  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
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
}
