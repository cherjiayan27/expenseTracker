export interface BudgetProgressData {
  totalSpending: number;
  monthlyBudget: number;
  currency: string;
  progressPercentage: number;
}

export interface BudgetProgressProps {
  totalSpending?: number;
  monthlyBudget?: number;
  currency?: string;
}
