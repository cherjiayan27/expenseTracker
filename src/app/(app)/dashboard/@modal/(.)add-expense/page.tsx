"use client";

import { useRouter } from "next/navigation";

export default function AddExpenseModal() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Add Expense</h2>
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <p className="mt-2 text-gray-600">
          Intercepting route modal (Phase 2)
        </p>
        <div className="mt-4 rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            This modal will be implemented in Phase 2 using parallel and
            intercepting routes.
          </p>
        </div>
      </div>
    </div>
  );
}

