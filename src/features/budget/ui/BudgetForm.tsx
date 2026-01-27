"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useBudget } from "../actions/useBudget";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function BudgetForm() {
  const { budget, isLoaded, isSaving, isAuthenticated, saveBudget } = useBudget();
  const [isEditing, setIsEditing] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const SLIDER_MAX = 5000;

  // Memoize slider gradient style to avoid recalculation on every render
  const sliderStyle = useMemo(() => ({
    background: `linear-gradient(to right, black 0%, black ${(monthlyBudget / SLIDER_MAX) * 100}%, #F3F4F6 ${(monthlyBudget / SLIDER_MAX) * 100}%, #F3F4F6 100%)`
  }), [monthlyBudget]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, []);

  // Initialize form with existing budget
  useEffect(() => {
    if (budget) {
      setMonthlyBudget(budget.monthlyBudget);
    } else {
      setMonthlyBudget(1200); // Default value as per image
    }
  }, [budget]);

  const handleSubmit = async () => {
    if (monthlyBudget <= 0) {
      setErrorMessage("Please enter a valid budget amount greater than 0");
      setShowError(true);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(() => setShowError(false), 3000);
      return;
    }

    const result = await saveBudget(monthlyBudget, "SGD");

    if (result.success) {
      setIsEditing(false);
    } else {
      setErrorMessage(result.error || "Failed to save budget");
      setShowError(true);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(() => setShowError(false), 3000);
    }
  };

  if (!isLoaded) {
    return (
      <div className="max-w-md mx-auto px-4 pb-16 pt-0">
        <div className="flex flex-col items-center">
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-24 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="w-full mt-8 px-4">
            <div className="h-3 w-full bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="p-6">
        <p className="text-gray-600">Please log in to manage your budget.</p>
      </Card>
    );
  }

  // View Mode: If budget exists and we're not editing
  if (budget && !isEditing) {
    return (
      <div className="max-w-md mx-auto px-4 pb-16 pt-0">
        {/* Error Toast */}
        {showError && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100]">
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 shadow-lg whitespace-nowrap">
              <p className="text-sm font-medium text-red-900">{errorMessage}</p>
            </div>
          </div>
        )}
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold text-gray-200 tracking-tight">
                SGD
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setMonthlyBudget(budget.monthlyBudget);
                setIsEditing(true);
              }}
              className="text-8xl font-black text-gray-900 tracking-tighter hover:opacity-90 transition-opacity"
              title="Edit Budget"
            >
              {budget.monthlyBudget.toLocaleString("en-SG")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Edit/Set Mode
  return (
    <div className="max-w-md mx-auto px-4 pb-28 pt-0">
      <div className="space-y-12">
        <div className="text-center">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold text-gray-200 tracking-tight">SGD</span>
            </div>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="10"
              value={Number.isFinite(monthlyBudget) ? monthlyBudget : 0}
              onChange={(e) => setMonthlyBudget(Number(e.target.value))}
              className="w-full text-center text-7xl font-bold text-gray-900 tracking-tight bg-transparent outline-none appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div className="px-4">
            <div className="relative h-12 flex items-center">
              <input
                type="range"
                min="0"
                max={SLIDER_MAX}
                step="10"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                className="w-full h-3 bg-gray-100 rounded-full appearance-none cursor-pointer accent-black
                  [&::-webkit-slider-runnable-track]:rounded-full
                  [&::-webkit-slider-runnable-track]:h-3
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-8
                  [&::-webkit-slider-thumb]:h-8
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-black
                  [&::-webkit-slider-thumb]:border-4
                  [&::-webkit-slider-thumb]:border-white
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:-mt-[10px]"
                style={sliderStyle}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 bg-white/90 backdrop-blur-sm border-t border-gray-100">
        <div className="max-w-md mx-auto px-4 py-4 flex gap-3">
          {budget && (
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className="flex-1 h-12 rounded-2xl"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isSaving || monthlyBudget <= 0 || !!(budget && monthlyBudget === budget.monthlyBudget)}
            className="flex-1 h-12 text-base font-bold rounded-2xl bg-black hover:bg-gray-800 text-white transition-all shadow-md"
          >
            {isSaving ? "Saving..." : budget ? "Update" : "Confirm Budget"}
          </Button>
        </div>
      </div>
    </div>
  );
}
