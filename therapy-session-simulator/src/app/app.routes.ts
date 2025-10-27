import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { SessionView } from './components/session-view/session-view';
import { SignUp } from './components/sign-up/sign-up'; // si ya lo tienes
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'signup', component: SignUp },
  { path: 'dashboard', component: SessionView, canActivate: [authGuard] },
  { path: '**', redirectTo: '/login' }
];