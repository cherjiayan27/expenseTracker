"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AddExpenseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Redirect to dashboard with add-expense query parameter
    const date = searchParams.get("date") || "";
    const queryString = date ? `?add-expense=true&date=${date}` : "?add-expense=true";
    router.replace(`/dashboard${queryString}`);
  }, [router, searchParams]);

  return null;
}

export default function AddExpensePage() {
  return (
    <Suspense fallback={null}>
      <AddExpenseContent />
    </Suspense>
  );
}

