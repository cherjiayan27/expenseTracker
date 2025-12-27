import Link from "next/link";
import { LogoutButton } from "@/features/auth";
import { MobileHeader } from "@/components/navigation/MobileHeader";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - Only visible on mobile */}
      <MobileHeader />
      
      {/* Desktop Top Navigation - Hidden on mobile, visible on desktop */}
      <nav className="border-b border-gray-200 bg-white/95 backdrop-blur-sm hidden md:block relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="transition-opacity hover:opacity-80">
              <span className="text-2xl font-extralight tracking-tighter text-gray-900">
                about <span className="font-normal italic uppercase">TIME</span>
              </span>
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/categories"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Categories
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}

