// Categories feature public API
// This feature handles category display and management

// Types
export type { ExpenseCategory, CategoryImage } from "./domain/category.types";

// Data & Helpers
export {
  EXPENSE_CATEGORIES,
  CATEGORY_IMAGES,
  getImagesByCategory,
  getRandomCategoryImage,
  getDefaultCategoryImage,
  getImageByName,
  getCategoriesWithImages,
  categoryHasImages,
} from "./domain/category.data";

// Hooks
export { useCategoryPreferences } from "./actions/useCategoryPreferences";

// UI Components
export { CategoryCard } from "./ui/CategoryCard";
export { CategoryGrid } from "./ui/CategoryGrid";
export { CategoryImagePicker } from "./ui/CategoryImagePicker";
export { SelectionGrid } from "./ui/SelectionGrid";
export { SelectableImageCard } from "./ui/SelectableImageCard";

