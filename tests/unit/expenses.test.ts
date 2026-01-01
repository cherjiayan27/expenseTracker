import { describe, it, expect } from "vitest";
import {
  createExpenseSchema,
  updateExpenseSchema,
} from "@/features/expenses/domain/expense.schema";
import {
  calculateTotal,
} from "@/features/expenses/domain/calculations/expense-totals";
import { formatCurrency } from "@/features/expenses/domain/formatters/currency.formatter";
import { groupByDate } from "@/features/expenses/domain/calculations/expense-filters";
import type { Expense } from "@/features/expenses/domain/expense.types";
import {
  EXPENSE_CATEGORIES,
  CATEGORY_IMAGES,
  getImagesByCategory,
  getDefaultCategoryImage,
  getRandomCategoryImage,
  getImageByName,
  getCategoriesWithImages,
  categoryHasImages,
} from "@/features/categories/domain/category.data";

describe("Expense Schema Validation", () => {
  describe("createExpenseSchema", () => {
    it("should accept valid expense data", () => {
      const validData = {
        amount: 100.50,
        description: "Lunch",
        category: "Food & Drinks",
        date: "2025-01-01",
      };

      const result = createExpenseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject negative amounts", () => {
      const invalidData = {
        amount: -10,
        description: "Test",
      };

      const result = createExpenseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject amounts with more than 2 decimals", () => {
      const invalidData = {
        amount: 10.999,
        description: "Test",
      };

      const result = createExpenseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty description", () => {
      const invalidData = {
        amount: 10.50,
        description: "",
      };

      const result = createExpenseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject description longer than 200 characters", () => {
      const invalidData = {
        amount: 10.50,
        description: "a".repeat(201),
      };

      const result = createExpenseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject future dates", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const futureDate = tomorrow.toISOString().split("T")[0];

      const invalidData = {
        amount: 10.50,
        description: "Test",
        date: futureDate,
      };

      const result = createExpenseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept today's date", () => {
      const today = new Date().toISOString().split("T")[0];

      const validData = {
        amount: 10.50,
        description: "Test",
        date: today,
      };

      const result = createExpenseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("updateExpenseSchema", () => {
    it("should accept partial updates", () => {
      const partialData = {
        amount: 50.00,
      };

      const result = updateExpenseSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });
  });
});

describe("Expense Calculations", () => {
  const mockExpenses: Expense[] = [
    {
      id: "1",
      userId: "user1",
      amount: 100.50,
      description: "Lunch",
      category: "Food & Drinks",
      date: new Date().toISOString().split("T")[0]!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      userId: "user1",
      amount: 50.25,
      description: "Coffee",
      category: "Food & Drinks",
      date: new Date().toISOString().split("T")[0]!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      userId: "user1",
      amount: 200.00,
      description: "Shopping",
      category: "Shopping",
      date: "2024-12-25", // Last month
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  describe("calculateTotal", () => {
    it("should calculate total of all expenses", () => {
      const total = calculateTotal(mockExpenses);
      expect(total).toBe(350.75);
    });

    it("should return 0 for empty array", () => {
      const total = calculateTotal([]);
      expect(total).toBe(0);
    });
  });

  describe("formatCurrency", () => {
    it("should format amount as SGD currency", () => {
      expect(formatCurrency(100.50)).toMatch(/\$100\.50/);
      expect(formatCurrency(1000)).toMatch(/1,000\.00/);
    });

    it("should handle zero amount", () => {
      expect(formatCurrency(0)).toMatch(/\$0\.00/);
    });

    it("should handle large amounts", () => {
      expect(formatCurrency(1234567.89)).toMatch(/1,234,567\.89/);
    });
  });

  describe("groupByDate", () => {
    it("should group expenses by date", () => {
      const grouped = groupByDate(mockExpenses);
      const today = new Date().toISOString().split("T")[0]!;

      expect(grouped.size).toBe(2);
      expect(grouped.get(today)?.length).toBe(2);
      expect(grouped.get("2024-12-25")?.length).toBe(1);
    });

    it("should return empty map for empty array", () => {
      const grouped = groupByDate([]);
      expect(grouped.size).toBe(0);
    });
  });
});

describe("Category Functions", () => {
  it("should export all expense categories", () => {
    expect(EXPENSE_CATEGORIES).toHaveLength(7);
    expect(EXPENSE_CATEGORIES).toContain("Food & Drinks");
    expect(EXPENSE_CATEGORIES).toContain("Transport");
    expect(EXPENSE_CATEGORIES).toContain("Shopping");
    expect(EXPENSE_CATEGORIES).toContain("Entertainment");
    expect(EXPENSE_CATEGORIES).toContain("Healthcare");
    expect(EXPENSE_CATEGORIES).toContain("Self-Care");
    expect(EXPENSE_CATEGORIES).toContain("Other");
  });

  it("should have category images defined", () => {
    expect(CATEGORY_IMAGES.length).toBeGreaterThan(0);
    expect(CATEGORY_IMAGES.length).toBe(30); // Total number of images (12+3+1+7+2+5)
  });

  describe("getImagesByCategory", () => {
    it("should return images for a specific category", () => {
      const foodImages = getImagesByCategory("Food & Drinks");
      expect(foodImages.length).toBe(12);
      expect(foodImages.every(img => img.category === "Food & Drinks")).toBe(true);
    });

    it("should return empty array for category with no images", () => {
      const otherImages = getImagesByCategory("Other");
      expect(otherImages).toEqual([]);
    });

    it("should return correct number of images per category", () => {
      expect(getImagesByCategory("Transport").length).toBe(3);
      expect(getImagesByCategory("Shopping").length).toBe(1);
      expect(getImagesByCategory("Entertainment").length).toBe(7);
      expect(getImagesByCategory("Healthcare").length).toBe(2);
      expect(getImagesByCategory("Self-Care").length).toBe(5);
    });
  });

  describe("getDefaultCategoryImage", () => {
    it("should return the default image for Food & Drinks", () => {
      const defaultImage = getDefaultCategoryImage("Food & Drinks");
      expect(defaultImage).not.toBeNull();
      expect(defaultImage?.name).toBe("Dragon Rice");
      expect(defaultImage?.isDefault).toBe(true);
    });

    it("should return the default image for Transport", () => {
      const defaultImage = getDefaultCategoryImage("Transport");
      expect(defaultImage).not.toBeNull();
      expect(defaultImage?.name).toBe("Dragon Bus");
      expect(defaultImage?.isDefault).toBe(true);
    });

    it("should return null for category with no images", () => {
      const defaultImage = getDefaultCategoryImage("Other");
      expect(defaultImage).toBeNull();
    });

    it("should have a default image for all categories with images", () => {
      const categoriesWithImages = ["Food & Drinks", "Transport", "Shopping", "Entertainment", "Healthcare", "Self-Care"];
      
      for (const category of categoriesWithImages) {
        const defaultImage = getDefaultCategoryImage(category as any);
        expect(defaultImage).not.toBeNull();
      }
    });
  });

  describe("getRandomCategoryImage", () => {
    it("should return an image from the category", () => {
      const randomImage = getRandomCategoryImage("Food & Drinks");
      expect(randomImage).not.toBeNull();
      expect(randomImage?.category).toBe("Food & Drinks");
    });

    it("should return null for category with no images", () => {
      const randomImage = getRandomCategoryImage("Other");
      expect(randomImage).toBeNull();
    });

    it("should return different images on multiple calls (probabilistic)", () => {
      const images = new Set();
      // Try 20 times to get different images from Food & Drinks (which has 12 images)
      for (let i = 0; i < 20; i++) {
        const img = getRandomCategoryImage("Food & Drinks");
        if (img) images.add(img.name);
      }
      // Should have gotten at least 2 different images
      expect(images.size).toBeGreaterThan(1);
    });
  });

  describe("getImageByName", () => {
    it("should find image by name", () => {
      const image = getImageByName("Dragon Coffee");
      expect(image).toBeDefined();
      expect(image?.category).toBe("Food & Drinks");
      expect(image?.path).toBe("/categories/food-and-drinks/dragonCoffee.png");
    });

    it("should return undefined for non-existent image", () => {
      const image = getImageByName("Dragon Unicorn");
      expect(image).toBeUndefined();
    });
  });

  describe("getCategoriesWithImages", () => {
    it("should return all categories that have images", () => {
      const categories = getCategoriesWithImages();
      expect(categories).toContain("Food & Drinks");
      expect(categories).toContain("Transport");
      expect(categories).toContain("Shopping");
      expect(categories).toContain("Entertainment");
      expect(categories).toContain("Healthcare");
      expect(categories).toContain("Self-Care");
      expect(categories).not.toContain("Other");
    });

    it("should return 6 categories with images", () => {
      const categories = getCategoriesWithImages();
      expect(categories.length).toBe(6);
    });
  });

  describe("categoryHasImages", () => {
    it("should return true for categories with images", () => {
      expect(categoryHasImages("Food & Drinks")).toBe(true);
      expect(categoryHasImages("Transport")).toBe(true);
      expect(categoryHasImages("Healthcare")).toBe(true);
    });

    it("should return false for categories without images", () => {
      expect(categoryHasImages("Other")).toBe(false);
    });
  });
});

