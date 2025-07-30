import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { Goal, GoalProgress } from '../models/goal.model';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class GoalsService {
  private goals: Goal[] = [];
  private goalsSubject = new BehaviorSubject<Goal[]>([]);

  constructor(
    private storageService: StorageService,
    private authService: AuthService
  ) {
    setTimeout(() => {
      this.loadGoals();
    }, 500);
    
    this.authService.user$.subscribe((user: any) => {
      console.log('GoalsService - user changed:', user?.uid);
      setTimeout(() => {
        this.loadGoals();
      }, 100);
    });
  }

  getGoals(): Observable<Goal[]> {
    return this.goalsSubject.asObservable();
  }

  addGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Observable<void> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuário não está logado');
    }

    const newGoal: Goal = {
      ...goal,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.goals.push(newGoal);
    this.goalsSubject.next([...this.goals]);
    this.saveGoals();

    return from(Promise.resolve());
  }

  updateGoal(goal: Goal): Observable<void> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuário não está logado');
    }

    const index = this.goals.findIndex(g => g.id === goal.id);
    if (index !== -1) {
      this.goals[index] = { ...goal, updatedAt: new Date() };
      this.goalsSubject.next([...this.goals]);
      this.saveGoals();
    }

    return from(Promise.resolve());
  }

  deleteGoal(id: string): Observable<void> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuário não está logado');
    }

    this.goals = this.goals.filter(g => g.id !== id);
    this.goalsSubject.next([...this.goals]);
    this.saveGoals();

    return from(Promise.resolve());
  }

  updateGoalProgress(goalId: string, amount: number): Observable<void> {
    const goal = this.goals.find(g => g.id === goalId);
    if (goal) {
      const updatedGoal = {
        ...goal,
        currentAmount: Math.min(goal.currentAmount + amount, goal.targetAmount),
        updatedAt: new Date()
      };
      return this.updateGoal(updatedGoal);
    }
    throw new Error('Meta não encontrada');
  }

  getGoalProgress(goalId: string): GoalProgress | null {
    const goal = this.goals.find(g => g.id === goalId);
    if (!goal) return null;

    const percentage = (goal.currentAmount / goal.targetAmount) * 100;
    const remainingAmount = goal.targetAmount - goal.currentAmount;
    
    const now = new Date();
    const daysRemaining = Math.ceil((goal.targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const monthsRemaining = daysRemaining / 30;
    const monthlyRequiredSaving = monthsRemaining > 0 ? remainingAmount / monthsRemaining : 0;
    
    const expectedProgress = ((now.getTime() - goal.createdAt.getTime()) / (goal.targetDate.getTime() - goal.createdAt.getTime())) * 100;
    const onTrack = percentage >= expectedProgress * 0.8;

    return {
      goalId,
      percentage: Math.min(percentage, 100),
      remainingAmount,
      daysRemaining,
      monthlyRequiredSaving,
      onTrack
    };
  }

  getAllGoalProgress(): GoalProgress[] {
    return this.goals.map(goal => this.getGoalProgress(goal.id)!).filter(Boolean);
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private loadGoals(): void {
    const userId = this.authService.getCurrentUserId();
    console.log('GoalsService.loadGoals - userId:', userId);
    
    if (!userId) {
      console.log('GoalsService.loadGoals - no user, loading empty array');
      this.goals = [];
      this.goalsSubject.next([]);
      return;
    }

    const stored = this.storageService.getItem('financial-dashboard-goals');
    if (stored) {
      this.goals = JSON.parse(stored).map((g: any) => ({
        ...g,
        targetDate: new Date(g.targetDate),
        createdAt: new Date(g.createdAt),
        updatedAt: new Date(g.updatedAt)
      }));
      console.log('GoalsService.loadGoals - loaded from localStorage:', this.goals.length, 'goals');
      this.goalsSubject.next([...this.goals]);
      return;
    }

    console.log('GoalsService.loadGoals - no localStorage data, adding sample goals');
    this.addSampleGoals();
  }

  private saveGoals(): void {
    this.storageService.setItem('financial-dashboard-goals', JSON.stringify(this.goals));
  }

  private addSampleGoals(): void {
    const sampleGoals: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        title: 'Fundo de Emergência',
        description: 'Reserva para 6 meses de gastos',
        targetAmount: 15000,
        currentAmount: 3500,
        targetDate: new Date('2026-01-01'),
        category: 'Emergência',
        priority: 'high',
        isActive: true
      },
      {
        title: 'Viagem para Europa',
        description: 'Viagem de férias para Europa em 2025',
        targetAmount: 8000,
        currentAmount: 1200,
        targetDate: new Date('2025-12-01'),
        category: 'Lazer',
        priority: 'medium',
        isActive: true
      },
      {
        title: 'Novo Notebook',
        description: 'Notebook para trabalho',
        targetAmount: 4500,
        currentAmount: 800,
        targetDate: new Date('2025-10-01'),
        category: 'Tecnologia',
        priority: 'medium',
        isActive: true
      }
    ];

    sampleGoals.forEach(goalData => {
      const goal: Goal = {
        ...goalData,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.goals.push(goal);
    });
    
    console.log('GoalsService.addSampleGoals - added sample goals:', this.goals.length);
    this.goalsSubject.next([...this.goals]);
    this.saveGoals();
  }

  reloadUserData(): void {
    this.loadGoals();
  }
}
