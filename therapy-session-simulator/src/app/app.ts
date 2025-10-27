import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SessionView } from './components/session-view/session-view';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'Therapy Session Simulator';
}
