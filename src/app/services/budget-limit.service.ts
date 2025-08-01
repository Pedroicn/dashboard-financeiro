import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, onSnapshot } from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { BudgetLimit, CategoryBudget } from '../models/budget-limit.model';
import { AuthService } from './auth.service';
import { ExpenseService } from './expense.service';

@Injectable({
  providedIn: 'root'
})
export class BudgetLimitService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private expenseService = inject(ExpenseService);
  
  private budgetLimitsSubject = new BehaviorSubject<BudgetLimit[]>([]);
  private categoryBudgetsSubject = new BehaviorSubject<CategoryBudget[]>([]);

  constructor() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.loadBudgetLimits(user.uid);
        // Também escutar mudanças nas despesas para recalcular orçamentos
        this.expenseService.getExpenses().subscribe(() => {
          const currentLimits = this.budgetLimitsSubject.value;
          if (currentLimits.length > 0) {
            this.calculateCategoryBudgets(currentLimits);
          }
        });
      } else {
        this.budgetLimitsSubject.next([]);
        this.categoryBudgetsSubject.next([]);
      }
    });
  }

  getBudgetLimits(): Observable<BudgetLimit[]> {
    return this.budgetLimitsSubject.asObservable();
  }

  getCategoryBudgets(): Observable<CategoryBudget[]> {
    return this.categoryBudgetsSubject.asObservable();
  }

  private loadBudgetLimits(userId: string): void {
    const budgetLimitsRef = collection(this.firestore, 'budgetLimits');
    const q = query(budgetLimitsRef, where('userId', '==', userId));

    onSnapshot(q, (snapshot) => {
      const budgetLimits: BudgetLimit[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        budgetLimits.push({
          id: doc.id,
          userId: data['userId'],
          categoryName: data['categoryName'],
          monthlyLimit: data['monthlyLimit'],
          createdAt: data['createdAt'].toDate(),
          updatedAt: data['updatedAt'].toDate()
        });
      });

      this.budgetLimitsSubject.next(budgetLimits);
      this.calculateCategoryBudgets(budgetLimits);
    });
  }

  private calculateCategoryBudgets(budgetLimits: BudgetLimit[]): void {
    // Obter gastos do mês atual - agora chamando de forma síncrona sempre que necessário
    const summary = this.expenseService.getExpenseSummary();
    const categoryBudgets: CategoryBudget[] = [];
    
    console.log('🔢 Calculando orçamentos com summary:', summary);
    
    // Para cada categoria com limite definido
    budgetLimits.forEach(limit => {
      // Para gastos, usamos valores absolutos pois são negativos no summary
      const currentSpent = Math.abs(summary.expensesByCategory[limit.categoryName] || 0);
      const remainingBudget = limit.monthlyLimit - currentSpent;
      const percentageUsed = limit.monthlyLimit > 0 ? (currentSpent / limit.monthlyLimit) * 100 : 0;
      
      console.log(`📊 ${limit.categoryName}:`, {
        currentSpent,
        monthlyLimit: limit.monthlyLimit,
        remainingBudget,
        percentageUsed
      });
      
      categoryBudgets.push({
        categoryName: limit.categoryName,
        currentSpent,
        monthlyLimit: limit.monthlyLimit,
        remainingBudget,
        percentageUsed,
        isOverBudget: currentSpent > limit.monthlyLimit
      });
    });

    console.log('💰 Orçamentos calculados:', categoryBudgets);
    this.categoryBudgetsSubject.next(categoryBudgets);
  }

  async setBudgetLimit(categoryName: string, monthlyLimit: number): Promise<void> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('Usuário não autenticado');

    const existingLimits = this.budgetLimitsSubject.value;
    const existingLimit = existingLimits.find(limit => limit.categoryName === categoryName);

    if (existingLimit) {
      // Atualizar limite existente
      const limitRef = doc(this.firestore, 'budgetLimits', existingLimit.id);
      await updateDoc(limitRef, {
        monthlyLimit,
        updatedAt: new Date()
      });
    } else {
      // Criar novo limite
      const budgetLimitsRef = collection(this.firestore, 'budgetLimits');
      await addDoc(budgetLimitsRef, {
        userId: userId,
        categoryName,
        monthlyLimit,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }

  async deleteBudgetLimit(categoryName: string): Promise<void> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) throw new Error('Usuário não autenticado');

    const existingLimits = this.budgetLimitsSubject.value;
    const existingLimit = existingLimits.find(limit => limit.categoryName === categoryName);

    if (existingLimit) {
      const limitRef = doc(this.firestore, 'budgetLimits', existingLimit.id);
      await deleteDoc(limitRef);
    }
  }

  getBudgetLimitForCategory(categoryName: string): number | null {
    const budgetLimits = this.budgetLimitsSubject.value;
    const limit = budgetLimits.find(limit => limit.categoryName === categoryName);
    return limit ? limit.monthlyLimit : null;
  }

  // Método para obter limites padrão para uso no AI Service
  getDefaultBudgetLimits(): { [key: string]: number } {
    const budgetLimits = this.budgetLimitsSubject.value;
    const limits: { [key: string]: number } = {};
    
    budgetLimits.forEach(limit => {
      limits[limit.categoryName] = limit.monthlyLimit;
    });

    // Limites padrão se não houver limites definidos
    const defaultLimits = {
      'Alimentação': 800,
      'Transporte': 400,
      'Entretenimento': 200,
      'Moradia': 1200,
      'Saúde': 300
    };

    // Combinar limites personalizados com padrão
    return { ...defaultLimits, ...limits };
  }

  // Método público para forçar recálculo dos orçamentos
  recalculateBudgets(): void {
    const currentLimits = this.budgetLimitsSubject.value;
    if (currentLimits.length > 0) {
      console.log('🔄 Forçando recálculo dos orçamentos...');
      this.calculateCategoryBudgets(currentLimits);
    }
  }
}
