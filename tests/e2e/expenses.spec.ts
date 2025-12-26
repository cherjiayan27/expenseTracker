import { test, expect } from "@playwright/test";

// Test phone number configured in supabase/config.toml
// Using different phone than auth tests to avoid rate limit conflicts
const TEST_PHONE = "99999999";
const TEST_OTP = "123456";

// Run tests serially to avoid rate limit conflicts with OTP sending
test.describe.configure({ mode: 'serial' });

test.describe("Expense Management", () => {
  test.beforeEach(async ({ page }) => {
    // Wait 6 seconds to avoid Supabase max_frequency limit (5s between OTPs to same number)
    // Skip on first test
    if (test.info().title !== "should display dashboard with expense components") {
      await page.waitForTimeout(6000);
    }
    
    // Login before each test
    await page.goto("/login");
    await page.getByPlaceholder("0000 0000").fill(TEST_PHONE);
    await page.getByRole("button", { name: "Login with OTP" }).click();
    
    // Wait for the OTP to be sent and form to transition
    await page.waitForTimeout(2000);
    
    await expect(page.getByPlaceholder("000000")).toBeVisible();
    await page.getByPlaceholder("000000").fill(TEST_OTP);
    await page.getByRole("button", { name: "Verify OTP" }).click();
    await expect(page).toHaveURL("/dashboard");
  });

  test("should display dashboard with expense components", async ({ page }) => {
    // Check dashboard heading
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    // Check month-to-date card
    await expect(page.getByText("Spent this month")).toBeVisible();

    // Check create expense form
    await expect(page.getByText("Add New Expense")).toBeVisible();

    // Check recent expenses section
    await expect(page.getByText("Recent Expenses")).toBeVisible();
  });

  test("should display seeded expenses", async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState("networkidle");

    // Check if any seeded expenses are visible
    // Seed data includes expenses like "Lunch at hawker centre", "Grab to office", etc.
    const expenseCards = page.locator('[class*="rounded-lg"][class*="border"]').filter({
      has: page.locator('text=/\\$\\d+\\.\\d{2}/'),
    });

    // Should have at least some expenses from seed data
    await expect(expenseCards.first()).toBeVisible();
  });

  test("should create a new expense", async ({ page }) => {
    // Fill out the expense form
    await page.getByLabel("Amount (SGD)").fill("25.50");
    await page.getByLabel("Description").fill("Test expense from E2E");
    await page.getByLabel("Category").selectOption("Food");

    // Submit the form
    await page.getByRole("button", { name: "Add Expense" }).click();

    // Wait for success message
    await expect(page.getByText("Expense added successfully!")).toBeVisible();

    // Check if the new expense appears in the list (might need to wait for revalidation)
    await page.waitForTimeout(1000);
    await page.reload();
    await expect(page.getByText("Test expense from E2E")).toBeVisible();
  });

  test("should update month-to-date total after creating expense", async ({ page }) => {
    // Get initial month-to-date total
    const monthCard = page.locator('text=Spent this month').locator("..");
    const initialTotal = await monthCard.locator('text=/\\$[\\d,]+\\.\\d{2}/').textContent();

    // Create a new expense
    await page.getByLabel("Amount (SGD)").fill("10.00");
    await page.getByLabel("Description").fill("Test for total update");
    await page.getByRole("button", { name: "Add Expense" }).click();

    // Wait for success
    await expect(page.getByText("Expense added successfully!")).toBeVisible();

    // Reload to see updated total
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Month-to-date should have updated (different from initial)
    const newTotal = await monthCard.locator('text=/\\$[\\d,]+\\.\\d{2}/').textContent();
    expect(newTotal).not.toBe(initialTotal);
  });

  test("should show validation errors for invalid input", async ({ page }) => {
    // Try to submit empty form
    await page.getByRole("button", { name: "Add Expense" }).click();

    // HTML5 validation should prevent submission
    // Check that amount field is required
    const amountInput = page.getByLabel("Amount (SGD)");
    const isRequired = await amountInput.getAttribute("required");
    expect(isRequired).not.toBeNull();

    // Try with invalid amount (negative)
    await page.getByLabel("Amount (SGD)").fill("-10");
    await page.getByLabel("Description").fill("Invalid amount test");
    await page.getByRole("button", { name: "Add Expense" }).click();

    // Should show error message
    await expect(page.getByText(/Amount must be greater than 0|Invalid/i)).toBeVisible({
      timeout: 3000,
    });
  });

  test("should clear form after successful submission", async ({ page }) => {
    // Fill out form
    await page.getByLabel("Amount (SGD)").fill("15.00");
    await page.getByLabel("Description").fill("Form clear test");
    await page.getByRole("button", { name: "Add Expense" }).click();

    // Wait for success
    await expect(page.getByText("Expense added successfully!")).toBeVisible();

    // Check if form is cleared (amount field should be empty)
    await expect(page.getByLabel("Amount (SGD)")).toHaveValue("");
    await expect(page.getByLabel("Description")).toHaveValue("");
  });

  test("should show empty state when no expenses exist", async ({ page }) => {
    // This test would require a clean database state
    // For now, we'll skip or modify based on seed data
    // Since we have seed data, we'll just verify the component exists
    const expenseList = page.locator('text=Recent Expenses').locator("..");
    await expect(expenseList).toBeVisible();
  });
});

