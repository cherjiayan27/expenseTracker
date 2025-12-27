// Re-export category data from categories feature
// The expenses feature uses categories but doesn't own them

export type {
  ExpenseCategory,
  CategoryImage,
} from "@/features/categories/domain/category.types";

export {
  EXPENSE_CATEGORIES,
  CATEGORY_IMAGES,
  getImagesByCategory,
  getRandomCategoryImage,
  getDefaultCategoryImage,
  getImageByName,
  getCategoriesWithImages,
  categoryHasImages,
} from "@/features/categories/domain/category.data";
