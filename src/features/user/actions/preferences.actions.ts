"use server";

import { createServerClient } from "@/server/supabase/client.server";
import { PreferencesRepository } from "../data/preferences.repository";
import type { CategoryMascotPreferences } from "../domain/preferences.types";
import { CATEGORY_IMAGES } from "@/features/categories/domain/category.definitions";
import {
  SELECTION_LIMITS,
  validateSelectionCount,
  buildDefaultSelectionPaths,
} from "@/features/categories/domain/selectionRules";

/**
 * Get category mascot preferences for the current user
 * Returns default selections if no preferences exist
 */
export async function getCategoryMascotPreferences(): Promise<string[]> {
  try {
    const supabase = await createServerClient();
    const repo = new PreferencesRepository(supabase);
    
    const preference = await repo.getPreference("category_mascots");
    
    if (preference && preference.preference_value) {
      const prefs = preference.preference_value as CategoryMascotPreferences;
      return prefs.selectedImagePaths || getDefaultImagePaths();
    }
    
    return getDefaultImagePaths();
  } catch (error) {
    console.error("Error getting category mascot preferences:", error);
    return getDefaultImagePaths();
  }
}

/**
 * Save category mascot preferences for the current user
 */
export async function saveCategoryMascotPreferences(
  selectedImagePaths: string[]
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
    const validation = validateSelectionCount(selectedImagePaths);
    if (!validation.ok) {
      return {
        success: false,
        error: validation.error,
      };
    }
    
    const repo = new PreferencesRepository(supabase);
    
    const preferenceValue: CategoryMascotPreferences = {
      selectedImagePaths: selectedImagePaths.slice(0, SELECTION_LIMITS.max),
    };
    
    await repo.savePreference({
      preference_key: "category_mascots",
      preference_value: preferenceValue,
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error saving category mascot preferences:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to save preferences";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Reset category mascot preferences to defaults
 */
export async function resetCategoryMascotPreferences(): Promise<{ success: boolean; error?: string }> {
  try {
    const defaultPaths = getDefaultImagePaths();
    return await saveCategoryMascotPreferences(defaultPaths);
  } catch (error) {
    console.error("Error resetting category mascot preferences:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reset preferences",
    };
  }
}

/**
 * Helper to get default image paths
 */
function getDefaultImagePaths(): string[] {
  return buildDefaultSelectionPaths(CATEGORY_IMAGES);
}

