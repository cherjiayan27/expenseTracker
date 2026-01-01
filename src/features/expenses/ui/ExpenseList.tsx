import type { Expense } from "../domain/expense.types";
import { ExpenseCard } from "./ExpenseCard";
import { ExpenseListLoading } from "./ExpenseListLoading";
import { ExpenseListEmpty } from "./ExpenseListEmpty";

type ExpenseListProps = {
  expenses: Expense[];
  title?: string;
  isLoading?: boolean;
};

export function ExpenseList({ expenses, title = "Wins in life", isLoading = false }: ExpenseListProps) {
  if (isLoading) {
    return <ExpenseListLoading title={title} />;
  }

  if (expenses.length === 0) {
    return <ExpenseListEmpty title={title} />;
  }

  return (
    <div className="w-full mb-8 flex-1 overflow-y-auto" data-testid="container-transactions">
      <div className="border-b border-gray-100 pb-2 mb-4">
        <h4 className="text-gray-500 font-medium text-sm">{title}</h4>
      </div>

      <div className="flex flex-col gap-6 pb-4">
        {expenses.map((expense) => (
          <ExpenseCard key={expense.id} expense={expense} />
        ))}
      </div>
    </div>
  );
}

