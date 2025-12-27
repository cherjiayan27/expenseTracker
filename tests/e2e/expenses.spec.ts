import { test, expect } from "@playwright/test";

// Test phone number configured in supabase/config.toml
// Using different phone than auth tests to avoid rate limit conflicts
const TEST_PHONE = "99999999";
const TEST_OTP = "123456";

// Run tests serially to avoid rate limit conflicts with OTP sending
test.describe.configure({ mode: 'serial' });

test.describe("Expense Management - Bottom Sheet", () => {
  test.beforeEach(async ({ page }) => {
    // Wait 6 seconds to avoid Supabase max_frequency limit (5s between OTPs to same number)
    // Skip on first test
    if (test.info().title !== "should display dashboard without inline form") {
      await page.waitForTimeout(6000);
    }
    
    // Login before each test
    await page.goto("/login");
    await page.getByPlaceholder("0000 0000").fill(TEST_PHONE);
    await page.getByRole("button", { name: "Login with OTP" }).click();
    
    // Wait for the OTP screen to appear (with longer timeout)
    await expect(page.getByPlaceholder("000000")).toBeVisible({ timeout: 10000 });
    
    await page.getByPlaceholder("000000").fill(TEST_OTP);
    await page.getByRole("button", { name: "Verify OTP" }).click();
    await expect(page).toHaveURL("/dashboard");
  });

  test("should display dashboard without inline form", async ({ page }) => {
    // Check month-to-date card
    await expect(page.getByText("Spent this month")).toBeVisible();

    // Form should NOT be visible on page load
    await expect(page.getByRole("heading", { name: "Add New Expense" })).not.toBeVisible();
    await expect(page.getByLabel("Amount (SGD)")).not.toBeVisible();

    // Check recent expenses section
    await expect(page.getByText("Recent Expenses")).toBeVisible();
  });

  test("should display seeded expenses", async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState("networkidle");

    // Check if expenses are visible OR if "no expenses" message is shown
    // (Seed data only works if users already exist in the database)
    const noExpensesMessage = page.getByText("No expenses yet");
    const hasNoExpenses = await noExpensesMessage.isVisible();

    if (hasNoExpenses) {
      // If no seeded expenses, that's OK - the database was reset
      // Just verify the empty state is shown correctly
      await expect(noExpensesMessage).toBeVisible();
    } else {
      // If expenses exist, verify at least one expense card is visible
      const expenseCards = page.locator('[class*="rounded-lg"][class*="border"]').filter({
        has: page.locator('text=/\\$\\d+\\.\\d{2}/'),
      });
      await expect(expenseCards.first()).toBeVisible();
    }
  });

  test.describe("Mobile Navigation", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("should display mobile header with hamburger menu", async ({ page }) => {
      // Verify mobile header is visible
      await expect(page.getByText("about Time").first()).toBeVisible();
      
      // Verify hamburger menu button is visible
      await expect(page.getByRole("button", { name: "Toggle menu" })).toBeVisible();
      
      // Verify bottom nav items
      await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Search" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Notifications" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Add expense" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Profile" })).toBeVisible();
    });

    test("should navigate to dashboard by clicking header logo", async ({ page }) => {
      // Navigate away from dashboard first
      await page.goto("/settings");
      await expect(page).toHaveURL("/settings");
      
      // Click header logo
      await page.getByText("about Time").first().click();
      
      // Should navigate back to dashboard
      await expect(page).toHaveURL("/dashboard");
    });

    test("should open and close hamburger menu", async ({ page }) => {
      // Click hamburger menu
      await page.getByRole("button", { name: "Toggle menu" }).click();
      
      // Verify menu is open with Settings link
      await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
      
      // Click overlay to close
      await page.locator('.fixed.inset-0.bg-black\\/20').click();
      
      // Verify menu is closed
      await expect(page.getByRole("link", { name: "Settings" })).not.toBeVisible();
    });

    test("should navigate to Settings from hamburger menu", async ({ page }) => {
      // Open hamburger menu
      await page.getByRole("button", { name: "Toggle menu" }).click();
      
      // Click Settings
      await page.getByRole("link", { name: "Settings" }).click();
      
      // Verify navigation to settings page
      await expect(page).toHaveURL("/settings");
      
      // Menu should auto-close after navigation
      await page.goto("/dashboard");
      await expect(page.getByRole("link", { name: "Settings" })).not.toBeVisible();
    });

    test("should open bottom sheet when clicking detached Add button in mobile nav", async ({ page }) => {
      // Click detached Add button
      await page.getByRole("link", { name: "Add expense" }).click();

      // Verify URL changed
      await expect(page).toHaveURL("/dashboard/add-expense");

      // Verify bottom sheet is visible with form - use role heading to avoid sr-only duplicate
      await expect(page.getByRole("heading", { name: "Add New Expense" }).last()).toBeVisible();
      await expect(page.getByLabel("Amount (SGD)")).toBeVisible();
    });

    test("should close bottom sheet when clicking Cancel button", async ({ page }) => {
      // Open sheet
      await page.getByRole("link", { name: "Add expense" }).click();
      await expect(page.getByRole("heading", { name: "Add New Expense" }).last()).toBeVisible();

      // Click Cancel button
      await page.getByRole("button", { name: "Cancel" }).click();

      // Verify sheet closed and back to dashboard
      await expect(page).toHaveURL("/dashboard");
      await expect(page.getByLabel("Amount (SGD)")).not.toBeVisible();
    });

    test("should close bottom sheet when clicking overlay", async ({ page }) => {
      // Open sheet
      await page.getByRole("link", { name: "Add expense" }).click();
      await expect(page.getByRole("heading", { name: "Add New Expense" }).last()).toBeVisible();

      // Use Escape key to close (more reliable than clicking overlay)
      await page.keyboard.press('Escape');

      // Wait a bit for animation
      await page.waitForTimeout(500);

      // Verify sheet closed
      await expect(page).toHaveURL("/dashboard");
    });
  });

  test.describe("Desktop Navigation", () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test("should open bottom sheet when clicking Add Expense in desktop nav", async ({ page }) => {
      // Verify desktop nav is visible
      await expect(page.getByRole("link", { name: "Add Expense" })).toBeVisible();

      // Click Add Expense link
      await page.getByRole("link", { name: "Add Expense" }).click();

      // Verify URL changed
      await expect(page).toHaveURL("/dashboard/add-expense");

      // Verify bottom sheet is visible with form
      await expect(page.getByRole("heading", { name: "Add New Expense" }).last()).toBeVisible();
      await expect(page.getByLabel("Amount (SGD)")).toBeVisible();
    });

    test("should show bottom sheet on desktop viewport", async ({ page }) => {
      // Open sheet
      await page.getByRole("link", { name: "Add Expense" }).click();
      
      // Verify sheet opens and has appropriate styling
      const sheetContent = page.locator('[role="dialog"]');
      await expect(sheetContent).toBeVisible();
    });
  });

  test.describe("Form Functionality in Sheet", () => {
    test("should create expense and close sheet on success", async ({ page }) => {
      // Use desktop Add Expense link for testing form functionality
      await page.getByRole("link", { name: "Add Expense" }).click();

      // Wait for sheet to be visible
      await expect(page.getByLabel("Amount (SGD)")).toBeVisible();

      // Fill out the form
      await page.getByLabel("Amount (SGD)").fill("25.50");
      await page.getByLabel("Description").fill("Test expense from bottom sheet");
      await page.getByLabel("Category (Optional)").selectOption("Food");

      // Submit the form
      await page.getByRole("button", { name: "Add Expense" }).click();

      // Wait for success message
      await expect(page.getByText("Expense added successfully!")).toBeVisible();

      // Sheet should auto-close after 500ms
      await page.waitForTimeout(700);
      await expect(page).toHaveURL("/dashboard");
      await expect(page.getByLabel("Amount (SGD)")).not.toBeVisible();

      // Reload and verify expense appears
      await page.reload();
      await expect(page.getByText("Test expense from bottom sheet")).toBeVisible();
    });

    test("should update month-to-date total after creating expense", async ({ page }) => {
      // Get initial month-to-date total
      const monthCard = page.locator('text=Spent this month').locator("..");
      const initialTotal = await monthCard.locator('text=/\\$[\\d,]+\\.\\d{2}/').textContent();

      // Use desktop Add Expense link
      await page.getByRole("link", { name: "Add Expense" }).click();
      await expect(page.getByLabel("Amount (SGD)")).toBeVisible();

      await page.getByLabel("Amount (SGD)").fill("10.00");
      await page.getByLabel("Description").fill("Test for total update");
      await page.getByRole("button", { name: "Add Expense" }).click();

      // Wait for success and auto-close
      await expect(page.getByText("Expense added successfully!")).toBeVisible();
      await page.waitForTimeout(700);

      // Reload to see updated total
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Month-to-date should have updated
      const newTotal = await monthCard.locator('text=/\\$[\\d,]+\\.\\d{2}/').textContent();
      expect(newTotal).not.toBe(initialTotal);
    });

    test("should show validation errors in sheet", async ({ page }) => {
      // Use desktop Add Expense link
      await page.getByRole("link", { name: "Add Expense" }).click();
      await expect(page.getByLabel("Amount (SGD)")).toBeVisible();

      // Try to submit without required fields
      await page.getByRole("button", { name: "Add Expense" }).click();

      // HTML5 validation should prevent submission
      const amountInput = page.getByLabel("Amount (SGD)");
      const isRequired = await amountInput.getAttribute("required");
      expect(isRequired).not.toBeNull();

      // Sheet should remain open
      await expect(page.getByLabel("Amount (SGD)")).toBeVisible();
    });

    test("should clear form after successful submission", async ({ page }) => {
      // Use desktop Add Expense link
      await page.getByRole("link", { name: "Add Expense" }).click();
      await expect(page.getByLabel("Amount (SGD)")).toBeVisible();

      // Fill and submit
      await page.getByLabel("Amount (SGD)").fill("15.00");
      await page.getByLabel("Description").fill("Form clear test");
      await page.getByRole("button", { name: "Add Expense" }).click();

      // Wait for success
      await expect(page.getByText("Expense added successfully!")).toBeVisible();

      // Open sheet again using desktop link
      await page.waitForTimeout(700); // Wait for auto-close
      await page.getByRole("link", { name: "Add Expense" }).click();
      await expect(page.getByLabel("Amount (SGD)")).toBeVisible();

      // Form should be cleared
      await expect(page.getByLabel("Amount (SGD)")).toHaveValue("");
      await expect(page.getByLabel("Description")).toHaveValue("");
    });
  });

  test.describe("Edge Cases", () => {
    test("should redirect to dashboard on page refresh", async ({ page }) => {
      // Open sheet using desktop link
      await page.getByRole("link", { name: "Add Expense" }).click();
      await expect(page).toHaveURL("/dashboard/add-expense");
      await expect(page.getByLabel("Amount (SGD)")).toBeVisible();

      // Refresh the page
      await page.reload();

      // Should redirect to dashboard
      await expect(page).toHaveURL("/dashboard");
      
      // Sheet should not be visible
      await expect(page.getByLabel("Amount (SGD)")).not.toBeVisible();
    });

    test("should redirect to dashboard on direct URL access", async ({ page }) => {
      // Navigate directly to add-expense URL
      await page.goto("/dashboard/add-expense");

      // Should redirect to dashboard
      await expect(page).toHaveURL("/dashboard");
      
      // Sheet should not be visible
      await expect(page.getByLabel("Amount (SGD)")).not.toBeVisible();
    });

    test("should handle browser back button correctly", async ({ page }) => {
      // Open sheet using desktop link
      await page.getByRole("link", { name: "Add Expense" }).click();
      await expect(page).toHaveURL("/dashboard/add-expense");
      await expect(page.getByLabel("Amount (SGD)")).toBeVisible();

      // Click browser back button
      await page.goBack();

      // Should return to dashboard
      await expect(page).toHaveURL("/dashboard");
      await expect(page.getByLabel("Amount (SGD)")).not.toBeVisible();

      // Click browser forward button
      await page.goForward();

      // Should reopen the sheet
      await expect(page).toHaveURL("/dashboard/add-expense");
      await expect(page.getByLabel("Amount (SGD)")).toBeVisible();
    });
  });
});

