export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: 'income' | 'expense';
  subcategory?: string;
  tags?: string[];
  recurring?: boolean;
  recurringPeriod?: 'weekly' | 'monthly' | 'yearly';
}

export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  budget?: number;
}

export interface ExpenseSummary {
  totalExpenses: number;
  totalIncome: number;
  balance: number;
  expensesByCategory: { [category: string]: number };
  monthlyTrend: { month: string; amount: number }[];
}
