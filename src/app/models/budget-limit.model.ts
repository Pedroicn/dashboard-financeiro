export interface BudgetLimit {
  id: string;
  userId: string;
  categoryName: string;
  monthlyLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryBudget {
  categoryName: string;
  currentSpent: number;
  monthlyLimit: number;
  remainingBudget: number;
  percentageUsed: number;
  isOverBudget: boolean;
}
