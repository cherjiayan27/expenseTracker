import { describe, it, expect } from "vitest";
import {
  createExpenseSchema,
  updateExpenseSchema,
} from "@/features/expenses/domain/expense.schema";
import {
  calculateTotal,
  calculateMonthToDate,
  formatCurrency,
  groupByDate,
} from "@/features/expenses/domain/expense.calculations";
import type { Expense } from "@/features/expenses/domain/expense.types";

describe("Expense Schema Validation", () => {
  describe("createExpenseSchema", () => {
    it("should accept valid expense data", () => {
      const validData = {
        amount: 100.50,
        description: "Lunch",
        category: "Food",
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
      category: "Food",
      date: new Date().toISOString().split("T")[0]!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      userId: "user1",
      amount: 50.25,
      description: "Coffee",
      category: "Food",
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

  describe("calculateMonthToDate", () => {
    it("should calculate total for current month only", () => {
      const total = calculateMonthToDate(mockExpenses);
      expect(total).toBe(150.75); // Only first two expenses
    });

    it("should return 0 for empty array", () => {
      const total = calculateMonthToDate([]);
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

