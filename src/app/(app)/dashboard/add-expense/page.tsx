"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";

function AddExpenseContent() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard main page (bottom sheet now opens via client state)
    router.replace("/dashboard");
  }, [router]);

  return null;
}

export default function AddExpensePage() {
  return (
    <Suspense fallback={null}>
      <AddExpenseContent />
    </Suspense>
  );
}

