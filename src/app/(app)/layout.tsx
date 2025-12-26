import Link from "next/link";
import { LogoutButton } from "@/features/auth";
import { BottomNav } from "@/components/navigation/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Top Navigation - Hidden on mobile, visible on desktop */}
      <nav className="border-b border-gray-200 bg-white hidden md:block">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              Expense Tracker
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/settings"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Settings
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>
      
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      
      {/* Bottom Navigation - Visible on mobile, hidden on desktop */}
      <BottomNav />
    </div>
  );
}

