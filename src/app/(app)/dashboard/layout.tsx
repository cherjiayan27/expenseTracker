"use client";

import { useSearchParams } from "next/navigation";
import { BottomNav } from "@/components/navigation/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const isBottomSheetOpen = searchParams.get("add-expense") === "true";

  return (
    <>
      {children}
      {!isBottomSheetOpen && <BottomNav />}
    </>
  );
}

