import { Suspense } from "react";
import { getExpenses } from "@/features/expenses/actions/getExpenses";
import { getBudgetPreference } from "@/features/budget/actions/budget.actions";
import { DashboardClient } from "@/features/dashboard";

export default async function DashboardPage() {
  // Fetch expenses and budget on the server
  const expenses = await getExpenses();
  const budgetPreference = await getBudgetPreference();

  // Default to 50 SGD if no budget is set
  const monthlyBudget = budgetPreference?.monthlyBudget ?? 50.0;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardClient expenses={expenses} monthlyBudget={monthlyBudget} />
    </Suspense>
  );
}