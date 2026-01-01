"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BottomNav } from "@/components/navigation/BottomNav";

function DashboardLayoutContent({
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<>{children}</>}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}

