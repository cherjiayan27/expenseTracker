import type { ReactNode } from "react";

interface DashboardLayoutProps {
  header: ReactNode;
  children: ReactNode;
}

/**
 * Main dashboard layout with fixed header and scrollable content
 */
export function DashboardLayout({ header, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Fixed Header */}
      <div className="fixed top-[57px] left-0 right-0 bg-white z-40 px-4 pt-6 pb-2">
        <div className="max-w-2xl mx-auto">{header}</div>
      </div>

      {/* Scrollable Content */}
      <div className="p-4 pt-[80px]">
        <div className="max-w-2xl mx-auto">{children}</div>
      </div>
    </div>
  );
}
