import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { Goal, GoalProgress } from '../models/goal.model';
import { AuthService } from './auth.service';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GoalsService {
  private firestore = inject(Firestore);
  private goals: Goal[] = [];
  private goalsSubject = new BehaviorSubject<Goal[]>([]);

  constructor(
    private authService: AuthService
  ) {
    // Aguardar um pouco para garantir que a autenticação foi inicializada
    setTimeout(() => {
      this.loadGoals();
    }, 500);
    
    // Recarregar dados quando o usuário mudar
    this.authService.user$.subscribe((user: any) => {
      console.log('GoalsService - user changed:', user?.uid);
      // Aguardar um pouco para garantir que a mudança foi processada
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

    const goalData = {
      title: goal.title,
      description: goal.description,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: goal.targetDate.toISOString(),
      category: goal.category,
      priority: goal.priority,
      isActive: goal.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId
    };

    const goalsRef = collection(this.firestore, 'goals');
    return from(addDoc(goalsRef, goalData)).pipe(
      map(() => {
        console.log('Meta adicionada ao Firestore');
        this.loadGoalsFromFirestore();
      })
    );
  }

  updateGoal(goal: Goal): Observable<void> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuário não está logado');
    }

    const goalData = {
      title: goal.title,
      description: goal.description,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: goal.targetDate.toISOString(),
      category: goal.category,
      priority: goal.priority,
      isActive: goal.isActive,
      updatedAt: new Date().toISOString(),
      userId
    };

    const goalRef = doc(this.firestore, 'goals', goal.id);
    return from(updateDoc(goalRef, goalData)).pipe(
      map(() => {
        console.log('Meta atualizada no Firestore');
        this.loadGoalsFromFirestore();
      })
    );
  }

  deleteGoal(id: string): Observable<void> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuário não está logado');
    }

    const goalRef = doc(this.firestore, 'goals', id);
    return from(deleteDoc(goalRef)).pipe(
      map(() => {
        console.log('Meta excluída do Firestore');
        this.loadGoalsFromFirestore();
      })
    );
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
    
    // Considera que está no caminho certo se está economizando pelo menos 80% do necessário
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

    this.loadGoalsFromFirestore();
  }

  private loadGoalsFromFirestore(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    console.log('🔍 FIRESTORE DEBUG - Carregando metas para usuário:', userId);
    
    const goalsRef = collection(this.firestore, 'goals');
    // Removendo orderBy temporariamente para não precisar do índice composto
    const q = query(goalsRef, where('userId', '==', userId));
    
    from(getDocs(q)).subscribe({
      next: (querySnapshot) => {
        console.log('🔍 FIRESTORE DEBUG - Query metas executada, documentos encontrados:', querySnapshot.size);
        
        this.goals = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('🔍 FIRESTORE DEBUG - Meta documento:', doc.id, {
            userId: data['userId'],
            title: data['title'],
            targetAmount: data['targetAmount'],
            currentAmount: data['currentAmount']
          });
          
          const goal: Goal = {
            id: doc.id,
            title: data['title'],
            description: data['description'],
            targetAmount: data['targetAmount'],
            currentAmount: data['currentAmount'],
            targetDate: new Date(data['targetDate']),
            category: data['category'],
            priority: data['priority'],
            isActive: data['isActive'],
            createdAt: new Date(data['createdAt']),
            updatedAt: new Date(data['updatedAt'])
          };
          this.goals.push(goal);
        });
        
        // Ordenar no lado do cliente por enquanto (por data de criação, mais recente primeiro)
        this.goals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        console.log('🔍 FIRESTORE DEBUG - GoalsService carregou', this.goals.length, 'metas do Firestore para usuário:', userId);
        this.goalsSubject.next([...this.goals]);
      },
      error: (error) => {
        console.error('❌ FIRESTORE ERROR - Erro ao carregar metas:', error);
        this.goals = [];
        this.goalsSubject.next([]);
      }
    });
  }

  // Método para recarregar dados quando usuário faz login
  reloadUserData(): void {
    this.loadGoals();
  }
}