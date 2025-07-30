export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  category: string;
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalProgress {
  goalId: string;
  percentage: number;
  remainingAmount: number;
  daysRemaining: number;
  monthlyRequiredSaving: number;
  onTrack: boolean;
}
