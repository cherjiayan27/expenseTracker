// Domain types and schemas
export type { 
  Subscription, 
  SubscriptionPeriod,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  SubscriptionResult 
} from './domain/subscription.types';

export { 
  createSubscriptionSchema, 
  updateSubscriptionSchema 
} from './domain/subscription.schema';

// Domain calculations
export {
  normalizeToMonthly,
  calculateMonthlyCommitment,
  calculateYearlyTotal,
  groupSubscriptionsByPeriod,
  calculatePeriodSubtotal,
} from './domain/calculations/subscription-totals';

// Server Actions (for server components)
export { 
  createSubscription, 
  updateSubscription, 
  deleteSubscription,
  getSubscriptions 
} from './actions';

// Client hooks (for client components)
export { useSubscriptionMutations } from './actions/useSubscriptionMutations';

// UI Components
export { SubscriptionPage } from './ui';
