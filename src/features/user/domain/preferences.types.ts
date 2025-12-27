// Types for user preferences
export type PreferenceKey = 'category_mascots';

export interface UserPreference {
  id: string;
  user_id: string;
  preference_key: PreferenceKey;
  preference_value: unknown;
  created_at: string;
  updated_at: string;
}

// Category mascot preferences stored as array of selected image paths
export interface CategoryMascotPreferences {
  selectedImagePaths: string[];
}

// Helper type for preference operations
export interface SavePreferenceInput {
  preference_key: PreferenceKey;
  preference_value: unknown;
}

