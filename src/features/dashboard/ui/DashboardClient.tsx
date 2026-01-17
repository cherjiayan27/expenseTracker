"use client";

import { useMemo, useState, useTransition } from "react";
import { CalendarStrip, BudgetProgress, DashboardLayout } from "@/features/dashboard/ui";
import { useBottomSheetState, useDateFilter } from "@/features/dashboard/hooks";
import { ExpenseList, DebtList, AddExpenseBottomSheet } from "@/features/expenses";
import { filterDebts, filterNonDebts } from "@/features/expenses/domain/calculations/expense-filters";
import type { Expense } from "@/features/expenses/domain/expense.types";
import type { CategoryImage } from "@/features/categories/domain/category.types";
import { createExpense } from "@/features/expenses/actions/createExpense";
import { BottomNav } from "@/components/navigation/BottomNav";
import { getTodayDate } from "@/app/(app)/dashboard/lib/date-utils";

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
  const [, startTransition] = useTransition();
  const [pendingMascot, setPendingMascot] = useState<string | null>(null);

  const handleMascotTap = (image: CategoryImage) => {
    setPendingMascot(image.path);
    const dateToUse = selectedDate || getTodayDate();
    const formData = new FormData();
    formData.append("amount", "1");
    formData.append("category", image.category);
    formData.append("subCategory", image.name);
    formData.append("date", dateToUse);

    startTransition(async () => {
      try {
        const result = await createExpense(undefined, formData);
        if (result.success) {
          bottomSheet.onSuccess();
        } else {
          console.error("Mascot quick add failed:", result.error);
        }
      } catch (error) {
        console.error("Mascot quick add failed:", error);
      } finally {
        setPendingMascot(null);
      }
    });
  };

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
        onMascotTap={handleMascotTap}
        selectedDate={selectedDate}
        isHidden={bottomSheet.isOpen || isDebtMultiSelect}
        pendingMascotPath={pendingMascot}
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
