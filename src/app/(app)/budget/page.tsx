"use client";

import { BudgetForm } from "@/features/budget";

export default function BudgetPage() {
  return (
    <div className="relative">
      {/* High-End Grain Texture */}
      <div className="fixed inset-0 opacity-[0.25] pointer-events-none contrast-125 brightness-100 z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilterBudget">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.6"
              numOctaves="3"
              stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilterBudget)" />
        </svg>
      </div>

      {/* Subtle Ambient Background Detail */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#F5F5F0] blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#F0F0EB] blur-[120px] opacity-40" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 space-y-12">
        {/* Budget Overview Section */}
        <section>
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Budget</h1>
                <p className="mt-2 text-gray-600">Set and manage your monthly budget</p>
              </div>
            </div>
          </div>

          <BudgetForm />
        </section>
      </div>
    </div>
  );
}
