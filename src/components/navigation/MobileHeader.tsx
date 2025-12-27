"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Settings as SettingsIcon } from "lucide-react";
import { LogoutButton } from "@/features/auth";

export function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Header - Only visible on mobile */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 md:hidden z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="transition-opacity hover:opacity-80">
            <span className="text-xl font-extralight tracking-tighter text-gray-900">
              about <span className="font-normal italic uppercase">Time</span>
            </span>
          </Link>
          
          {/* Hamburger Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-gray-700 hover:text-gray-900 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black/20 z-40 top-[57px]"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Menu Content */}
            <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
              <div className="py-2">
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <SettingsIcon className="h-5 w-5" />
                  <span className="font-medium">Settings</span>
                </Link>
                
                <div className="px-4 py-3 border-t border-gray-100">
                  <LogoutButton />
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-[57px] md:hidden" />
    </>
  );
}

