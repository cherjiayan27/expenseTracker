import { getExpenses } from "@/features/expenses/actions/getExpenses";
import { DashboardClient } from "@/features/dashboard";

export default async function DashboardPage() {
  // Fetch expenses on the server
  const expenses = await getExpenses();

  return <DashboardClient expenses={expenses} />;
}