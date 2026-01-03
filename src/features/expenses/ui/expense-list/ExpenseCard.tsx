import type { Expense } from "../../domain/expense.types";
import { formatCurrency } from "../../domain/formatters/currency.formatter";
import { getCategoryImage, getCategoryDisplayName } from "../../domain/expense.helpers";
import Image from "next/image";

type ExpenseCardProps = {
  expense: Expense;
  onClick?: () => void;
};

export function ExpenseCard({ expense, onClick }: ExpenseCardProps) {
  const { amount, description, category, subCategory } = expense;
  const categoryImage = getCategoryImage(category, subCategory);
  const categoryName = getCategoryDisplayName(category);

  // Build the subtitle: "SubCategory • Description" or just one of them
  const subtitleParts = [subCategory, description].filter(Boolean);
  const subtitle = subtitleParts.join(' • ');

  return (
    <div
      className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
      data-testid={`expense-${expense.id}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-gray-100">
          <Image
            src={categoryImage}
            alt={categoryName}
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <h5 className="font-bold text-black text-sm">{categoryName}</h5>
          {subtitle && (
            <p className="text-gray-500 text-xs">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="font-bold text-black text-sm">
        {formatCurrency(amount)}
      </div>
    </div>
  );
}

