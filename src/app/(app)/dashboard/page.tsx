import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  getExpenses,
  calculateMonthToDate,
  MonthToDateCard,
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

      {/* Recent Expenses List */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Expenses
          </h2>
          <Link
            href="/dashboard/add-expense"
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </Link>
        </div>
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
    <div className="relative">
      {/* High-End Grain Texture */}
      <div className="fixed inset-0 opacity-[0.25] pointer-events-none contrast-125 brightness-100 z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilterDashboard">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.6" 
              numOctaves="3" 
              stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilterDashboard)" />
        </svg>
      </div>

      {/* Subtle Ambient Background Detail */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#F5F5F0] blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#F0F0EB] blur-[120px] opacity-40" />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </div>
    </div>
  );
}
