import { Suspense } from "react";
import {
  getExpenses,
  calculateMonthToDate,
  MonthToDateCard,
  CreateExpenseForm,
  ExpenseList,
} from "@/features/expenses";

async function DashboardContent() {
  const expenses = await getExpenses();
  const monthTotal = calculateMonthToDate(expenses);
  const recentExpenses = expenses.slice(0, 10);

  return (
    <>
      {/* Month to Date Card */}
      <MonthToDateCard total={monthTotal} />

      {/* Create Expense Form */}
      <div className="mt-8">
        <CreateExpenseForm />
      </div>

      {/* Recent Expenses List */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Expenses
        </h2>
        <ExpenseList expenses={recentExpenses} />
      </div>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <>
      {/* Month to Date Skeleton */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Form Skeleton */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
          <div className="h-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 bg-blue-600 rounded animate-pulse" />
        </div>
      </div>

      {/* List Skeleton */}
      <div className="mt-8">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="mt-2 h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
