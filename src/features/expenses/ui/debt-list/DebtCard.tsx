import type { Expense } from "../../domain/expense.types";
import { formatCurrency } from "../../domain/formatters/currency.formatter";
import { getCategoryDisplayName } from "../../domain/expense.helpers";

type DebtCardProps = {
  expense: Expense;
};

export function DebtCard({ expense }: DebtCardProps) {
  const { amount, owedTo, category, subCategory } = expense;
  const categoryName = getCategoryDisplayName(category);

  // Get first letter of the person's name for avatar
  const initial = owedTo?.charAt(0).toUpperCase() || "?";

  // Build the subtitle: "SubCategory • Category" or just category
  const subtitleParts = [subCategory, categoryName].filter(Boolean);
  const subtitle = subtitleParts.join(' • ');

  return (
    <div className="flex items-center justify-between" data-testid={`debt-${expense.id}`}>
      <div className="flex items-center gap-4">
        {/* Avatar with initial */}
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100">
          <span className="font-bold text-red-600 text-lg">{initial}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <h5 className="font-bold text-black text-sm">{owedTo}</h5>
          {subtitle && (
            <p className="text-gray-500 text-xs">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="font-bold text-red-600 text-sm">
        {formatCurrency(amount)}
      </div>
    </div>
  );
}

