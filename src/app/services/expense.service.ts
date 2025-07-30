import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { Expense, ExpenseCategory, ExpenseSummary } from '../models/expense.model';
import { AuthService } from './auth.service';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';

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

  constructor() {
    // Aguardar um pouco para garantir que a autenticação foi inicializada
    setTimeout(() => {
      this.loadExpenses();
    }, 500);
    
    // Recarregar dados quando o usuário mudar
    this.authService.user$.subscribe(user => {
      console.log('ExpenseService - user changed:', user?.uid);
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

    const expenseData: any = {
      amount: Number(expense.amount),
      description: expense.description || '',
      category: expense.category,
      date: expense.date.toISOString(),
      type: expense.type,
      subcategory: expense.subcategory || '',
      tags: expense.tags || [],
      recurring: expense.recurring || false,
      userId
    };

    // Adicionar recurringPeriod apenas se não for undefined
    if (expense.recurringPeriod) {
      expenseData.recurringPeriod = expense.recurringPeriod;
    }

    const expensesRef = collection(this.firestore, 'expenses');
    return from(addDoc(expensesRef, expenseData)).pipe(
      map(() => {
        console.log('Despesa adicionada ao Firestore');
        this.loadExpensesFromFirestore();
      })
    );
  }

  updateExpense(expense: Expense): Observable<void> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuário não está logado');
    }

    const expenseData: any = {
      amount: Number(expense.amount),
      description: expense.description || '',
      category: expense.category,
      date: expense.date.toISOString(),
      type: expense.type,
      subcategory: expense.subcategory || '',
      tags: expense.tags || [],
      recurring: expense.recurring || false,
      userId
    };

    // Adicionar recurringPeriod apenas se não for undefined
    if (expense.recurringPeriod) {
      expenseData.recurringPeriod = expense.recurringPeriod;
    }

    const expenseRef = doc(this.firestore, 'expenses', expense.id);
    return from(updateDoc(expenseRef, expenseData)).pipe(
      map(() => {
        console.log('Despesa atualizada no Firestore');
        this.loadExpensesFromFirestore();
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
        console.log('Despesa excluída do Firestore');
        this.loadExpensesFromFirestore();
      })
    );
  }

  getExpenseSummary(): ExpenseSummary {
    if (this.expenses.length === 0) {
      return {
        totalExpenses: 0,
        totalIncome: 0,
        balance: 0,
        expensesByCategory: {},
        monthlyTrend: []
      };
    }

    // Separar receitas e despesas
    const incomes = this.expenses.filter(expense => expense.type === 'income');
    const expenses = this.expenses.filter(expense => expense.type === 'expense');
    
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const expensesByCategory: { [key: string]: number } = {};
    // Incluir tanto receitas quanto despesas nas categorias (para os gráficos)
    this.expenses.forEach(expense => {
      expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + expense.amount;
    });

    // Calcular tendência mensal (últimos 6 meses)
    const monthlyTrend = this.calculateMonthlyTrend();

    return {
      totalExpenses,
      totalIncome,
      balance: totalIncome - totalExpenses,
      expensesByCategory,
      monthlyTrend
    };
  }

  private calculateMonthlyTrend(): Array<{ month: string; amount: number }> {
    const trend: Array<{ month: string; amount: number }> = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      const monthTransactions = this.expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === date.getMonth() && 
               expenseDate.getFullYear() === date.getFullYear();
      });
      
      // Calcular saldo líquido do mês (receitas - despesas)
      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const monthExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const netAmount = monthIncome - monthExpenses;
      trend.push({ month: monthName, amount: netAmount });
    }
    
    return trend;
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

    this.loadExpensesFromFirestore();
  }

  private loadExpensesFromFirestore(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    console.log('🔍 FIRESTORE DEBUG - Carregando despesas para usuário:', userId);
    
    const expensesRef = collection(this.firestore, 'expenses');
    // Removendo orderBy temporariamente para não precisar do índice composto
    const q = query(expensesRef, where('userId', '==', userId));
    
    from(getDocs(q)).subscribe({
      next: (querySnapshot) => {
        console.log('🔍 FIRESTORE DEBUG - Query executada, documentos encontrados:', querySnapshot.size);
        
        this.expenses = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('🔍 FIRESTORE DEBUG - Documento:', doc.id, {
            userId: data['userId'],
            category: data['category'],
            amount: data['amount'],
            description: data['description'],
            date: data['date']
          });
          
          const expense: Expense = {
            id: doc.id,
            amount: Number(data['amount']),
            description: data['description'] || '',
            category: data['category'],
            date: new Date(data['date']),
            type: data['type'] as 'income' | 'expense',
            subcategory: data['subcategory'] || '',
            tags: data['tags'] || [],
            recurring: data['recurring'] || false,
            recurringPeriod: data['recurringPeriod'] || undefined
          };
          this.expenses.push(expense);
        });
        
        // Ordenar no lado do cliente por enquanto
        this.expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        console.log('🔍 FIRESTORE DEBUG - ExpenseService carregou', this.expenses.length, 'despesas do Firestore para usuário:', userId);
        this.expensesSubject.next([...this.expenses]);
      },
      error: (error) => {
        console.error('❌ FIRESTORE ERROR - Erro ao carregar despesas:', error);
        this.expenses = [];
        this.expensesSubject.next([]);
      }
    });
  }

  // Método para recarregar dados quando usuário faz login
  reloadUserData(): void {
    this.loadExpenses();
  }
}
