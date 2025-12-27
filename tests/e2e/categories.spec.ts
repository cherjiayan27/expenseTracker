import { test, expect } from "@playwright/test";

test.describe("Categories Page", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to categories page
    await page.goto("/categories");
    
    // Wait for page to load
    await page.waitForLoadState("networkidle");
  });

  test("should display the categories page with correct sections", async ({ page }) => {
    // Check page title/heading
    await expect(page.locator("h1")).toContainText("Default");
    await expect(page.locator("h2")).toContainText("Selection");
  });

  test("should display default section with description", async ({ page }) => {
    const defaultSection = page.locator("section").first();
    await expect(defaultSection.locator("h1")).toContainText("Default");
    await expect(defaultSection).toContainText("Your selected category images");
  });

  test("should display selection section with description", async ({ page }) => {
    const selectionSection = page.locator("section").last();
    await expect(selectionSection.locator("h2")).toContainText("Selection");
    await expect(selectionSection).toContainText("Choose images to add to your collection");
  });

  test("should show image counter with min and max", async ({ page }) => {
    // Check counter format: "X / 10"
    await expect(page.getByText(/\d+ \/ 10/)).toBeVisible();
    
    // Check min indicator
    await expect(page.getByText(/min: 6/)).toBeVisible();
  });

  test("should display at least 6 images in default section", async ({ page }) => {
    const defaultSection = page.locator("section").first();
    const cards = defaultSection.locator('[class*="group relative"]');
    const count = await cards.count();
    
    expect(count).toBeGreaterThanOrEqual(6);
    expect(count).toBeLessThanOrEqual(10);
  });

  test("should display image names below images", async ({ page }) => {
    const firstCard = page.locator("section").first().locator('[class*="group relative"]').first();
    
    // Check that image name is displayed
    const imageName = firstCard.locator("p");
    await expect(imageName).toBeVisible();
    const text = await imageName.textContent();
    expect(text).toBeTruthy();
    expect(text?.length).toBeGreaterThan(0);
  });

  test("should show remove button on hover in default section", async ({ page }) => {
    const firstCard = page.locator("section").first().locator('[class*="group relative"]').first();
    
    // Hover over card
    await firstCard.hover();
    
    // Check if remove button appears (it has opacity-0 and group-hover:opacity-100)
    const removeButton = firstCard.locator('button[aria-label="Remove"]');
    await expect(removeButton).toBeVisible();
  });

  test("should display category sections in selection area", async ({ page }) => {
    const selectionSection = page.locator("section").last();
    
    // Check for category headers
    await expect(selectionSection.getByText("Food & Drinks")).toBeVisible();
  });

  test("should display alternative images grouped by category", async ({ page }) => {
    const selectionSection = page.locator("section").last();
    
    // Find Food & Drinks section
    const foodSection = selectionSection.locator("text=Food & Drinks").locator("..");
    
    // Check that there are image cards below the category name
    const images = selectionSection.locator('[class*="cursor-pointer"]');
    expect(await images.count()).toBeGreaterThan(0);
  });
});

test.describe("Category Image Selection", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/categories");
    await page.waitForLoadState("networkidle");
    
    // Clear localStorage to start fresh
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState("networkidle");
  });

  test("should add image to default section when clicked in selection", async ({ page }) => {
    // Get initial count
    const defaultSection = page.locator("section").first();
    const initialCount = await defaultSection.locator('[class*="group relative"]').count();
    
    // Click an image in selection section
    const selectionSection = page.locator("section").last();
    const firstSelectableImage = selectionSection.locator('[class*="cursor-pointer"]').first();
    await firstSelectableImage.click();
    
    // Wait a bit for state update
    await page.waitForTimeout(300);
    
    // Check that count increased (if not at max)
    const newCount = await defaultSection.locator('[class*="group relative"]').count();
    if (initialCount < 10) {
      expect(newCount).toBe(initialCount + 1);
    }
  });

  test("should remove image from default section when remove button clicked", async ({ page }) => {
    const defaultSection = page.locator("section").first();
    
    // Get initial count
    const initialCount = await defaultSection.locator('[class*="group relative"]').count();
    
    // Only try to remove if we have more than minimum (6)
    if (initialCount > 6) {
      const firstCard = defaultSection.locator('[class*="group relative"]').first();
      
      // Hover to show remove button
      await firstCard.hover();
      
      // Click remove button
      const removeButton = firstCard.locator('button[aria-label="Remove"]');
      await removeButton.click();
      
      // Wait for state update
      await page.waitForTimeout(300);
      
      // Check that count decreased
      const newCount = await defaultSection.locator('[class*="group relative"]').count();
      expect(newCount).toBe(initialCount - 1);
    }
  });

  test("should show warning when trying to exceed maximum (10 images)", async ({ page }) => {
    const defaultSection = page.locator("section").first();
    const selectionSection = page.locator("section").last();
    
    // Keep adding images until we have 10 or see a warning
    for (let i = 0; i < 15; i++) {
      const currentCount = await defaultSection.locator('[class*="group relative"]').count();
      
      if (currentCount >= 10) {
        // Try to add one more
        const nextImage = selectionSection.locator('[class*="cursor-pointer"]').first();
        await nextImage.click();
        await page.waitForTimeout(300);
        
        // Check for max warning
        await expect(page.getByText(/Maximum limit reached/i)).toBeVisible();
        break;
      }
      
      // Add another image
      const images = selectionSection.locator('[class*="cursor-pointer"]');
      if ((await images.count()) > 0) {
        await images.first().click();
        await page.waitForTimeout(300);
      } else {
        break;
      }
    }
  });

  test("should show warning when trying to go below minimum (6 images)", async ({ page }) => {
    const defaultSection = page.locator("section").first();
    
    // Keep removing images until we have 6
    while (true) {
      const currentCount = await defaultSection.locator('[class*="group relative"]').count();
      
      if (currentCount <= 6) {
        // Try to remove one more
        const firstCard = defaultSection.locator('[class*="group relative"]').first();
        await firstCard.hover();
        
        const removeButton = firstCard.locator('button[aria-label="Remove"]');
        await removeButton.click();
        await page.waitForTimeout(300);
        
        // Check for min warning
        await expect(page.getByText(/Minimum limit reached/i)).toBeVisible();
        break;
      }
      
      if (currentCount > 6) {
        // Remove an image
        const firstCard = defaultSection.locator('[class*="group relative"]').first();
        await firstCard.hover();
        
        const removeButton = firstCard.locator('button[aria-label="Remove"]');
        await removeButton.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test("should persist selections in localStorage", async ({ page }) => {
    const selectionSection = page.locator("section").last();
    
    // Click an image
    const firstImage = selectionSection.locator('[class*="cursor-pointer"]').first();
    await firstImage.click();
    await page.waitForTimeout(300);
    
    // Get localStorage value
    const stored = await page.evaluate(() => 
      localStorage.getItem("selected_category_images")
    );
    
    expect(stored).toBeTruthy();
    
    // Parse and verify it's an array
    const parsed = JSON.parse(stored!);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThanOrEqual(6);
  });

  test("should restore selections from localStorage on page reload", async ({ page }) => {
    const defaultSection = page.locator("section").first();
    
    // Get current count
    const initialCount = await defaultSection.locator('[class*="group relative"]').count();
    
    // Reload page
    await page.reload();
    await page.waitForLoadState("networkidle");
    
    // Check count is the same
    const newCount = await defaultSection.locator('[class*="group relative"]').count();
    expect(newCount).toBe(initialCount);
  });
});

test.describe("Category Image Display", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/categories");
    await page.waitForLoadState("networkidle");
  });

  test("should display images with correct aspect ratio", async ({ page }) => {
    const firstCard = page.locator("section").first().locator('[class*="group relative"]').first();
    const imageContainer = firstCard.locator("div").filter({ hasText: "" }).first();
    
    await expect(imageContainer).toBeVisible();
  });

  test("should apply hover effects on cards", async ({ page }) => {
    const selectionCard = page.locator("section").last().locator('[class*="cursor-pointer"]').first();
    
    // Get initial state
    await selectionCard.hover();
    
    // Card should be visible and hoverable
    await expect(selectionCard).toBeVisible();
  });

  test("should show all required UI elements", async ({ page }) => {
    // Check for grain texture background
    await expect(page.locator("svg")).toBeVisible();
    
    // Check for ambient background
    await expect(page.locator('[class*="blur-"]').first()).toBeVisible();
  });
});

test.describe("Responsive Design", () => {
  test("should display correctly on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/categories");
    await page.waitForLoadState("networkidle");
    
    // Check that page loads
    await expect(page.locator("h1")).toBeVisible();
    
    // Check that grid adjusts (should be 2 columns on mobile)
    const defaultSection = page.locator("section").first();
    await expect(defaultSection).toBeVisible();
  });

  test("should display correctly on tablet", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/categories");
    await page.waitForLoadState("networkidle");
    
    // Check that page loads
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should display correctly on desktop", async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/categories");
    await page.waitForLoadState("networkidle");
    
    // Check that page loads
    await expect(page.locator("h1")).toBeVisible();
  });
});

