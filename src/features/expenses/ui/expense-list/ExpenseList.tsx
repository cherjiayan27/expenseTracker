"use client";

import { useState } from "react";
import type { Expense } from "../../domain/expense.types";
import { ExpenseCard } from "./ExpenseCard";
import { ExpenseListLoading } from "./ExpenseListLoading";
import { ExpenseListEmpty } from "./ExpenseListEmpty";
import { EditExpenseModal } from "../edit-expense";

type ExpenseListProps = {
  expenses: Expense[];
  title?: string;
  isLoading?: boolean;
  totalSpending?: number;
  onSuccess?: () => void;
};

// Move formatCurrency outside component to avoid recreation on every render
const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-SG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export function ExpenseList({ expenses, title = "Wins in life", isLoading = false, totalSpending, onSuccess }: ExpenseListProps) {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  if (isLoading) {
    return <ExpenseListLoading title={title} />;
  }

  if (expenses.length === 0) {
    return <ExpenseListEmpty title={title} />;
  }

  return (
    <>
      <div className="w-full mb-8 flex-1" data-testid="container-transactions">
        <div className="border-b border-gray-100 pb-2 mb-4 flex justify-between items-center">
          <h4 className="text-gray-500 font-medium text-sm">{title}</h4>
          {totalSpending !== undefined && (
            <span className="text-gray-700 font-semibold text-sm">
              ${formatCurrency(totalSpending)}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-6 pb-4">
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onClick={() => setSelectedExpense(expense)}
            />
          ))}
        </div>
      </div>

      {selectedExpense && (
        <EditExpenseModal
          expense={selectedExpense}
          isOpen={!!selectedExpense}
          onClose={() => setSelectedExpense(null)}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
}

