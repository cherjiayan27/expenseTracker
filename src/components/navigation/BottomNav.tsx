"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings, Plus } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex items-center justify-around px-4 py-3 safe-area-inset-bottom">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive("/dashboard") ? "text-gray-900" : "text-gray-500"
          }`}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs font-medium">Dashboard</span>
        </Link>
        
        <Link
          href="/dashboard/add-expense"
          className="flex flex-col items-center gap-1 text-gray-500 transition-colors"
        >
          <div className="bg-gray-900 text-white rounded-full p-2">
            <Plus className="h-6 w-6" />
          </div>
          <span className="text-xs font-medium">Add</span>
        </Link>
        
        <Link
          href="/settings"
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive("/settings") ? "text-gray-900" : "text-gray-500"
          }`}
        >
          <Settings className="h-6 w-6" />
          <span className="text-xs font-medium">Settings</span>
        </Link>
      </div>
    </nav>
  );
}

