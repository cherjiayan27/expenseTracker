"use client";

import Link from "next/link";
import { Plus, LayoutDashboard, PieChart, History, User, Search, Bell, Heart, Calendar } from "lucide-react";

export function BottomNav() {
  const navItems = [
    { href: "#", icon: LayoutDashboard, label: "Home" },
    { href: "#", icon: PieChart, label: "Analytics" },
    { href: "#", icon: History, label: "History" },
    { href: "#", icon: User, label: "Profile" },
    { href: "#", icon: Search, label: "Search" },
    { href: "#", icon: Bell, label: "Notifications" },
    { href: "#", icon: Heart, label: "Favorites" },
    { href: "#", icon: Calendar, label: "Calendar" },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 md:hidden flex items-center gap-4 w-[90vw] max-w-max">
      {/* Main Navigation Pill */}
      <nav className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-[2rem] shadow-2xl px-2 py-2 overflow-x-auto no-scrollbar flex-1">
        <div className="flex items-center gap-1 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-label={item.label}
                className="flex items-center justify-center w-12 h-12 rounded-2xl text-gray-500 transition-all hover:bg-gray-50 active:scale-90 flex-shrink-0"
              >
                <Icon className="h-6 w-6" />
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Detached Plus Action Button */}
      <Link
        href="/dashboard/add-expense"
        aria-label="Add expense"
        className="flex items-center justify-center w-14 h-14 bg-gray-900 text-white rounded-[1.25rem] shadow-2xl transition-all hover:bg-gray-800 active:scale-95 flex-shrink-0"
      >
        <Plus className="h-8 w-8" />
      </Link>
    </div>
  );
}
