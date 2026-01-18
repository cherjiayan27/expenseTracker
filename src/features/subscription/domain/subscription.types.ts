// Subscription domain types
// Pure TypeScript types with no external dependencies

export type SubscriptionPeriod = "Yearly" | "Quarterly" | "Monthly";

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  amount: number;
  period: SubscriptionPeriod;
  nextPaymentDate: string;
  isActive: boolean;
  isExpiring: boolean;
  expireDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionInput {
  name: string;
  amount: number;
  period: SubscriptionPeriod;
  nextPaymentDate: string;
  isExpiring: boolean;
}

export interface UpdateSubscriptionInput {
  name?: string;
  amount?: number;
  period?: SubscriptionPeriod;
  nextPaymentDate?: string;
  isExpiring?: boolean;
}

export interface SubscriptionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
