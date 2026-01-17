"use client";

import { BudgetForm } from "@/features/budget";

export default function BudgetPage() {
  return (
    <div className="min-h-screen bg-white pb-32 relative">
      {/* Main Content */}
      <div className="relative z-10 space-y-12 pt-3">
        <section>
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Budget</h1>
            <p className="mt-2 text-gray-600">Set and manage your monthly budget</p>
          </div>

          <BudgetForm />
        </section>
      </div>
    </div>
  );
}
