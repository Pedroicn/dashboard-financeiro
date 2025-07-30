import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { GoalsService } from '../../services/goals.service';
import { Goal, GoalProgress } from '../../models/goal.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-goals',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.scss'
})
export class GoalsComponent implements OnInit {
  goals$: Observable<Goal[]>;
  goalProgress: { [goalId: string]: GoalProgress } = {};
  showForm = false;
  goalForm: FormGroup;

  priorities = [
    { value: 'low', label: 'Baixa', color: '#95A5A6' },
    { value: 'medium', label: 'Média', color: '#F39C12' },
    { value: 'high', label: 'Alta', color: '#E74C3C' }
  ];

  categories = [
    'Emergência', 'Lazer', 'Tecnologia', 'Educação', 
    'Saúde', 'Investimentos', 'Casa', 'Transporte'
  ];

  constructor(
    private goalsService: GoalsService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.goals$ = this.goalsService.getGoals();
    
    this.goalForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      targetAmount: ['', [Validators.required, Validators.min(1)]],
      currentAmount: [0, [Validators.min(0)]],
      targetDate: ['', Validators.required],
      category: ['', Validators.required],
      priority: ['medium', Validators.required]
    });
  }

  ngOnInit(): void {
    this.goals$.subscribe(goals => {
      this.updateGoalProgress(goals);
    });
  }

  private updateGoalProgress(goals: Goal[]): void {
    goals.forEach(goal => {
      const progress = this.goalsService.getGoalProgress(goal.id);
      if (progress) {
        this.goalProgress[goal.id] = progress;
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.goalForm.reset({
        currentAmount: 0,
        priority: 'medium'
      });
    }
  }

  onSubmit(): void {
    if (this.goalForm.valid) {
      const formValue = this.goalForm.value;
      
      const goal = {
        title: formValue.title,
        description: formValue.description || '',
        targetAmount: parseFloat(formValue.targetAmount),
        currentAmount: parseFloat(formValue.currentAmount) || 0,
        targetDate: formValue.targetDate,
        category: formValue.category,
        priority: formValue.priority,
        isActive: true
      };

      this.goalsService.addGoal(goal).subscribe({
        next: () => {
          this.snackBar.open('Meta criada com sucesso!', 'Fechar', {
            duration: 3000
          });
          this.toggleForm();
        },
        error: (error: any) => {
          console.error('Erro ao criar meta:', error);
          this.snackBar.open('Erro ao criar meta. Tente novamente.', 'Fechar', {
            duration: 3000
          });
        }
      });
    }
  }

  updateProgress(goalId: string, amount: number): void {
    if (amount > 0) {
      this.goalsService.updateGoalProgress(goalId, amount).subscribe({
        next: () => {
          this.snackBar.open('Progresso atualizado!', 'Fechar', {
            duration: 2000
          });
        },
        error: (error: any) => {
          console.error('Erro ao atualizar progresso:', error);
          this.snackBar.open('Erro ao atualizar progresso.', 'Fechar', {
            duration: 2000
          });
        }
      });
    }
  }

  deleteGoal(goalId: string): void {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      this.goalsService.deleteGoal(goalId).subscribe({
        next: () => {
          this.snackBar.open('Meta excluída!', 'Fechar', {
            duration: 2000
          });
        },
        error: (error: any) => {
          console.error('Erro ao excluir meta:', error);
          this.snackBar.open('Erro ao excluir meta.', 'Fechar', {
            duration: 2000
          });
        }
      });
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getPriorityColor(priority: string): string {
    const found = this.priorities.find(p => p.value === priority);
    return found?.color || '#95A5A6';
  }

  getPriorityLabel(priority: string): string {
    const found = this.priorities.find(p => p.value === priority);
    return found?.label || priority;
  }

  getDaysRemaining(progress: GoalProgress): string {
    if (progress.daysRemaining <= 0) {
      return 'Prazo vencido';
    } else if (progress.daysRemaining === 1) {
      return '1 dia restante';
    } else {
      return `${progress.daysRemaining} dias restantes`;
    }
  }

  getProgressColor(progress: GoalProgress): string {
    if (progress.percentage >= 100) return '#4CAF50';
    if (progress.onTrack) return '#2196F3';
    return '#FF9800';
  }

  trackByGoal(index: number, goal: Goal): string {
    return goal.id;
  }

  hasProgress(goalId: string): boolean {
    return !!this.goalProgress[goalId];
  }

  getGoalProgress(goalId: string): GoalProgress | null {
    return this.goalProgress[goalId] || null;
  }
}
