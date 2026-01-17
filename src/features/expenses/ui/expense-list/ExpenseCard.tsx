import { useState, useTransition } from "react";
import type { Expense } from "../../domain/expense.types";
import { formatCurrency } from "../../domain/formatters/currency.formatter";
import { getCategoryImage, getCategoryDisplayName } from "../../domain/expense.helpers";
import { updateExpense } from "../../actions/updateExpense";
import Image from "next/image";

type ExpenseCardProps = {
  expense: Expense;
  onClick?: () => void;
};

export function ExpenseCard({ expense, onClick }: ExpenseCardProps) {
  const { amount, description, category, subCategory } = expense;
  const categoryImage = getCategoryImage(category, subCategory);
  const categoryName = getCategoryDisplayName(category);
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [draftAmount, setDraftAmount] = useState("");
  const [isPending, startTransition] = useTransition();

  // Build the subtitle: "SubCategory • Description" or just one of them
  const subtitleParts = [subCategory, description].filter(Boolean);
  const subtitle = subtitleParts.join(' • ');

  const handleRowClick = () => {
    if (isEditingAmount) return;
    onClick?.();
  };

  const startEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setDraftAmount(String(amount));
    setIsEditingAmount(true);
  };

  const cancelEdit = () => {
    setDraftAmount(String(amount));
    setIsEditingAmount(false);
  };

  const commitEdit = () => {
    const trimmed = draftAmount.trim();
    const nextAmount = Number.parseFloat(trimmed);

    if (!trimmed || Number.isNaN(nextAmount)) {
      cancelEdit();
      return;
    }

    if (nextAmount === amount) {
      setIsEditingAmount(false);
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("amount", String(nextAmount));
      // Second param is previousState for useActionState compatibility, not used here
      const result = await updateExpense(expense.id, null, formData);
      if (!result.success) {
        alert(`Failed to update amount: ${result.error}`);
      }
      setIsEditingAmount(false);
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitEdit();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelEdit();
    }
  };

  return (
    <div
      className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
      data-testid={`expense-${expense.id}`}
      onClick={handleRowClick}
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
      {isEditingAmount ? (
        <div
          className={`flex items-center gap-2 ${isPending ? 'opacity-50' : ''}`}
          onClick={(event) => event.stopPropagation()}
        >
          <input
            className="w-20 rounded-md border border-gray-200 px-2 py-1 text-right text-sm font-semibold text-black focus:border-gray-400 focus:outline-none"
            value={draftAmount}
            onChange={(event) => setDraftAmount(event.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            inputMode="decimal"
            enterKeyHint="done"
            autoFocus
            disabled={isPending}
            aria-label="Edit expense amount"
          />
          <button
            type="button"
            className="text-xs font-semibold text-green-600"
            onPointerDown={(event) => event.preventDefault()}
            onClick={(event) => {
              event.stopPropagation();
              commitEdit();
            }}
            disabled={isPending}
          >
            Save
          </button>
          <button
            type="button"
            className="text-xs font-semibold text-gray-500"
            onPointerDown={(event) => event.preventDefault()}
            onClick={(event) => {
              event.stopPropagation();
              cancelEdit();
            }}
            disabled={isPending}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="font-bold text-black text-sm"
          onClick={startEdit}
          aria-label="Edit amount"
        >
          {formatCurrency(amount)}
        </button>
      )}
    </div>
  );
}

