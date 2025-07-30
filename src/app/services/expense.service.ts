import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { Expense, ExpenseCategory, ExpenseSummary } from '../models/expense.model';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy } from '@angular/fire/firestore';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private expenses: Expense[] = [];
  private expensesSubject = new BehaviorSubject<Expense[]>([]);

  private categories: ExpenseCategory[] = [
    { id: '1', name: 'Alimentação', color: '#FF6B6B', icon: 'utensils', budget: 800 },
    { id: '2', name: 'Transporte', color: '#4ECDC4', icon: 'car', budget: 400 },
    { id: '3', name: 'Moradia', color: '#45B7D1', icon: 'home', budget: 1200 },
    { id: '4', name: 'Saúde', color: '#96CEB4', icon: 'heart', budget: 300 },
    { id: '5', name: 'Entretenimento', color: '#FFEAA7', icon: 'film', budget: 200 },
    { id: '6', name: 'Educação', color: '#DDA0DD', icon: 'book', budget: 150 },
    { id: '7', name: 'Outros', color: '#95A5A6', icon: 'more-horizontal', budget: 100 }
  ];

  constructor(private storageService: StorageService) {
    // Aguardar um pouco para garantir que a autenticação foi inicializada
    setTimeout(() => {
      this.loadExpenses();
    }, 500);
    
    // Recarregar dados quando o usuário mudar
    this.authService.user$.subscribe(user => {
      console.log('ExpenseService - user changed:', user?.uid);
      // Aguardar um pouco para garantir que a mudança foi processada
      setTimeout(() => {
        this.loadExpenses();
      }, 100);
    });
  }

  getExpenses(): Observable<Expense[]> {
    return this.expensesSubject.asObservable();
  }

  getCategories(): ExpenseCategory[] {
    return this.categories;
  }

  addExpense(expense: Omit<Expense, 'id'>): Observable<void> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuário não está logado');
    }

    const expenseData = {
      ...expense,
      date: expense.date.toISOString(),
      userId
    };

    const expensesRef = collection(this.firestore, 'expenses');
    return from(addDoc(expensesRef, expenseData)).pipe(
      map(() => {
        // Atualizar a lista local
        const newExpense: Expense = {
          ...expense,
          id: Date.now().toString() // temporário até recarregar do Firestore
        };
        this.expenses.push(newExpense);
        this.expensesSubject.next([...this.expenses]);
        this.loadExpenses(); // Recarregar do Firestore
      })
    );
  }

  updateExpense(expense: Expense): Observable<void> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuário não está logado');
    }

    const expenseData = {
      ...expense,
      date: expense.date.toISOString(),
      userId
    };

    const expenseRef = doc(this.firestore, 'expenses', expense.id);
    return from(updateDoc(expenseRef, expenseData)).pipe(
      map(() => {
        // Atualizar a lista local
        const index = this.expenses.findIndex(e => e.id === expense.id);
        if (index !== -1) {
          this.expenses[index] = expense;
          this.expensesSubject.next([...this.expenses]);
        }
      })
    );
  }

  deleteExpense(id: string): Observable<void> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuário não está logado');
    }

    const expenseRef = doc(this.firestore, 'expenses', id);
    return from(deleteDoc(expenseRef)).pipe(
      map(() => {
        // Atualizar a lista local
        this.expenses = this.expenses.filter(e => e.id !== id);
        this.expensesSubject.next([...this.expenses]);
      })
    );
  }

  getExpenseSummary(): ExpenseSummary {
    const totalExpenses = this.expenses
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalIncome = this.expenses
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);

    const expensesByCategory = this.expenses
      .filter(e => e.type === 'expense')
      .reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {} as { [category: string]: number });

    const monthlyTrend = this.getMonthlyTrend();

    return {
      totalExpenses,
      totalIncome,
      balance: totalIncome - totalExpenses,
      expensesByCategory,
      monthlyTrend
    };
  }

  private getMonthlyTrend(): { month: string; amount: number }[] {
    const monthlyData = new Map<string, number>();
    
    this.expenses.forEach(expense => {
      const month = expense.date.toISOString().substring(0, 7); // YYYY-MM
      const current = monthlyData.get(month) || 0;
      const amount = expense.type === 'expense' ? expense.amount : -expense.amount;
      monthlyData.set(month, current + amount);
    });

    return Array.from(monthlyData.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private loadExpenses(): void {
    const userId = this.authService.getCurrentUserId();
    console.log('ExpenseService.loadExpenses - userId:', userId);
    
    if (!userId) {
      console.log('ExpenseService.loadExpenses - no user, loading empty array');
      this.expenses = [];
      this.expensesSubject.next([]);
      return;
    }

    // Primeiro, tentar carregar do localStorage para usuários autenticados
    const stored = this.storageService.getItem('financial-dashboard-expenses');
    if (stored) {
      this.expenses = JSON.parse(stored).map((e: any) => ({
        ...e,
        date: new Date(e.date)
      }));
      console.log('ExpenseService.loadExpenses - loaded from localStorage:', this.expenses.length, 'expenses');
      this.expensesSubject.next([...this.expenses]);
      return;
    }

    // Se não há dados no localStorage, adicionar dados de exemplo
    console.log('ExpenseService.loadExpenses - no localStorage data, adding sample data');
    this.addSampleData();
    
    /* Firestore temporariamente desabilitado para debug
    console.log('ExpenseService.loadExpenses - loading from Firestore for user:', userId);
    
    // Carregar do Firestore
    const expensesRef = collection(this.firestore, 'expenses');
    const q = query(
      expensesRef,
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    from(getDocs(q)).subscribe({
      next: (querySnapshot) => {
        this.expenses = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          this.expenses.push({
            id: doc.id,
            amount: data['amount'],
            description: data['description'],
            category: data['category'],
            date: new Date(data['date']),
            type: data['type'] || 'expense'
          } as Expense);
        });
        
        console.log('ExpenseService.loadExpenses - loaded from Firestore:', this.expenses.length, 'expenses');
        
        // Se for um usuário novo sem dados, adicionar dados de exemplo
        if (this.expenses.length === 0) {
          console.log('ExpenseService.loadExpenses - no data found, adding sample data');
          this.addSampleData();
        } else {
          this.expensesSubject.next([...this.expenses]);
        }
      },
      error: (error) => {
        console.error('Erro ao carregar despesas do Firestore:', error);
        // Fallback para localStorage
        const stored = this.storageService.getItem('financial-dashboard-expenses');
        if (stored) {
          this.expenses = JSON.parse(stored).map((e: any) => ({
            ...e,
            date: new Date(e.date)
          }));
          this.expensesSubject.next([...this.expenses]);
        } else {
          this.expenses = [];
          this.expensesSubject.next([]);
        }
        console.log('ExpenseService.loadExpenses - Firestore error, localStorage fallback, expenses:', this.expenses.length);
      }
    });
    */
  }

  private saveExpenses(): void {
    this.storageService.setItem('financial-dashboard-expenses', JSON.stringify(this.expenses));
  }

  private addSampleData(): void {
    const sampleExpenses: Omit<Expense, 'id'>[] = [
      {
        amount: 45.90,
        description: 'Supermercado',
        category: 'Alimentação',
        date: new Date('2025-07-25'),
        type: 'expense'
      },
      {
        amount: 3500.00,
        description: 'Salário',
        category: 'Outros',
        date: new Date('2025-07-01'),
        type: 'income'
      },
      {
        amount: 25.50,
        description: 'Uber',
        category: 'Transporte',
        date: new Date('2025-07-24'),
        type: 'expense'
      },
      {
        amount: 120.00,
        description: 'Cinema',
        category: 'Entretenimento',
        date: new Date('2025-07-23'),
        type: 'expense'
      }
    ];

    // Adicionar diretamente à lista local temporariamente
    sampleExpenses.forEach(expenseData => {
      const expense: Expense = {
        ...expenseData,
        id: this.generateId()
      };
      this.expenses.push(expense);
    });
    
    console.log('ExpenseService.addSampleData - added sample data:', this.expenses.length);
    this.expensesSubject.next([...this.expenses]);
    this.saveExpenses();
  }

  // Método para recarregar dados quando usuário faz login
  reloadUserData(): void {
    this.loadExpenses();
  }
}
