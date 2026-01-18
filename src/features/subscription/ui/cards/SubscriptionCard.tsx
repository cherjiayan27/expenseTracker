"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/features/expenses/domain/formatters/currency.formatter";
import { formatDate } from "@/features/expenses/domain/formatters/date.formatter";
import type { Subscription } from "../../domain/subscription.types";

interface SubscriptionCardProps {
  subscription: Subscription;
  onClick?: () => void;
}

export function SubscriptionCard({ subscription, onClick }: SubscriptionCardProps) {
  return (
    <Card 
      onClick={subscription.isActive ? onClick : undefined}
      className={`overflow-hidden border-none shadow-sm transition-colors ${
        subscription.isActive 
          ? subscription.isExpiring 
            ? "bg-amber-50/50 border-amber-100 border hover:bg-amber-50 cursor-pointer" 
            : "bg-white hover:bg-gray-50 cursor-pointer" 
          : "bg-gray-50/50 opacity-80"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold ${subscription.isActive ? "text-gray-900" : "text-gray-500"}`}>
                {subscription.name}
              </h3>
              {subscription.isExpiring && (
                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Expiring
                </span>
              )}
            </div>
            <div className="mt-1">
              {subscription.isActive ? (
                <div className="flex gap-3">
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">
                      {subscription.isExpiring ? "Expires:" : "Renewal:"}
                    </span>{" "}
                    {formatDate(subscription.nextPaymentDate)}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Expired:</span>{" "}
                    {formatDate(subscription.expireDate || subscription.nextPaymentDate)}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className={`font-bold ${subscription.isActive ? "text-gray-900" : "text-gray-500"}`}>
              {formatCurrency(subscription.amount)}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
              {subscription.period === "Yearly" ? "per year" : subscription.period === "Quarterly" ? "per quarter" : "per month"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
