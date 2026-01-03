import { useMemo } from "react";
import type { Expense } from "../../domain/expense.types";
import { DebtCard } from "./DebtCard";
import { calculateTotal } from "../../domain/calculations/expense-totals";

type DebtListProps = {
  debts: Expense[];
};

// Move formatCurrency outside component to avoid recreation on every render
const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-SG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export function DebtList({ debts }: DebtListProps) {
  // Calculate total before early return to satisfy Rules of Hooks
  const totalDebts = useMemo(() => calculateTotal(debts), [debts]);

  // Don't render anything if no debts
  if (debts.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-8" data-testid="container-debts">
      <div className="border-b border-gray-100 pb-2 mb-4 flex justify-between items-center">
        <h4 className="text-gray-500 font-medium text-sm">Debts</h4>
        <div className="flex items-center gap-2">
          <span className="text-red-600 font-semibold text-sm">
            ${formatCurrency(totalDebts)}
          </span>
          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
            <svg 
              className="w-3.5 h-3.5 text-red-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" 
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 pb-4">
        {debts.map((debt) => (
          <DebtCard key={debt.id} expense={debt} />
        ))}
      </div>
    </div>
  );
}

