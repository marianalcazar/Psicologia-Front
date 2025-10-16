import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

@Component({
  selector: 'app-checklist-sidebar',
  imports: [CommonModule, MatIconModule],
  templateUrl: './checklist-sidebar.html',
  styleUrl: './checklist-sidebar.css'
})
export class ChecklistSidebar {
  @Input() checklistItems: ChecklistItem[] = [
    {
      id: 'initial-summary',
      title: 'Initial Summary',
      description: 'Start with an open-ended question that connects to the previous session',
      completed: false
    },
    {
      id: 'topic-development',
      title: 'Topic Development',
      description: 'Patient presents a new challenge or delves deeper into previous topic',
      completed: false
    },
    {
      id: 'empathy-listening',
      title: 'Empathy & Active Listening',
      description: 'Show empathy and include clarification questions',
      completed: false
    },
    {
      id: 'therapeutic-intervention',
      title: 'Therapeutic Intervention',
      description: 'Introduce technique or key question for reflection',
      completed: false
    },
    {
      id: 'session-closure',
      title: 'Homework & Closure',
      description: 'Suggest homework task and summarize key points',
      completed: false
    }
  ];

  getCompletedCount(): number {
    return this.checklistItems.filter(item => item.completed).length;
  }

  getCompletionPercentage(): number {
    return (this.getCompletedCount() / this.checklistItems.length) * 100;
  }
}
