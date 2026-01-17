import type { Expense } from "../../domain/expense.types";
import { formatCurrency } from "../../domain/formatters/currency.formatter";
import { getCategoryDisplayName } from "../../domain/expense.helpers";

type DebtCardProps = {
  expense: Expense;
  isMultiSelect?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
};

export function DebtCard({
  expense,
  isMultiSelect = false,
  isSelected = false,
  onToggleSelect,
}: DebtCardProps) {
  const { amount, owedTo, category, subCategory } = expense;
  const categoryName = getCategoryDisplayName(category);

  // Get first letter of the person's name for avatar
  const initial = owedTo?.charAt(0).toUpperCase() || "?";

  // Build the subtitle: "Category • SubCategory" or just category
  const subtitleParts = [categoryName, subCategory].filter(Boolean);
  const subtitle = subtitleParts.join(' • ');

  const handleToggle = () => {
    if (!isMultiSelect || !onToggleSelect) return;
    onToggleSelect(expense.id);
  };

  return (
    <div
      className={`flex items-center justify-between ${
        isMultiSelect ? "cursor-pointer" : ""
      }`}
      data-testid={`debt-${expense.id}`}
      onClick={handleToggle}
      role={isMultiSelect ? "button" : undefined}
      aria-pressed={isMultiSelect ? isSelected : undefined}
      tabIndex={isMultiSelect ? 0 : undefined}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleToggle();
        }
      }}
    >
      <div className="flex items-center gap-4">
        {isMultiSelect && (
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
            checked={isSelected}
            onChange={handleToggle}
            onClick={(event) => event.stopPropagation()}
            aria-label={`Select debt ${owedTo ?? "unknown"}`}
          />
        )}
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

