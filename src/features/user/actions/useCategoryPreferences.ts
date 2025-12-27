"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/server/supabase/client.browser";
import { CATEGORY_IMAGES } from "@/features/categories/domain/category.definitions";
import type { ExpenseCategory, CategoryImage } from "@/features/categories/domain/category.types";
import type { CategoryMascotPreferences } from "../domain/preferences.types";
import { saveCategoryMascotPreferences } from "./preferences.actions";

const MAX_SELECTIONS = 10;
const MIN_SELECTIONS = 6;

/**
 * Client-side hook for managing category preferences
 * Loads from Supabase and syncs changes back
 */
export function useCategoryPreferences() {
  const [selectedImagePaths, setSelectedImagePaths] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
          
          if (paths.length < MIN_SELECTIONS) {
            initializeDefaults();
          } else {
            setSelectedImagePaths(paths.slice(0, MAX_SELECTIONS));
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
    const defaultPaths = CATEGORY_IMAGES
      .filter((img) => img.isDefault)
      .map((img) => img.path);
    
    if (defaultPaths.length < MIN_SELECTIONS) {
      const nonDefaultImages = CATEGORY_IMAGES.filter((img) => !img.isDefault);
      const additionalNeeded = MIN_SELECTIONS - defaultPaths.length;
      const additionalPaths = nonDefaultImages
        .slice(0, additionalNeeded)
        .map((img) => img.path);
      setSelectedImagePaths([...defaultPaths, ...additionalPaths].slice(0, MAX_SELECTIONS));
    } else {
      setSelectedImagePaths(defaultPaths.slice(0, MAX_SELECTIONS));
    }
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
      }
    } catch (error) {
      console.error("Error persisting preferences:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Get current default/selected images
  const getDefaultImages = (): CategoryImage[] => {
    return CATEGORY_IMAGES.filter((img) => selectedImagePaths.includes(img.path));
  };

  // Get alternative images (all non-selected images)
  const getAlternativeImages = (category: ExpenseCategory): CategoryImage[] => {
    return CATEGORY_IMAGES.filter(
      (img) => img.category === category && !selectedImagePaths.includes(img.path)
    );
  };

  // Select/add an image to defaults
  const selectImage = (imagePath: string): boolean => {
    if (selectedImagePaths.includes(imagePath)) {
      return false; // Already selected
    }
    
    if (selectedImagePaths.length >= MAX_SELECTIONS) {
      return false; // Max limit reached
    }
    
    const newPaths = [...selectedImagePaths, imagePath];
    setSelectedImagePaths(newPaths);
    persistToDatabase(newPaths);
    return true;
  };

  // Remove an image from defaults
  const removeImage = (imagePath: string): boolean => {
    if (selectedImagePaths.length <= MIN_SELECTIONS) {
      return false; // Min limit reached
    }
    
    const newPaths = selectedImagePaths.filter((path) => path !== imagePath);
    setSelectedImagePaths(newPaths);
    persistToDatabase(newPaths);
    return true;
  };

  // Check if an image is selected
  const isImageSelected = (imagePath: string): boolean => {
    return selectedImagePaths.includes(imagePath);
  };

  // Check if max limit is reached
  const isMaxReached = (): boolean => {
    return selectedImagePaths.length >= MAX_SELECTIONS;
  };

  // Check if min limit is reached
  const isMinReached = (): boolean => {
    return selectedImagePaths.length <= MIN_SELECTIONS;
  };

  // Get current count, min, and max
  const getSelectionCount = () => {
    return {
      current: selectedImagePaths.length,
      min: MIN_SELECTIONS,
      max: MAX_SELECTIONS,
    };
  };

  return {
    isLoaded,
    isSaving,
    getDefaultImages,
    getAlternativeImages,
    selectImage,
    removeImage,
    isImageSelected,
    isMaxReached,
    isMinReached,
    getSelectionCount,
  };
}

