// Actions
export { 
  getCategoryMascotPreferences,
  saveCategoryMascotPreferences,
  resetCategoryMascotPreferences,
} from "./actions/preferences.actions";

export { getNavMascots } from "./actions/getNavMascots";

export { useCategoryPreferences } from "./actions/useCategoryPreferences";

// Types
export type {
  UserPreference,
  PreferenceKey,
  SavePreferenceInput,
  CategoryMascotPreferences,
} from "./domain/preferences.types";

// Repository
export { PreferencesRepository } from "./data/preferences.repository";

