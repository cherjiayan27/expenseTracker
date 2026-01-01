"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getNavMascots } from "@/features/user/actions/getNavMascots";
import { getTodayDate } from "@/app/(app)/dashboard/lib/date-utils";
import type { CategoryImage } from "@/features/categories/domain/category.types";

export function BottomNav() {
  const [mascots, setMascots] = useState<CategoryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  
  // Get the currently selected date from URL or default to today
  const selectedDate = searchParams.get("date") || getTodayDate();

  useEffect(() => {
    async function loadMascots() {
      try {
        const navMascots = await getNavMascots();
        setMascots(navMascots);
      } catch (error) {
        console.error("Failed to load nav mascots:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadMascots();

    // Listen for preference updates from Categories page
    const handlePreferenceUpdate = () => {
      loadMascots();
    };
    
    window.addEventListener('categoryPreferencesUpdated', handlePreferenceUpdate);
    
    return () => {
      window.removeEventListener('categoryPreferencesUpdated', handlePreferenceUpdate);
    };
  }, []);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 md:hidden flex items-center gap-4 w-[90vw] max-w-max">
      {/* Main Navigation Pill */}
      <nav className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-[2rem] shadow-2xl px-2 py-2 overflow-x-auto no-scrollbar flex-1">
        <div className="flex items-center gap-1 min-w-max">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 10 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="w-12 h-12 rounded-2xl bg-gray-100 animate-pulse flex-shrink-0"
              />
            ))
          ) : (
            mascots.map((image, index) => (
              <Link
                key={`${image.path}-${index}`}
                href="#"
                aria-label={image.name}
                className="flex items-center justify-center w-12 h-12 rounded-2xl transition-all hover:bg-gray-50 active:scale-90 flex-shrink-0 p-1"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={image.path}
                    alt={image.name}
                    fill
                    className="object-contain"
                    sizes="48px"
                    unoptimized
                  />
                </div>
              </Link>
            ))
          )}
        </div>
      </nav>

      {/* Detached Plus Action Button */}
      <Link
        href={`/dashboard?add-expense=true&date=${selectedDate}`}
        aria-label="Add expense"
        className="flex items-center justify-center w-14 h-14 bg-gray-900 text-white rounded-[1.25rem] shadow-2xl transition-all hover:bg-gray-800 active:scale-95 flex-shrink-0"
      >
        <Plus className="h-8 w-8" />
      </Link>
    </div>
  );
}
