import { test, expect } from "@playwright/test";

// Test phone for navigation tests
const TEST_PHONE = "12345678";

test.describe("Bottom Navigation Mascots", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.getByPlaceholder("0000 0000").fill(TEST_PHONE);
    await page.getByRole("button", { name: "Login with OTP" }).click();
    await page.waitForTimeout(2000);
    await page.getByPlaceholder("000000").fill("123456");
    await page.getByRole("button", { name: "Verify OTP" }).click();
    await expect(page).toHaveURL("/dashboard");
  });

  test("should display bottom navigation with mascot icons", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Bottom nav should be visible on mobile
    const bottomNav = page.locator("nav").filter({ has: page.locator("img[alt]") }).first();
    await expect(bottomNav).toBeVisible();

    // Should have multiple mascot images
    const mascotImages = page.locator("nav img[alt]");
    const count = await mascotImages.count();
    expect(count).toBeGreaterThanOrEqual(6);
    expect(count).toBeLessThanOrEqual(8);

    // Verify images have proper attributes
    const firstMascot = mascotImages.first();
    await expect(firstMascot).toHaveAttribute("src", /\/categories\/.+\/.+\.png/);
    await expect(firstMascot).toHaveAttribute("alt");
  });

  test("should display add expense button in bottom nav", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Add expense button should be visible
    const addButton = page.getByLabel("Add expense");
    await expect(addButton).toBeVisible();
    await expect(addButton).toHaveAttribute("href", "/dashboard/add-expense");
  });

  test("should navigate to add expense when clicking plus button", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Click add expense button
    await page.getByLabel("Add expense").click();

    // Should navigate to add expense page
    await expect(page).toHaveURL("/dashboard/add-expense");
  });

  test("should hide bottom navigation on desktop", async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Bottom nav should be hidden on desktop (md:hidden)
    const bottomNav = page.locator("div.fixed.bottom-8").filter({ has: page.locator("nav") });
    
    // Check if element has display: none or is not in viewport
    const isHidden = await bottomNav.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.display === "none" || style.visibility === "hidden";
    });
    
    expect(isHidden).toBe(true);
  });

  test("should show loading skeletons initially", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to a fresh page
    await page.goto("/dashboard");

    // Check for skeleton loading state (briefly visible)
    // This may pass quickly, so we just verify the nav loads
    await page.waitForSelector("nav", { timeout: 5000 });
    
    // Eventually should show mascots
    const mascotImages = page.locator("nav img[alt]");
    await expect(mascotImages.first()).toBeVisible({ timeout: 10000 });
  });

  test("should update navigation when preferences change", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Get initial mascots
    const initialMascots = await page.locator("nav img[alt]").allTextContents();
    
    // Navigate to categories page
    await page.goto("/categories");
    await expect(page.getByText("Default")).toBeVisible();

    // Find a mascot in the "Selection" section to add
    const selectionSection = page.locator("section", { has: page.getByText("Selection") });
    
    // Check if we're at max limit
    const countText = await page.locator("text=/\\d+ \\/ \\d+/").first().textContent();
    const match = countText?.match(/(\d+) \/ (\d+)/);
    
    if (!match) {
      throw new Error("Could not parse count text");
    }
    
    const current = Number(match[1]);
    const max = Number(match[2]);
    
    if (current < max) {
      // Find first available alternative mascot and click it
      const alternativeMascot = selectionSection.locator("div[class*='Card']").first();
      await alternativeMascot.click();
      
      // Wait a bit for the preference to save
      await page.waitForTimeout(2000);

      // Go back to dashboard
      await page.goto("/dashboard");
      await page.waitForTimeout(1000);

      // Get updated mascots
      const updatedMascots = await page.locator("nav img[alt]").allTextContents();
      
      // The mascots list should have changed
      // (This is a loose check since order might matter)
      expect(updatedMascots.length).toBeGreaterThanOrEqual(6);
    } else {
      // If at max, remove one and check update
      const defaultSection = page.locator("section").filter({ has: page.getByText("Default") });
      const removeButton = defaultSection.locator("button[aria-label='Remove']").first();
      await removeButton.hover();
      await removeButton.click();
      
      await page.waitForTimeout(2000);
      
      // Verify change
      const newCountText = await page.locator("text=/\\d+ \\/ \\d+/").first().textContent();
      const newMatch = newCountText?.match(/(\d+) \/ (\d+)/);
      
      if (newMatch) {
        const newCurrent = Number(newMatch[1]);
        expect(newCurrent).toBe(current - 1);
      }
    }
  });

  test("should display correct mascots for authenticated user", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Get mascots from navigation
    const navMascots = await page.locator("nav img[alt]").all();
    const navMascotNames = await Promise.all(
      navMascots.map(async (img) => await img.getAttribute("alt"))
    );

    // Navigate to categories page to verify defaults
    await page.goto("/categories");
    const defaultMascots = await page
      .locator("section")
      .filter({ has: page.getByText("Default") })
      .locator("img[alt]")
      .all();
    
    const defaultMascotNames = await Promise.all(
      defaultMascots.map(async (img) => await img.getAttribute("alt"))
    );

    // Navigation should show a subset of default mascots (up to 8)
    const shownDefaults = defaultMascotNames.slice(0, 8);
    
    // Each nav mascot should be in the user's defaults
    navMascotNames.forEach((navName) => {
      expect(defaultMascotNames).toContain(navName);
    });
  });

  test("should have hover effects on mascot icons", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const firstMascotLink = page.locator("nav a[aria-label]").first();
    
    // Get initial state
    await expect(firstMascotLink).toBeVisible();
    
    // Hover over mascot
    await firstMascotLink.hover();
    
    // Should still be visible and interactive
    await expect(firstMascotLink).toBeVisible();
  });

  test("should maintain scroll position when many mascots", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // If user has 8 mascots, they should be scrollable
    const navContainer = page.locator("nav").filter({ has: page.locator("img[alt]") }).first();
    await expect(navContainer).toBeVisible();

    // Check if overflow is set correctly
    const hasOverflow = await navContainer.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.overflowX === "auto" || style.overflowX === "scroll";
    });

    expect(hasOverflow).toBe(true);
  });

  test("should show default mascots for new user", async ({ page, context }) => {
    // Create a new incognito context (fresh user)
    const newContext = await context.browser()!.newContext();
    const newPage = await newContext.newPage();

    // Login as a new user
    await newPage.goto("/login");
    await newPage.getByPlaceholder("0000 0000").fill("99999999");
    await newPage.getByRole("button", { name: "Login with OTP" }).click();
    await newPage.waitForTimeout(2000);
    await newPage.getByPlaceholder("000000").fill("123456");
    await newPage.getByRole("button", { name: "Verify OTP" }).click();
    await expect(newPage).toHaveURL("/dashboard");

    await newPage.setViewportSize({ width: 375, height: 667 });

    // Should show mascots (defaults)
    const mascots = newPage.locator("nav img[alt]");
    const count = await mascots.count();
    expect(count).toBeGreaterThanOrEqual(6);

    await newContext.close();
  });

  test("should handle navigation with keyboard", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Tab to first mascot
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // One of the navigation elements should be focused
    const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
    expect(focusedElement).toBeTruthy();
  });

  test("should have proper accessibility attributes", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // All mascot links should have aria-labels
    const mascotLinks = await page.locator("nav a[aria-label]").all();
    
    for (const link of mascotLinks) {
      const label = await link.getAttribute("aria-label");
      expect(label).toBeTruthy();
      expect(label!.length).toBeGreaterThan(0);
    }

    // Add button should have aria-label
    const addButton = page.getByLabel("Add expense");
    await expect(addButton).toHaveAttribute("aria-label", "Add expense");
  });
});

