"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AddExpensePage() {
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

