import { describe, it, expect, vi, beforeEach } from "vitest";
import { getNavMascots } from "@/features/user/actions/getNavMascots";
import { CATEGORY_IMAGES } from "@/features/categories/domain/category.definitions";

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => mockSupabaseClient),
  select: vi.fn(() => mockSupabaseClient),
  eq: vi.fn(() => mockSupabaseClient),
  maybeSingle: vi.fn(),
};

vi.mock("@/server/supabase/client.server", () => ({
  createServerClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

describe("Navigation Mascots", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getNavMascots", () => {
    it("should return default mascots for unauthenticated users", async () => {
      // Mock unauthenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const mascots = await getNavMascots();

      // Should return default mascots
      expect(mascots.length).toBeGreaterThan(0);
      expect(mascots.length).toBeLessThanOrEqual(8);
      
      // All returned mascots should be defaults
      mascots.forEach((mascot) => {
        expect(mascot.isDefault).toBe(true);
      });
    });

    it("should return user's selected mascots when preferences exist", async () => {
      // Mock authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { 
          user: { 
            id: "test-user-id",
            email: "test@example.com"
          } 
        },
        error: null,
      });

      // Mock user preferences with 7 selected mascots
      const selectedPaths = CATEGORY_IMAGES
        .filter(img => img.isDefault)
        .slice(0, 7)
        .map(img => img.path);

      mockSupabaseClient.maybeSingle.mockResolvedValue({
        data: {
          id: "pref-id",
          user_id: "test-user-id",
          preference_key: "category_mascots",
          preference_value: {
            selectedImagePaths: selectedPaths,
          },
        },
        error: null,
      });

      const mascots = await getNavMascots();

      expect(mascots.length).toBe(7);
      expect(mascots.every(m => selectedPaths.includes(m.path))).toBe(true);
    });

    it("should limit returned mascots to maximum of 8", async () => {
      // Mock authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { 
          user: { 
            id: "test-user-id",
            email: "test@example.com"
          } 
        },
        error: null,
      });

      // Mock user preferences with 10 selected mascots
      const selectedPaths = CATEGORY_IMAGES
        .slice(0, 10)
        .map(img => img.path);

      mockSupabaseClient.maybeSingle.mockResolvedValue({
        data: {
          id: "pref-id",
          user_id: "test-user-id",
          preference_key: "category_mascots",
          preference_value: {
            selectedImagePaths: selectedPaths,
          },
        },
        error: null,
      });

      const mascots = await getNavMascots();

      // Should limit to 8 mascots
      expect(mascots.length).toBe(8);
    });

    it("should fallback to defaults if user has less than 6 mascots", async () => {
      // Mock authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { 
          user: { 
            id: "test-user-id",
            email: "test@example.com"
          } 
        },
        error: null,
      });

      // Mock user preferences with only 3 mascots (below minimum)
      const selectedPaths = CATEGORY_IMAGES
        .slice(0, 3)
        .map(img => img.path);

      mockSupabaseClient.maybeSingle.mockResolvedValue({
        data: {
          id: "pref-id",
          user_id: "test-user-id",
          preference_key: "category_mascots",
          preference_value: {
            selectedImagePaths: selectedPaths,
          },
        },
        error: null,
      });

      const mascots = await getNavMascots();

      // Should fallback to defaults
      expect(mascots.length).toBeGreaterThanOrEqual(6);
      expect(mascots.every(m => m.isDefault)).toBe(true);
    });

    it("should fallback to defaults if no preferences exist", async () => {
      // Mock authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { 
          user: { 
            id: "test-user-id",
            email: "test@example.com"
          } 
        },
        error: null,
      });

      // Mock no preferences
      mockSupabaseClient.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const mascots = await getNavMascots();

      // Should return defaults
      expect(mascots.length).toBeGreaterThan(0);
      expect(mascots.every(m => m.isDefault)).toBe(true);
    });

    it("should handle database errors gracefully", async () => {
      // Mock authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { 
          user: { 
            id: "test-user-id",
            email: "test@example.com"
          } 
        },
        error: null,
      });

      // Mock database error
      mockSupabaseClient.maybeSingle.mockResolvedValue({
        data: null,
        error: new Error("Database connection failed"),
      });

      const mascots = await getNavMascots();

      // Should still return defaults despite error
      expect(mascots.length).toBeGreaterThan(0);
      expect(mascots.every(m => m.isDefault)).toBe(true);
    });

    it("should return valid CategoryImage objects", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const mascots = await getNavMascots();

      // Verify structure of returned objects
      mascots.forEach((mascot) => {
        expect(mascot).toHaveProperty("name");
        expect(mascot).toHaveProperty("category");
        expect(mascot).toHaveProperty("path");
        expect(typeof mascot.name).toBe("string");
        expect(typeof mascot.category).toBe("string");
        expect(typeof mascot.path).toBe("string");
        expect(mascot.path).toMatch(/^\/categories\//);
      });
    });

    it("should filter out invalid paths from user preferences", async () => {
      // Mock authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { 
          user: { 
            id: "test-user-id",
            email: "test@example.com"
          } 
        },
        error: null,
      });

      // Mix valid and invalid paths
      const validPaths = CATEGORY_IMAGES.slice(0, 4).map(img => img.path);
      const invalidPaths = ["/invalid/path1.png", "/invalid/path2.png"];
      
      mockSupabaseClient.maybeSingle.mockResolvedValue({
        data: {
          id: "pref-id",
          user_id: "test-user-id",
          preference_key: "category_mascots",
          preference_value: {
            selectedImagePaths: [...validPaths, ...invalidPaths],
          },
        },
        error: null,
      });

      const mascots = await getNavMascots();

      // Should only return valid mascots, fallback if too few
      if (mascots.length === 4) {
        // All returned are valid
        expect(mascots.every(m => validPaths.includes(m.path))).toBe(true);
      } else {
        // Fell back to defaults because invalid paths brought count below 6
        expect(mascots.length).toBeGreaterThanOrEqual(6);
      }
    });
  });

  describe("CategoryImage validation", () => {
    it("should have valid default mascots in CATEGORY_IMAGES", () => {
      const defaultMascots = CATEGORY_IMAGES.filter(img => img.isDefault);
      
      expect(defaultMascots.length).toBeGreaterThanOrEqual(6);
      
      defaultMascots.forEach((mascot) => {
        expect(mascot.name).toBeTruthy();
        expect(mascot.category).toBeTruthy();
        expect(mascot.path).toMatch(/^\/categories\//);
        expect(mascot.isDefault).toBe(true);
      });
    });

    it("should have at least one default mascot per category", () => {
      const categories = ["Food & Drinks", "Transport", "Shopping", "Entertainment", "Healthcare", "Self-Care"];
      
      categories.forEach((category) => {
        const defaultsInCategory = CATEGORY_IMAGES.filter(
          img => img.category === category && img.isDefault
        );
        
        // Most categories should have a default (Other may not have images)
        if (category !== "Other") {
          expect(defaultsInCategory.length).toBeGreaterThan(0);
        }
      });
    });
  });
});

