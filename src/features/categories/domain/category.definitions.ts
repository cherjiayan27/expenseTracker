// Category definitions and image mappings
// This is the source of truth for all category-related data

// Predefined expense categories
export const EXPENSE_CATEGORIES = [
  "Food & Drinks",
  "Transport",
  "Shopping",
  "Entertainment",
  "Healthcare",
  "Self-Care",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

// Interface for category image metadata
export interface CategoryImage {
  name: string;
  category: ExpenseCategory;
  path: string;
  isDefault?: boolean; // Mark which image is the default for the category
}

// All category images with metadata
export const CATEGORY_IMAGES: readonly CategoryImage[] = [
  // Food & Drinks
  { name: "Beer", category: "Food & Drinks", path: "/categories/food-and-drinks/dragonBeer.png" },
  { name: "Bottled Drink", category: "Food & Drinks", path: "/categories/food-and-drinks/dragonBottledDrink.png" },
  { name: "Bread", category: "Food & Drinks", path: "/categories/food-and-drinks/dragonBread.png" },
  { name: "Breakfast", category: "Food & Drinks", path: "/categories/food-and-drinks/dragonBreakfast.png" },
  { name: "Cake", category: "Food & Drinks", path: "/categories/food-and-drinks/dragonCake.png" },
  { name: "Cereal", category: "Food & Drinks", path: "/categories/food-and-drinks/dragonCereal.png" },
  { name: "Coffee", category: "Food & Drinks", path: "/categories/food-and-drinks/dragonCoffee.png" },
  { name: "Dessert", category: "Food & Drinks", path: "/categories/food-and-drinks/dragonDessert.png" },
  { name: "Dinner", category: "Food & Drinks", path: "/categories/food-and-drinks/dragonDinner.png" },
  { name: "Fruit", category: "Food & Drinks", path: "/categories/food-and-drinks/dragonFruit.png" },
  { name: "Ice Cream", category: "Food & Drinks", path: "/categories/food-and-drinks/dragonIceCream.png" },
  { name: "Lunch", category: "Food & Drinks", path: "/categories/food-and-drinks/dragonLunch.png" },
  { name: "Noodles", category: "Food & Drinks", path: "/categories/food-and-drinks/dragonNoodles.png" },
  { name: "Pudding", category: "Food & Drinks", path: "/categories/food-and-drinks/dragonPudding.png" },
  { name: "Rice", category: "Food & Drinks", path: "/categories/food-and-drinks/dragonRice.png", isDefault: true },
  { name: "Scramble Eggs", category: "Food & Drinks", path: "/categories/food-and-drinks/dragonScrambleEggs.png" },
  { name: "Supper", category: "Food & Drinks", path: "/categories/food-and-drinks/dragonSupper.png" },
  { name: "Tea", category: "Food & Drinks", path: "/categories/food-and-drinks/dragonTea.png" },
  
  // Transport
  { name: "Bus", category: "Transport", path: "/categories/transport/dragonBus.png", isDefault: true },
  { name: "Taxi", category: "Transport", path: "/categories/transport/dragonTaxi.png" },
  { name: "Train", category: "Transport", path: "/categories/transport/dragonTrain.png" },
  
  // Shopping
  { name: "Apparels", category: "Shopping", path: "/categories/shopping/dragonApparels.png" },
  { name: "Electronics", category: "Shopping", path: "/categories/shopping/dragonElectronics.png" },
  { name: "Game & Media", category: "Shopping", path: "/categories/shopping/dragonGame&Media.png" },
  { name: "Grocery", category: "Shopping", path: "/categories/shopping/dragonGrocery.png" },
  { name: "Hobbies", category: "Shopping", path: "/categories/shopping/dragonHobbies.png" },
  { name: "Home & Furniture", category: "Shopping", path: "/categories/shopping/dragonHome&Furniture.png" },
  { name: "Learning & Development", category: "Shopping", path: "/categories/shopping/dragonLearning&Development.png" },
  { name: "Many Items", category: "Shopping", path: "/categories/shopping/dragonShopping.png", isDefault: true },
  { name: "Skincare", category: "Shopping", path: "/categories/shopping/dragonSkincare.png" },
  
  // Entertainment
  { name: "Arcade", category: "Entertainment", path: "/categories/entertainment/dragonArcade.png" },
  { name: "Badminton", category: "Entertainment", path: "/categories/entertainment/dragonBadminton.png" },
  { name: "Bowling", category: "Entertainment", path: "/categories/entertainment/dragonBowling.png", isDefault: true },
  { name: "Boxing", category: "Entertainment", path: "/categories/entertainment/dragonBoxing.png" },
  { name: "Concert", category: "Entertainment", path: "/categories/entertainment/dragonConcert.png" },
  { name: "Karaoke", category: "Entertainment", path: "/categories/entertainment/dragonKaraoke.png" },
  { name: "Yoga", category: "Entertainment", path: "/categories/entertainment/dragonYoga.png" },
  
  // Healthcare
  { name: "Clinic", category: "Healthcare", path: "/categories/healthcare/dragonClinic.png", isDefault: true },
  { name: "Hospital", category: "Healthcare", path: "/categories/healthcare/dragonHospital.png" },
  
  // Self-Care
  { name: "Haircut", category: "Self-Care", path: "/categories/self-care/dragonHaircut.png", isDefault: true },
  { name: "Hair Dye", category: "Self-Care", path: "/categories/self-care/dragonHairDye.png" },
  { name: "Hair Massage", category: "Self-Care", path: "/categories/self-care/dragonHairMassage.png" },
  { name: "Hair Perm", category: "Self-Care", path: "/categories/self-care/dragonHairPerm.png" },
  { name: "Hair Treatment", category: "Self-Care", path: "/categories/self-care/dragonHairTreatment.png" },

  // Other
  { name: "Money Dragon", category: "Other", path: "/images/dragonWithMoney5.png", isDefault: true },
] as const;

// Helper functions

/**
 * Get all images for a specific category
 */
export function getImagesByCategory(category: ExpenseCategory): CategoryImage[] {
  return CATEGORY_IMAGES.filter(img => img.category === category);
}

/**
 * Get a random image for a category
 */
export function getRandomCategoryImage(category: ExpenseCategory): CategoryImage | null {
  const images = getImagesByCategory(category);
  if (images.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex]!;
}

/**
 * Get the default image for a category (marked with isDefault: true)
 * Falls back to the first image if no default is set
 */
export function getDefaultCategoryImage(category: ExpenseCategory): CategoryImage | null {
  const images = getImagesByCategory(category);
  if (images.length === 0) return null;
  
  // Find the image marked as default
  const defaultImage = images.find(img => img.isDefault);
  
  // Return the default image if found, otherwise return the first image
  return defaultImage || images[0]!;
}

/**
 * Find an image by name
 */
export function getImageByName(name: string): CategoryImage | undefined {
  return CATEGORY_IMAGES.find(img => img.name === name);
}

/**
 * Get all unique categories that have images
 */
export function getCategoriesWithImages(): ExpenseCategory[] {
  const categoriesSet = new Set(CATEGORY_IMAGES.map(img => img.category));
  return Array.from(categoriesSet);
}

/**
 * Check if a category has any images
 */
export function categoryHasImages(category: ExpenseCategory): boolean {
  return CATEGORY_IMAGES.some(img => img.category === category);
}

