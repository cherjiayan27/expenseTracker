// Types for budget preferences

export interface BudgetPreference {
  monthlyBudget: number;
  currency?: string;
}

export interface BudgetPreferenceDb {
  id: string;
  user_id: string;
  preference_key: 'monthly_budget';
  preference_value: BudgetPreference;
  created_at: string;
  updated_at: string;
}

export interface SaveBudgetInput {
  monthlyBudget: number;
  currency?: string;
}
