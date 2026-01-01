"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/server/supabase/client.browser";
import type { BudgetPreference } from "../domain/budget.types";
import { saveBudgetPreference, deleteBudgetPreference } from "./budget.actions";

/**
 * Client-side hook for managing budget preferences
 * Loads from Supabase and syncs changes back
 */
export function useBudget() {
  const [budget, setBudget] = useState<BudgetPreference | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load budget from Supabase on mount
  useEffect(() => {
    async function loadBudget() {
      try {
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          // Not authenticated
          setIsAuthenticated(false);
          setIsLoaded(true);
          return;
        }

        setIsAuthenticated(true);

        const { data, error } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .eq("preference_key", "monthly_budget")
          .maybeSingle() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

        if (error) {
          console.error("Error loading budget:", error);
        } else if (data && data.preference_value) {
          const budgetPref = data.preference_value as BudgetPreference;
          setBudget(budgetPref);
        }
      } catch (error) {
        console.error("Error loading budget:", error);
      } finally {
        setIsLoaded(true);
      }
    }

    loadBudget();
  }, []);

  // Save budget to Supabase
  const saveBudget = async (monthlyBudget: number, currency: string = "SGD") => {
    if (!isAuthenticated) {
      return { success: false, error: "User not authenticated" };
    }

    setIsSaving(true);
    try {
      const result = await saveBudgetPreference(monthlyBudget, currency);
      if (result.success) {
        setBudget({ monthlyBudget, currency });
      }
      return result;
    } catch (error) {
      console.error("Error saving budget:", error);
      return { success: false, error: "Failed to save budget" };
    } finally {
      setIsSaving(false);
    }
  };

  // Delete budget
  const deleteBudget = async () => {
    if (!isAuthenticated) {
      return { success: false, error: "User not authenticated" };
    }

    setIsSaving(true);
    try {
      const result = await deleteBudgetPreference();
      if (result.success) {
        setBudget(null);
      }
      return result;
    } catch (error) {
      console.error("Error deleting budget:", error);
      return { success: false, error: "Failed to delete budget" };
    } finally {
      setIsSaving(false);
    }
  };

  return {
    budget,
    isLoaded,
    isSaving,
    isAuthenticated,
    saveBudget,
    deleteBudget,
  };
}
