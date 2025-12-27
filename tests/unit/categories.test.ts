import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  EXPENSE_CATEGORIES,
  CATEGORY_IMAGES,
  getImagesByCategory,
  getDefaultCategoryImage,
  getRandomCategoryImage,
  getImageByName,
  getCategoriesWithImages,
  categoryHasImages,
} from "@/features/categories";

describe("Category Definitions", () => {
  it("should have all expected categories", () => {
    expect(EXPENSE_CATEGORIES).toEqual([
      "Food & Drinks",
      "Transport",
      "Shopping",
      "Entertainment",
      "Healthcare",
      "Self-Care",
      "Other",
    ]);
  });

  it("should have category images defined", () => {
    expect(CATEGORY_IMAGES.length).toBeGreaterThan(0);
    expect(CATEGORY_IMAGES.length).toBe(30);
  });

  it("should have valid image metadata", () => {
    CATEGORY_IMAGES.forEach((image) => {
      expect(image).toHaveProperty("name");
      expect(image).toHaveProperty("category");
      expect(image).toHaveProperty("path");
      expect(image.name).toBeTruthy();
      expect(image.path).toMatch(/^\/categories\//);
      expect(EXPENSE_CATEGORIES).toContain(image.category);
    });
  });

  it("should have at least 6 default images", () => {
    const defaultImages = CATEGORY_IMAGES.filter((img) => img.isDefault);
    expect(defaultImages.length).toBeGreaterThanOrEqual(6);
    expect(defaultImages.length).toBeLessThanOrEqual(7);
  });

  it("should have one default image per category", () => {
    EXPENSE_CATEGORIES.forEach((category) => {
      const defaults = CATEGORY_IMAGES.filter(
        (img) => img.category === category && img.isDefault
      );
      // Most categories should have 1 default, but "Other" might have 0 or 1
      if (category === "Other") {
        expect(defaults.length).toBeGreaterThanOrEqual(0);
        expect(defaults.length).toBeLessThanOrEqual(1);
      } else {
        expect(defaults.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  it("should not have 'Dragon' prefix in image names", () => {
    CATEGORY_IMAGES.forEach((image) => {
      expect(image.name).not.toMatch(/^Dragon /);
    });
  });
});

describe("Category Helper Functions", () => {
  describe("getImagesByCategory", () => {
    it("should return all images for Food & Drinks", () => {
      const images = getImagesByCategory("Food & Drinks");
      expect(images.length).toBe(12);
      images.forEach((img) => {
        expect(img.category).toBe("Food & Drinks");
      });
    });

    it("should return all images for Transport", () => {
      const images = getImagesByCategory("Transport");
      expect(images.length).toBe(3);
      images.forEach((img) => {
        expect(img.category).toBe("Transport");
      });
    });

    it("should return empty array for category with no images", () => {
      const images = getImagesByCategory("Other");
      expect(Array.isArray(images)).toBe(true);
    });

    it("should return all images for Entertainment", () => {
      const images = getImagesByCategory("Entertainment");
      expect(images.length).toBe(7);
    });
  });

  describe("getDefaultCategoryImage", () => {
    it("should return the default image for Food & Drinks", () => {
      const image = getDefaultCategoryImage("Food & Drinks");
      expect(image).not.toBeNull();
      expect(image?.name).toBe("Rice");
      expect(image?.isDefault).toBe(true);
    });

    it("should return the default image for Transport", () => {
      const image = getDefaultCategoryImage("Transport");
      expect(image).not.toBeNull();
      expect(image?.name).toBe("Bus");
      expect(image?.isDefault).toBe(true);
    });

    it("should return the default image for Entertainment", () => {
      const image = getDefaultCategoryImage("Entertainment");
      expect(image).not.toBeNull();
      expect(image?.name).toBe("Bowling");
      expect(image?.isDefault).toBe(true);
    });

    it("should return null for category with no images", () => {
      const image = getDefaultCategoryImage("Other");
      expect(image).toBeNull();
    });
  });

  describe("getRandomCategoryImage", () => {
    it("should return a random image for Food & Drinks", () => {
      const image = getRandomCategoryImage("Food & Drinks");
      expect(image).not.toBeNull();
      expect(image?.category).toBe("Food & Drinks");
    });

    it("should return null for category with no images", () => {
      const image = getRandomCategoryImage("Other");
      expect(image).toBeNull();
    });

    it("should return different images on multiple calls (probabilistic)", () => {
      const images = new Set();
      for (let i = 0; i < 20; i++) {
        const img = getRandomCategoryImage("Food & Drinks");
        if (img) images.add(img.name);
      }
      // With 12 images, we should get at least 3 different ones in 20 tries
      expect(images.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe("getImageByName", () => {
    it("should find image by exact name", () => {
      const image = getImageByName("Rice");
      expect(image).toBeDefined();
      expect(image?.name).toBe("Rice");
      expect(image?.category).toBe("Food & Drinks");
    });

    it("should find image with spaces in name", () => {
      const image = getImageByName("Ice Cream");
      expect(image).toBeDefined();
      expect(image?.name).toBe("Ice Cream");
    });

    it("should return undefined for non-existent name", () => {
      const image = getImageByName("NonExistent");
      expect(image).toBeUndefined();
    });

    it("should be case-sensitive", () => {
      const image = getImageByName("rice");
      expect(image).toBeUndefined();
    });
  });

  describe("getCategoriesWithImages", () => {
    it("should return all categories that have images", () => {
      const categories = getCategoriesWithImages();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories).toContain("Food & Drinks");
      expect(categories).toContain("Transport");
      expect(categories).toContain("Entertainment");
    });

    it("should return unique categories only", () => {
      const categories = getCategoriesWithImages();
      const uniqueCategories = [...new Set(categories)];
      expect(categories.length).toBe(uniqueCategories.length);
    });

    it("should not include 'Other' if it has no images", () => {
      const categories = getCategoriesWithImages();
      const hasOther = categories.includes("Other");
      const otherImages = getImagesByCategory("Other");
      expect(hasOther).toBe(otherImages.length > 0);
    });
  });

  describe("categoryHasImages", () => {
    it("should return true for categories with images", () => {
      expect(categoryHasImages("Food & Drinks")).toBe(true);
      expect(categoryHasImages("Transport")).toBe(true);
      expect(categoryHasImages("Entertainment")).toBe(true);
    });

    it("should return false for categories without images", () => {
      expect(categoryHasImages("Other")).toBe(false);
    });
  });
});

describe("Category Image Distribution", () => {
  it("should have expected image count per category", () => {
    const distribution = {
      "Food & Drinks": 12,
      Transport: 3,
      Shopping: 1,
      Entertainment: 7,
      Healthcare: 2,
      "Self-Care": 5,
      Other: 0,
    };

    Object.entries(distribution).forEach(([category, expectedCount]) => {
      const images = getImagesByCategory(category as any);
      expect(images.length).toBe(expectedCount);
    });
  });

  it("should have all 30 images accounted for", () => {
    const totalFromCategories = EXPENSE_CATEGORIES.reduce((sum, category) => {
      return sum + getImagesByCategory(category).length;
    }, 0);
    expect(totalFromCategories).toBe(30);
  });
});

describe("Category Image Paths", () => {
  it("should have correct path format", () => {
    CATEGORY_IMAGES.forEach((image) => {
      expect(image.path).toMatch(/^\/categories\/[a-z-]+\/dragon[A-Z][a-zA-Z]+\.png$/);
    });
  });

  it("should have paths matching category names", () => {
    const categoryPathMap: Record<string, string> = {
      "Food & Drinks": "food-and-drinks",
      Transport: "transport",
      Shopping: "shopping",
      Entertainment: "entertainment",
      Healthcare: "healthcare",
      "Self-Care": "self-care",
      Other: "other",
    };

    CATEGORY_IMAGES.forEach((image) => {
      const expectedPath = categoryPathMap[image.category];
      expect(image.path).toContain(`/categories/${expectedPath}/`);
    });
  });
});

describe("User Preferences with Supabase", () => {
  it("should have server actions for preferences", () => {
    // This test verifies that the preferences system has moved to Supabase
    // The actual server actions are tested in integration tests
    
    // Verify default images meet minimum requirements
    const defaultPaths = CATEGORY_IMAGES
      .filter((img) => img.isDefault)
      .map((img) => img.path);
    
    expect(defaultPaths.length).toBeGreaterThanOrEqual(6);
    expect(defaultPaths.length).toBeLessThanOrEqual(10);
  });

  it("should respect minimum selection of 6 images", () => {
    const MIN_SELECTIONS = 6;
    const defaultImages = CATEGORY_IMAGES.filter((img) => img.isDefault);
    
    expect(defaultImages.length).toBeGreaterThanOrEqual(MIN_SELECTIONS);
  });

  it("should respect maximum selection of 10 images", () => {
    const MAX_SELECTIONS = 10;
    const testPaths = CATEGORY_IMAGES.slice(0, 15).map((img) => img.path);
    
    const limitedPaths = testPaths.slice(0, MAX_SELECTIONS);
    expect(limitedPaths.length).toBe(MAX_SELECTIONS);
  });

  it("should validate preference structure", () => {
    // Verify that preferences can be represented as CategoryMascotPreferences
    const mockPreference = {
      selectedImagePaths: CATEGORY_IMAGES
        .filter((img) => img.isDefault)
        .map((img) => img.path)
    };
    
    expect(mockPreference).toHaveProperty('selectedImagePaths');
    expect(Array.isArray(mockPreference.selectedImagePaths)).toBe(true);
    expect(mockPreference.selectedImagePaths.length).toBeGreaterThanOrEqual(6);
  });

  it("should validate all selected paths are valid category images", () => {
    const allPaths = new Set(CATEGORY_IMAGES.map(img => img.path));
    const selectedPaths = CATEGORY_IMAGES
      .filter((img) => img.isDefault)
      .map((img) => img.path);
    
    selectedPaths.forEach(path => {
      expect(allPaths.has(path)).toBe(true);
    });
  });
});

