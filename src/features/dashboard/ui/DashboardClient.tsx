"use client";

import { useMemo, useState } from "react";
import { CalendarStrip, BudgetProgress, DashboardLayout } from "@/features/dashboard/ui";
import { useBottomSheetState, useDateFilter } from "@/features/dashboard/hooks";
import { ExpenseList, DebtList, AddExpenseBottomSheet } from "@/features/expenses";
import { filterDebts, filterNonDebts } from "@/features/expenses/domain/calculations/expense-filters";
import type { Expense } from "@/features/expenses/domain/expense.types";
import { BottomNav } from "@/components/navigation/BottomNav";

interface DashboardClientProps {
  expenses: Expense[];
  monthlyBudget: number;
}

export function DashboardClient({ expenses, monthlyBudget }: DashboardClientProps) {
  // Split expenses into debts and regular expenses (memoized to avoid recalculating on every render)
  const allDebts = useMemo(() => filterDebts(expenses), [expenses]);
  const nonDebtExpenses = useMemo(() => filterNonDebts(expenses), [expenses]);
  const [isDebtMultiSelect, setIsDebtMultiSelect] = useState(false);

  // Date filtering and selection (only for non-debt expenses)
  const {
    filteredExpenses,
    totalSpending,
    monthlySpending,
    selectedDate,
    onDateSelect,
  } = useDateFilter(nonDebtExpenses);

  // Bottom sheet state management
  const bottomSheet = useBottomSheetState();
  const handleOpenAddExpense = () => bottomSheet.open(selectedDate);

  return (
    <>
      <DashboardLayout header={<CalendarStrip onDateSelect={onDateSelect} />}>
        <BudgetProgress totalMonthlySpending={monthlySpending} monthlyBudget={monthlyBudget} />
        <div className="mt-16">
        <DebtList debts={allDebts} onMultiSelectChange={setIsDebtMultiSelect} />
        </div>
        <div className="mt-6">
          <ExpenseList
            expenses={filteredExpenses}
            isLoading={false}
            totalSpending={totalSpending}
            onSuccess={bottomSheet.onSuccess}
          />
        </div>
      </DashboardLayout>

      <BottomNav 
        onAddExpense={handleOpenAddExpense} 
        selectedDate={selectedDate}
        isHidden={bottomSheet.isOpen || isDebtMultiSelect}
      />

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
