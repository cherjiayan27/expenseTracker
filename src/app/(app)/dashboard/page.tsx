import { getExpenses } from "@/features/expenses/actions/getExpenses";
import { getBudgetPreference } from "@/features/budget/actions/budget.actions";
import { DashboardClient } from "@/features/dashboard";

export default async function DashboardPage() {
  // Fetch expenses and budget in parallel for better performance
  const [expenses, budgetPreference] = await Promise.all([
    getExpenses(),
    getBudgetPreference(),
  ]);

  // Default to 50 SGD if no budget is set
  const monthlyBudget = budgetPreference?.monthlyBudget ?? 50.0;

  return <DashboardClient expenses={expenses} monthlyBudget={monthlyBudget} />;
}