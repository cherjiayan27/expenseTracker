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
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Bottom Actions Container */}
      <div className="w-full pb-8 shrink-0 px-4">
        {/* Navigation Bar */}
        <div className="flex items-center gap-2">
          {/* Main Nav Pill - Scrollable */}
          <div className="flex-1 bg-[#F3F4F6] h-20 rounded-[2.5rem] px-6 overflow-x-auto no-scrollbar">
            <div className="flex items-center justify-start gap-4 h-full min-w-max">
              {isLoading ? (
                // Loading skeleton - 4 items
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="flex items-center justify-center w-14 h-14 flex-shrink-0"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gray-200 animate-pulse" />
                  </div>
                ))
              ) : (
                mascots.map((image, index) => (
                  <Link
                    key={`${image.path}-${index}`}
                    href="#"
                    className="flex items-center justify-center w-14 h-14 flex-shrink-0"
                    data-testid={`nav-${image.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="relative w-12 h-12">
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
          </div>

          {/* Plus Button (triggers Bottom Sheet) */}
          <Link
            href={`/dashboard?add-expense=true&date=${selectedDate}`}
            aria-label="Add expense"
            className="h-20 w-20 bg-[#F3F4F6] rounded-full flex items-center justify-center transition-colors hover:bg-gray-200 flex-shrink-0"
            data-testid="nav-search"
          >
            <Plus className="h-8 w-8 text-black stroke-[2.5]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
