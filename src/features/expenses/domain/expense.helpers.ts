import { CATEGORY_IMAGES, getImageByName } from "@/features/categories/domain/category.definitions";
import type { ExpenseCategory } from "@/features/categories/domain/category.types";

/**
 * Get the image path for an expense
 * If subCategory is provided, use that specific image
 * Otherwise, use the default category image
 */
export function getCategoryImage(category: string | null, subCategory?: string | null): string {
  // If sub-category is provided, try to find its specific image
  if (subCategory) {
    const subCategoryImage = getImageByName(subCategory);
    if (subCategoryImage) {
      return subCategoryImage.path;
    }
  }

  // No sub-category or sub-category image not found, use default category image
  if (!category) {
    // Return a default "Other" category image
    const otherImage = CATEGORY_IMAGES.find(
      (img) => img.category === "Other" && img.isDefault
    );
    return otherImage?.path || "/categories/other/dragonOther.png";
  }

  // Find the default image for the category
  const categoryImage = CATEGORY_IMAGES.find(
    (img) => img.category === category && img.isDefault
  );

  if (categoryImage) {
    return categoryImage.path;
  }

  // Fallback: find any image for the category
  const anyImage = CATEGORY_IMAGES.find((img) => img.category === category);
  if (anyImage) {
    return anyImage.path;
  }

  // Final fallback
  return "/categories/other/dragonOther.png";
}

/**
 * Get category display name (formatted)
 */
export function getCategoryDisplayName(category: string | null): string {
  return category || "Other";
}

/**
 * Format time from ISO date string (e.g., "2:30 PM" or "Today")
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  // Check if it's today
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return "Today";
  }

  // Check if it's yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return "Yesterday";
  }

  // Format as date (e.g., "Dec 30")
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
