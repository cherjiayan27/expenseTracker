"use server";

import { createServerClient } from "@/server/supabase/client.server";
import { CATEGORY_IMAGES } from "@/features/categories/domain/category.definitions";
import type { CategoryImage } from "@/features/categories/domain/category.types";
import type { CategoryMascotPreferences } from "../domain/preferences.types";
import type { Tables } from "@/shared/types/database.types";

/**
 * Server action to get navigation mascots for the bottom nav
 * Returns the user's selected default mascots or falls back to system defaults
 */
export async function getNavMascots(): Promise<CategoryImage[]> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Return default mascots for unauthenticated users
      return CATEGORY_IMAGES
        .filter((img) => img.isDefault)
        .slice(0, 10);
    }

    const { data } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .eq("preference_key", "category_mascots")
      .maybeSingle<Tables<"user_preferences">>();

    if (data?.preference_value) {
      const prefs = data.preference_value as unknown as CategoryMascotPreferences;
      const paths = prefs.selectedImagePaths || [];
      
      // Map paths to CategoryImage objects
      const mascots = paths
        .map(path => CATEGORY_IMAGES.find(img => img.path === path))
        .filter((img): img is CategoryImage => img !== undefined)
        .slice(0, 10);
      
      if (mascots.length >= 6) {
        return mascots;
      }
    }
    
    // Fallback to default mascots
    return CATEGORY_IMAGES
      .filter((img) => img.isDefault)
      .slice(0, 10);
      
  } catch (error) {
    console.error("Error fetching nav mascots:", error);
    // Return default mascots on error
    return CATEGORY_IMAGES
      .filter((img) => img.isDefault)
      .slice(0, 10);
  }
}

