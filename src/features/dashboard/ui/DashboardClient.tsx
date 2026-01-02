"use client";

import { CalendarStrip, BudgetProgress, DashboardLayout } from "@/features/dashboard/ui";
import { useBottomSheetState, useDateFilter } from "@/features/dashboard/hooks";
import { ExpenseList, DebtList } from "@/features/expenses";
import { AddExpenseBottomSheet } from "@/features/expenses/ui/add-expense-bottom-sheet";
import { filterDebts, filterNonDebts } from "@/features/expenses/domain/calculations/expense-filters";
import type { Expense } from "@/features/expenses/domain/expense.types";

interface DashboardClientProps {
  expenses: Expense[];
  monthlyBudget: number;
}

export function DashboardClient({ expenses, monthlyBudget }: DashboardClientProps) {
  // Split expenses into debts and regular expenses
  const allDebts = filterDebts(expenses);
  const nonDebtExpenses = filterNonDebts(expenses);

  // Date filtering and selection (only for non-debt expenses)
  const { filteredExpenses, totalSpending, monthlySpending, onDateSelect } = useDateFilter(nonDebtExpenses);

  // Bottom sheet state management
  const bottomSheet = useBottomSheetState();

  return (
    <>
      <DashboardLayout header={<CalendarStrip onDateSelect={onDateSelect} />}>
        <BudgetProgress totalMonthlySpending={monthlySpending} monthlyBudget={monthlyBudget} />
        <div className="mt-16">
          <DebtList debts={allDebts} />
        </div>
        <div className="mt-6">
          <ExpenseList expenses={filteredExpenses} isLoading={false} totalSpending={totalSpending} />
        </div>
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
