"use server";

import { createServerClient } from "@/server/supabase/client.server";
import { PreferencesRepository } from "@/features/user/data/preferences.repository";
import type { BudgetPreference } from "../domain/budget.types";

/**
 * Get budget preference for the current user
 * Returns null if no budget is set
 */
export async function getBudgetPreference(): Promise<BudgetPreference | null> {
  try {
    const supabase = await createServerClient();
    
    // Get user first, then pass userId to avoid redundant getUser() in repository
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }
    
    const repo = new PreferencesRepository(supabase);
    const preference = await repo.getPreferenceById(user.id, "monthly_budget");

    if (preference && preference.preference_value) {
      return preference.preference_value as BudgetPreference;
    }

    return null;
  } catch (error) {
    console.error("Error getting budget preference:", error);
    return null;
  }
}

/**
 * Save budget preference for the current user
 */
export async function saveBudgetPreference(
  monthlyBudget: number,
  currency: string = "SGD"
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    // Check if user is authenticated first
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Validate input
    if (monthlyBudget <= 0) {
      return {
        success: false,
        error: "Budget must be greater than 0",
      };
    }

    const repo = new PreferencesRepository(supabase);

    const preferenceValue: BudgetPreference = {
      monthlyBudget,
      currency,
    };

    await repo.savePreference({
      preference_key: "monthly_budget",
      preference_value: preferenceValue,
    });

    return { success: true };
  } catch (error) {
    console.error("Error saving budget preference:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to save budget";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Delete budget preference for the current user
 */
export async function deleteBudgetPreference(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    // Check if user is authenticated first
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const repo = new PreferencesRepository(supabase);
    await repo.deletePreference("monthly_budget");

    return { success: true };
  } catch (error) {
    console.error("Error deleting budget preference:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete budget";
    return {
      success: false,
      error: errorMessage,
    };
  }
}
