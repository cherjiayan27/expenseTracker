"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Settings as SettingsIcon, LogOut } from "lucide-react";
import { useLogout } from "@/features/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout, isPending } = useLogout();

  return (
    <>
      {/* Mobile Header - Only visible on mobile */}
      <header className={cn(
        "fixed top-0 left-0 right-0 bg-white border-b border-gray-200 md:hidden transition-all duration-300",
        isMenuOpen ? "z-[100]" : "z-50"
      )}>
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="transition-opacity hover:opacity-80">
            <span className="text-xl font-extralight tracking-tighter text-gray-900">
              about <span className="font-normal italic uppercase">TIME</span>
            </span>
          </Link>
          
          {/* Hamburger Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 text-gray-700 hover:text-gray-900 focus:outline-none"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Full-Page Overlay Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-white flex flex-col animate-in fade-in duration-200">
            {/* Overlay Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-xl font-extralight tracking-tighter text-gray-900">
                about <span className="font-normal italic uppercase">TIME</span>
              </span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 px-6 py-10 flex flex-col gap-8">
              <Link
                href="/categories"
                className="text-2xl font-medium text-gray-900 hover:text-gray-600 transition-colors flex items-center gap-4"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/budget"
                className="text-2xl font-medium text-gray-900 hover:text-gray-600 transition-colors flex items-center gap-4"
                onClick={() => setIsMenuOpen(false)}
              >
                Budget
              </Link>
            </nav>

            {/* Bottom Section - Logout */}
            <div className="px-6 py-8 border-t border-gray-100 mt-auto bg-gray-50/50 safe-area-inset-bottom">
              <div className="mb-6">
                <Button 
                  variant="default" 
                  className="w-full justify-center gap-3 h-14 text-lg font-medium"
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                  disabled={isPending}
                >
                  {isPending ? "Logging out..." : "Logout"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-[57px] md:hidden" />
    </>
  );
}
