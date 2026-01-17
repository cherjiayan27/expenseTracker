import { BudgetForm } from "@/features/budget";

export default function BudgetPage() {
  return (
    <div className="min-h-screen bg-white pb-32 relative">
      {/* Main Content */}
      <div className="relative z-10 space-y-8 pt-8">
        <section>
          <div className="mb-6 text-center px-4">
            <div className="flex items-center justify-center gap-3">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Monthly Budget</h1>
            </div>
          </div>

          <BudgetForm />
        </section>
      </div>
    </div>
  );
}
