"use client";

import { ChevronRight } from "lucide-react";
import { formatCurrency } from "@/features/expenses/domain/formatters/currency.formatter";

interface BudgetProgressProps {
  totalMonthlySpending?: number;
  monthlyBudget?: number;
  currency?: string;
}

export function BudgetProgress({
  totalMonthlySpending = 20.00,
  monthlyBudget = 50.00,
}: BudgetProgressProps) {
  // Calculate progress percentage (0-100)
  const progressPercentage = monthlyBudget > 0
    ? Math.min((totalMonthlySpending / monthlyBudget) * 100, 100)
    : 0;

  // Semi-circle arc length is approximately 377
  // strokeDashoffset calculation: 377 - (377 * progressPercentage / 100)
  const circumference = 377;
  const strokeDashoffset = circumference - (circumference * progressPercentage / 100);

  // Determine progress color based on percentage
  const getProgressColor = () => {
    if (progressPercentage >= 100) return "#EF4444"; // red-500
    if (progressPercentage >= 80) return "#F59E0B"; // amber-500
    return "#000000"; // black
  };

  return (
    <div className="flex justify-center mb-8 w-full shrink-0" data-testid="container-progress">
      <div className="relative w-80 h-40 flex flex-col items-center justify-end pb-0">
        <svg className="absolute top-0 left-0 w-full h-full overflow-visible" viewBox="0 0 256 128">
          {/* Background Arc */}
          <path
            d="M 8 128 A 120 120 0 0 1 248 128"
            fill="none"
            stroke="#F3F4F6"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Progress Arc */}
          <path
            d="M 8 128 A 120 120 0 0 1 248 128"
            fill="none"
            stroke={getProgressColor()}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: "stroke-dashoffset 0.5s ease-in-out, stroke 0.3s ease-in-out"
            }}
          />
        </svg>
        <div className="text-center z-10 translate-y-8">
          <h3 className="text-base font-sans font-medium text-black mb-0">Total Spending</h3>
          <div className="text-6xl font-sans font-medium text-black leading-tight">
            {formatCurrency(totalMonthlySpending)}
          </div>
          <p className="text-xs text-gray-500 font-sans flex items-center justify-center gap-0.5 mt-1">
            of your {formatCurrency(monthlyBudget)} monthly budget <ChevronRight className="h-3 w-3" />
          </p>
        </div>
      </div>
    </div>
  );
}
