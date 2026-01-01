"use client";

import { CalendarStrip, BudgetProgress, DashboardLayout } from "@/features/dashboard/ui";
import { useBottomSheetState, useDateFilter } from "@/features/dashboard/hooks";
import { ExpenseList } from "@/features/expenses";
import { AddExpenseBottomSheet } from "@/features/expenses/ui/add-expense-bottom-sheet";
import type { Expense } from "@/features/expenses/domain/expense.types";

interface DashboardClientProps {
  expenses: Expense[];
}

export function DashboardClient({ expenses }: DashboardClientProps) {
  // Date filtering and selection
  const { filteredExpenses, totalSpending, onDateSelect } = useDateFilter(expenses);

  // Bottom sheet state management
  const bottomSheet = useBottomSheetState();

  return (
    <>
      <DashboardLayout header={<CalendarStrip onDateSelect={onDateSelect} />}>
        <BudgetProgress totalSpending={totalSpending} monthlyBudget={50.0} />
        <ExpenseList expenses={filteredExpenses} isLoading={false} />
      </DashboardLayout>

      {/* Bottom Sheet Overlay */}
      {bottomSheet.isOpen && (
        <AddExpenseBottomSheet
          isOpen={bottomSheet.isOpen}
          onClose={bottomSheet.close}
          onSuccess={bottomSheet.onSuccess}
          selectedDate={bottomSheet.selectedDate}
        />
      )}
    </>
  );
}
