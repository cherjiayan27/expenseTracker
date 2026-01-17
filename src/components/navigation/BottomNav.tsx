"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { getNavMascots } from "@/features/user/actions/getNavMascots";
import { getTodayDate } from "@/app/(app)/dashboard/lib/date-utils";
import type { CategoryImage } from "@/features/categories/domain/category.types";

interface BottomNavProps {
  onAddExpense?: () => void;
  onMascotTap?: (image: CategoryImage) => void;
  selectedDate?: string;
  isHidden?: boolean;
  pendingMascotPath?: string | null;
}

export function BottomNav({ onAddExpense, onMascotTap, selectedDate, isHidden = false, pendingMascotPath = null }: BottomNavProps) {
  const searchParams = useSearchParams();
  
  // Use SWR for smart caching
  const { data: mascots = [], isLoading, error } = useSWR<CategoryImage[]>(
    'nav-mascots',
    getNavMascots,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  const hasError = !!error;
  
  // Get the currently selected date from URL or default to today
  const selectedDateParam = selectedDate || searchParams.get("date") || getTodayDate();

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 md:hidden ${
      isHidden ? 'translate-y-full pointer-events-none' : 'translate-y-0'
    }`}>
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
              ) : hasError ? (
                // Error state
                <div className="flex items-center justify-center h-full px-4 text-sm text-gray-500">
                  Failed to load mascots
                </div>
              ) : (
                mascots.map((image, index) => {
                  const isPending = pendingMascotPath === image.path;
                  const mascot = (
                    <div className={`relative w-12 h-12 ${isPending ? 'opacity-50' : ''}`}>
                      <Image
                        src={image.path}
                        alt={image.name}
                        fill
                        className="object-contain"
                        sizes="48px"
                        priority={index < 4}
                      />
                    </div>
                  );

                  if (onMascotTap) {
                    return (
                      <button
                        key={`${image.path}-${index}`}
                        type="button"
                        className="flex items-center justify-center w-14 h-14 flex-shrink-0 disabled:cursor-not-allowed"
                        data-testid={`nav-${image.name.toLowerCase().replace(/\s+/g, '-')}`}
                        aria-label={`Quick add ${image.name} expense`}
                        disabled={isPending}
                        onClick={() => onMascotTap(image)}
                      >
                        {mascot}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={`${image.path}-${index}`}
                      href="#"
                      className="flex items-center justify-center w-14 h-14 flex-shrink-0"
                      data-testid={`nav-${image.name.toLowerCase().replace(/\s+/g, '-')}`}
                      aria-label={`${image.name}`}
                    >
                      {mascot}
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {/* Plus Button (triggers Bottom Sheet) */}
          {onAddExpense ? (
            <button
              type="button"
              aria-label="Add expense"
              className="h-20 w-20 bg-[#F3F4F6] rounded-full flex items-center justify-center transition-colors hover:bg-gray-200 flex-shrink-0"
              data-testid="nav-search"
              onClick={onAddExpense}
            >
              <Plus className="h-8 w-8 text-black stroke-[2.5]" />
            </button>
          ) : (
            <Link
              href={`/dashboard?add-expense=true&date=${selectedDateParam}`}
              aria-label="Add expense"
              className="h-20 w-20 bg-[#F3F4F6] rounded-full flex items-center justify-center transition-colors hover:bg-gray-200 flex-shrink-0"
              data-testid="nav-search"
              prefetch={false}
              scroll={false}
            >
              <Plus className="h-8 w-8 text-black stroke-[2.5]" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
