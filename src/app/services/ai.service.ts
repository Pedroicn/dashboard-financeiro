import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { AISuggestion, AIAnalysis } from '../models/ai.model';
import { Expense, ExpenseSummary } from '../models/expense.model';
import { Goal } from '../models/goal.model';
import { BudgetLimitService } from './budget-limit.service';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private suggestionsSubject = new BehaviorSubject<AISuggestion[]>([]);
  private budgetLimitService = inject(BudgetLimitService);

  constructor() {
    // As sugestões serão geradas dinamicamente, não precisam ser persistidas
  }

  getSuggestions(): Observable<AISuggestion[]> {
    return this.suggestionsSubject.asObservable();
  }

  generateSuggestions(expenses: Expense[], goals: Goal[], summary: ExpenseSummary): void {
    const suggestions: AISuggestion[] = [];

    // Análise de gastos por categoria
    suggestions.push(...this.analyzeSpendingPatterns(expenses, summary));
    
    // Sugestões baseadas em metas
    suggestions.push(...this.analyzeGoals(goals, summary));
    
    // Análise de tendências
    suggestions.push(...this.analyzeTrends(summary));
    
    // Oportunidades de economia
    suggestions.push(...this.findSavingOpportunities(expenses, summary));

    this.suggestionsSubject.next(suggestions);
  }

  generateDetailedAnalysis(expenses: Expense[], goals: Goal[]): AIAnalysis {
    const monthlySpendingPattern = this.getMonthlySpendingPattern(expenses);
    const recommendations = this.suggestionsSubject.value;
    const budgetOptimization = this.getBudgetOptimization(expenses);
    const savingsOpportunities = this.getSavingsOpportunities(expenses);

    return {
      monthlySpendingPattern,
      recommendations,
      budgetOptimization,
      savingsOpportunities
    };
  }

  private analyzeSpendingPatterns(expenses: Expense[], summary: ExpenseSummary): AISuggestion[] {
    const suggestions: AISuggestion[] = [];
    const budgets = this.budgetLimitService.getDefaultBudgetLimits();

    for (const category of Object.keys(budgets)) {
      const spent = summary.expensesByCategory[category] || 0;
      const budget = budgets[category];
      
      if (spent > budget * 0.8) {
        suggestions.push({
          id: this.generateId(),
          type: 'spending_cut',
          title: `Atenção aos gastos em ${category}`,
          description: `Você já gastou R$ ${spent.toFixed(2)} em ${category} este mês, próximo ao limite de R$ ${budget}.`,
          impact: spent - budget,
          priority: spent > budget ? 'high' : 'medium',
          category,
          actionRequired: `Considere reduzir gastos em ${category} pelos próximos dias.`,
          createdAt: new Date()
        });
      }
    }

    return suggestions;
  }

  private analyzeGoals(goals: Goal[], summary: ExpenseSummary): AISuggestion[] {
    const suggestions: AISuggestion[] = [];
    const activeGoals = goals.filter(g => g.isActive);

    if (activeGoals.length === 0) {
      suggestions.push({
        id: this.generateId(),
        type: 'goal_recommendation',
        title: 'Defina suas metas financeiras',
        description: 'Ter metas claras ajuda a manter o foco e disciplina financeira.',
        impact: 1000,
        priority: 'medium',
        actionRequired: 'Crie pelo menos uma meta financeira.',
        createdAt: new Date()
      });
    }

    // Sugestão baseada no saldo positivo
    if (summary.balance > 500) {
      suggestions.push({
        id: this.generateId(),
        type: 'saving_opportunity',
        title: 'Oportunidade de investimento',
        description: `Você tem um saldo positivo de R$ ${summary.balance.toFixed(2)}. Considere investir parte desse valor.`,
        impact: summary.balance * 0.1, // 10% de retorno estimado
        priority: 'medium',
        actionRequired: 'Destine parte do saldo para suas metas ou investimentos.',
        createdAt: new Date()
      });
    }

    return suggestions;
  }

  private analyzeTrends(summary: ExpenseSummary): AISuggestion[] {
    const suggestions: AISuggestion[] = [];
    const trends = summary.monthlyTrend;

    if (trends.length >= 2) {
      const lastMonth = trends[trends.length - 1];
      const previousMonth = trends[trends.length - 2];
      const increase = lastMonth.amount - previousMonth.amount;

      if (increase > 200) {
        suggestions.push({
          id: this.generateId(),
          type: 'budget_adjustment',
          title: 'Aumento nos gastos detectado',
          description: `Seus gastos aumentaram R$ ${increase.toFixed(2)} comparado ao mês anterior.`,
          impact: increase,
          priority: 'high',
          actionRequired: 'Revise seus gastos recentes e identifique possíveis cortes.',
          createdAt: new Date()
        });
      }
    }

    return suggestions;
  }

  private findSavingOpportunities(expenses: Expense[], summary: ExpenseSummary): AISuggestion[] {
    const suggestions: AISuggestion[] = [];

    // Análise de gastos pequenos frequentes
    const smallExpenses = expenses.filter(e => e.amount < 20 && e.type === 'expense');
    if (smallExpenses.length > 10) {
      const total = smallExpenses.reduce((sum, e) => sum + e.amount, 0);
      suggestions.push({
        id: this.generateId(),
        type: 'spending_cut',
        title: 'Muitos gastos pequenos',
        description: `Você fez ${smallExpenses.length} gastos pequenos totalizando R$ ${total.toFixed(2)}.`,
        impact: total * 0.3,
        priority: 'low',
        actionRequired: 'Considere consolidar compras ou reduzir gastos impulsivos.',
        createdAt: new Date()
      });
    }

    // Sugestão de apps de cashback
    if (summary.totalExpenses > 1000) {
      suggestions.push({
        id: this.generateId(),
        type: 'saving_opportunity',
        title: 'Aproveite cashback',
        description: 'Com seus gastos mensais, você pode economizar usando apps de cashback.',
        impact: summary.totalExpenses * 0.02, // 2% de cashback estimado
        priority: 'low',
        actionRequired: 'Instale apps como Méliuz, Ame ou similar.',
        createdAt: new Date()
      });
    }

    return suggestions;
  }

  private getMonthlySpendingPattern(expenses: Expense[]): any[] {
    const categories = ['Alimentação', 'Transporte', 'Entretenimento', 'Moradia'];
    return categories.map(category => {
      const categoryExpenses = expenses.filter(e => e.category === category && e.type === 'expense');
      const averageAmount = categoryExpenses.length > 0 
        ? categoryExpenses.reduce((sum, e) => sum + e.amount, 0) / categoryExpenses.length 
        : 0;
      
      return {
        category,
        averageAmount,
        trend: 'stable' as const // Simplificado para o exemplo
      };
    });
  }

  private getBudgetOptimization(expenses: Expense[]): any[] {
    return [
      {
        category: 'Alimentação',
        currentBudget: 800,
        suggestedBudget: 700,
        reasoning: 'Baseado no seu padrão de gastos dos últimos meses'
      },
      {
        category: 'Entretenimento',
        currentBudget: 200,
        suggestedBudget: 150,
        reasoning: 'Você pode economizar escolhendo opções mais em conta'
      }
    ];
  }

  private getSavingsOpportunities(expenses: Expense[]): any[] {
    return [
      {
        description: 'Cozinhar mais em casa',
        potentialSavings: 200,
        difficulty: 'easy' as const
      },
      {
        description: 'Usar transporte público',
        potentialSavings: 150,
        difficulty: 'medium' as const
      },
      {
        description: 'Cancelar assinaturas não utilizadas',
        potentialSavings: 100,
        difficulty: 'easy' as const
      }
    ];
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Método para recarregar sugestões quando dados mudarem
  reloadSuggestions(expenses: Expense[], goals: Goal[], summary: ExpenseSummary): void {
    // Gerar novas sugestões
    this.generateSuggestions(expenses, goals, summary);
  }
}
