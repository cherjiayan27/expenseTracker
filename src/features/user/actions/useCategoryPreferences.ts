"use client";

import { useState, useEffect } from "react";
import { mutate } from "swr";
import { createBrowserClient } from "@/server/supabase/client.browser";
import { CATEGORY_IMAGES } from "@/features/categories/domain/category.definitions";
import type { ExpenseCategory, CategoryImage } from "@/features/categories/domain/category.types";
import {
  SELECTION_LIMITS,
  buildDefaultSelectionPaths,
} from "@/features/categories/domain/selectionRules";
import type { CategoryMascotPreferences } from "../domain/preferences.types";
import { saveCategoryMascotPreferences } from "./preferences.actions";
import { emitCategoryPreferencesUpdated } from "./categoryPreferencesEvents";
import { useCategorySelectionState } from "./useCategorySelectionState";

/**
 * Client-side hook for managing category preferences
 * Loads from Supabase and syncs changes back
 */
export function useCategoryPreferences() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const selection = useCategorySelectionState({
    allImages: CATEGORY_IMAGES,
    initialSelectedPaths: buildDefaultSelectionPaths(CATEGORY_IMAGES),
  });

  // Load preferences from Supabase on mount
  useEffect(() => {
    async function loadPreferences() {
      try {
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Not authenticated, use defaults
          setIsAuthenticated(false);
          initializeDefaults();
          setIsLoaded(true);
          return;
        }

        setIsAuthenticated(true);

        const { data, error } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .eq("preference_key", "category_mascots")
          .maybeSingle() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

        if (error) {
          console.error("Error loading preferences:", error);
          initializeDefaults();
        } else if (data && data.preference_value) {
          const prefs = data.preference_value as CategoryMascotPreferences;
          const paths = prefs.selectedImagePaths || [];
          
          if (paths.length < SELECTION_LIMITS.min) {
            initializeDefaults();
          } else {
            selection.replaceSelection(paths.slice(0, SELECTION_LIMITS.max));
          }
        } else {
          // No preferences saved yet, use defaults
          initializeDefaults();
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
        initializeDefaults();
      } finally {
        setIsLoaded(true);
      }
    }

    loadPreferences();
  }, []);

  // Initialize with hardcoded default images
  const initializeDefaults = () => {
    selection.replaceSelection(buildDefaultSelectionPaths(CATEGORY_IMAGES));
  };

  // Save to Supabase (only if authenticated)
  const persistToDatabase = async (paths: string[]) => {
    // Don't try to save if user is not authenticated
    if (!isAuthenticated) {
      // Silently skip saving for unauthenticated users
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveCategoryMascotPreferences(paths);
      if (!result.success) {
        // Only log actual errors, not authentication issues
        if (result.error !== "User not authenticated") {
          console.error("Failed to save preferences:", result.error);
        }
        return;
      }

      const imageByPath = new Map(CATEGORY_IMAGES.map((img) => [img.path, img]));
      const updatedMascots = paths
        .map((path) => imageByPath.get(path))
        .filter((img): img is CategoryImage => Boolean(img));

      mutate("nav-mascots", updatedMascots, false);
    } catch (error) {
      console.error("Error persisting preferences:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Select/add an image to defaults
  const selectImage = (imagePath: string): boolean => {
    const result = selection.selectImage(imagePath);
    if (!result.changed) {
      return false; // Already selected or max limit reached
    }

    persistToDatabase(result.paths);
    emitCategoryPreferencesUpdated();
    return true;
  };

  // Remove an image from defaults
  const removeImage = (imagePath: string): boolean => {
    const result = selection.removeImage(imagePath);
    if (!result.changed) {
      return false; // Min limit reached
    }
    
    persistToDatabase(result.paths);
    emitCategoryPreferencesUpdated();
    return true;
  };

  return {
    isLoaded,
    isSaving,
    getDefaultImages: selection.getDefaultImages,
    getAlternativeImages: selection.getAlternativeImages,
    selectImage,
    removeImage,
    isImageSelected: selection.isImageSelected,
    isMaxReached: selection.isMaxReached,
    isMinReached: selection.isMinReached,
    getSelectionCount: selection.getSelectionCount,
  };
}

