interface ExpenseListLoadingProps {
  title?: string;
}

/**
 * Loading skeleton for expense list
 * Shows 3 animated placeholder items while data is being fetched
 */
export function ExpenseListLoading({ title = "Wins in life" }: ExpenseListLoadingProps) {
  return (
    <div className="w-full mb-8 flex-1 overflow-y-auto" data-testid="container-transactions">
      <div className="border-b border-gray-100 pb-2 mb-4">
        <h4 className="text-gray-500 font-medium text-sm">{title}</h4>
      </div>
      <div className="flex flex-col gap-6 pb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-200" />
              <div className="flex flex-col gap-2">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
