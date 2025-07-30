export interface AISuggestion {
  id: string;
  type: 'spending_cut' | 'saving_opportunity' | 'budget_adjustment' | 'goal_recommendation';
  title: string;
  description: string;
  impact: number; // Impacto financeiro estimado
  priority: 'low' | 'medium' | 'high';
  category?: string;
  actionRequired?: string;
  createdAt: Date;
  isImplemented?: boolean;
}

export interface AIAnalysis {
  monthlySpendingPattern: {
    category: string;
    averageAmount: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }[];
  recommendations: AISuggestion[];
  budgetOptimization: {
    category: string;
    currentBudget: number;
    suggestedBudget: number;
    reasoning: string;
  }[];
  savingsOpportunities: {
    description: string;
    potentialSavings: number;
    difficulty: 'easy' | 'medium' | 'hard';
  }[];
}
