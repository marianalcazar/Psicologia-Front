import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-animated-avatar',
  imports: [CommonModule],
  templateUrl: './animated-avatar.html',
  styleUrl: './animated-avatar.css'
})
export class AnimatedAvatar {
  @Input() isTalking: boolean = false;
}
