interface ExpenseListEmptyProps {
  title?: string;
  message?: string;
}

/**
 * Empty state for expense list
 * Displayed when there are no expenses to show
 */
export function ExpenseListEmpty({
  title = "Wins in life",
  message = "No expenses yet",
}: ExpenseListEmptyProps) {
  return (
    <div className="w-full mb-8 flex-1 overflow-y-auto" data-testid="container-transactions">
      <div className="border-b border-gray-100 pb-2 mb-4">
        <h4 className="text-gray-500 font-medium text-sm">{title}</h4>
      </div>
      <div className="p-12 text-center">
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}
