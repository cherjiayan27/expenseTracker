import type { Expense } from "../domain/expense.types";
import { formatCurrency, formatDate } from "../domain/expense.calculations";
import { Card } from "@/components/ui/card";

type ExpenseCardProps = {
  expense: Expense;
};

export function ExpenseCard({ expense }: ExpenseCardProps) {
  const { amount, description, category, date } = expense;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {description}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            <span>{formatDate(date)}</span>
            {category && (
              <>
                <span>•</span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
                  {category}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-base font-semibold text-gray-900">
            {formatCurrency(amount)}
          </p>
        </div>
      </div>
    </Card>
  );
}

