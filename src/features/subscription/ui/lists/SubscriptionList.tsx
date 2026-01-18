"use client";

import { formatCurrency } from "@/features/expenses/domain/formatters/currency.formatter";
import { SwipeableSubscriptionCard } from "../cards/SwipeableSubscriptionCard";
import type { Subscription } from "../../domain/subscription.types";

interface SubscriptionListProps {
  subscriptions: Subscription[];
  showTotals?: boolean;
  onSubscriptionClick?: (sub: Subscription) => void;
  onDeleteSubscription?: (id: string) => void;
}

export function SubscriptionList({ 
  subscriptions, 
  showTotals = true,
  onSubscriptionClick,
  onDeleteSubscription
}: SubscriptionListProps) {
  const yearly = subscriptions.filter((s) => s.period === "Yearly");
  const quarterly = subscriptions.filter((s) => s.period === "Quarterly");
  const monthly = subscriptions.filter((s) => s.period === "Monthly");

  const yearlyTotal = yearly.reduce((acc, s) => acc + s.amount, 0);
  const quarterlyTotal = quarterly.reduce((acc, s) => acc + s.amount, 0);
  const monthlyTotal = monthly.reduce((acc, s) => acc + s.amount, 0);

  return (
    <div className="mt-6">
      {yearly.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Yearly
            </h2>
            {showTotals && (
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(yearlyTotal)}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            {yearly.map((sub) => (
              <SwipeableSubscriptionCard 
                key={sub.id} 
                subscription={sub} 
                onClick={() => onSubscriptionClick?.(sub)}
                onDelete={onDeleteSubscription}
              />
            ))}
          </div>
        </div>
      )}

      {quarterly.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Quarterly
            </h2>
            {showTotals && (
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(quarterlyTotal)}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            {quarterly.map((sub) => (
              <SwipeableSubscriptionCard 
                key={sub.id} 
                subscription={sub} 
                onClick={() => onSubscriptionClick?.(sub)}
                onDelete={onDeleteSubscription}
              />
            ))}
          </div>
        </div>
      )}

      {monthly.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Monthly
            </h2>
            {showTotals && (
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(monthlyTotal)}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            {monthly.map((sub) => (
              <SwipeableSubscriptionCard 
                key={sub.id} 
                subscription={sub} 
                onClick={() => onSubscriptionClick?.(sub)}
                onDelete={onDeleteSubscription}
              />
            ))}
          </div>
        </div>
      )}

      {subscriptions.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No subscriptions found.
        </div>
      )}
    </div>
  );
}
