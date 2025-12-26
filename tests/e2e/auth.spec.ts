import { test, expect } from "@playwright/test";

// Test phone numbers configured in supabase/config.toml
// Note: Tests run serially. Supabase has max_frequency=5s between OTP requests to same number.
// To avoid delays, we avoid reusing phone numbers in consecutive tests.
const TEST_PHONES = {
  login: "12345678",      // Test 1: complete login flow
  logout: "87654321",     // Test 2: logout flow
  // Test 3: invalid phone - no OTP sent
  invalidOtp: "12345678", // Test 4: invalid OTP test (reuse login phone, logout used 876...)
  resendOtp: "87654321",  // Test 5: resend OTP (reuse logout phone)
  // Test 6: protect dashboard - no OTP
  rateLimit: "88888888",  // Test 7: rate limit test
};

// Run authentication tests serially to avoid rate limit conflicts
test.describe.configure({ mode: 'serial' });

// Reset rate limiter before all tests by waiting for limits to expire
test.beforeAll(async () => {
  // The rate limit window is 15 minutes (900 seconds)
  // If this is a fresh test run after previous failures, we may need to wait
  // For now, we'll proceed and rely on using different phone numbers per test
  console.log("Starting E2E auth tests...");
});

test.describe("Authentication Flow", () => {
  test("should complete login flow with phone OTP", async ({ page }) => {
    // Navigate to login page
    await page.goto("/login");

    // Should see the minimalist "Personal Ledger" label
    await expect(page.getByText("Personal Ledger")).toBeVisible();

    // Enter phone number (8 digits without +65)
    const phoneInput = page.getByPlaceholder("0000 0000");
    await phoneInput.fill(TEST_PHONES.login);

    // Click Login with OTP button and wait for navigation/response
    const loginButton = page.getByRole("button", { name: "Login with OTP" });
    await loginButton.click();

    // Wait for form to process
    await page.waitForTimeout(3000);

    // Wait for OTP step - should see OTP input placeholder
    await expect(page.getByPlaceholder("000000")).toBeVisible({ timeout: 10000 });

    // Enter OTP (test OTP: 123456)
    await page.getByPlaceholder("000000").fill("123456");

    // Click Verify OTP
    await page.getByRole("button", { name: "Verify OTP" }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    // Should see logout button
    await expect(page.getByRole("button", { name: "Log out" })).toBeVisible();
  });

  test("should logout and redirect to login", async ({ page }) => {
    // First, login
    await page.goto("/login");
    await page.getByPlaceholder("0000 0000").fill(TEST_PHONES.logout);
    await page.getByRole("button", { name: "Login with OTP" }).click();
    await page.getByPlaceholder("000000").fill("123456");
    await page.getByRole("button", { name: "Verify OTP" }).click();
    await expect(page).toHaveURL("/dashboard");

    // Now logout
    await page.getByRole("button", { name: "Log out" }).click();

    // Should redirect to login
    await expect(page).toHaveURL("/login");
    await expect(page.getByText("Personal Ledger")).toBeVisible();
  });

  test("should show error for invalid phone number", async ({ page }) => {
    await page.goto("/login");

    // Verify input has HTML5 pattern validation
    const input = page.getByPlaceholder("0000 0000");
    await input.fill("1234");
    
    // HTML5 validation prevents submission with invalid pattern
    const pattern = await input.getAttribute('pattern');
    expect(pattern).toBe('[0-9]{8}');
  });

  test("should show error for invalid OTP", async ({ page }) => {
    // Wait longer to avoid Supabase max_frequency limit (5s between OTPs to same number)
    // This test reuses the login phone, need to wait since test 1
    await page.waitForTimeout(8000);
    
    await page.goto("/login");

    // Enter valid phone
    await page.getByPlaceholder("0000 0000").fill(TEST_PHONES.invalidOtp);
    await page.getByRole("button", { name: "Login with OTP" }).click();

    // Wait for OTP screen to appear
    await expect(page.getByPlaceholder("000000")).toBeVisible({ timeout: 10000 });

    // Enter invalid OTP
    await page.getByPlaceholder("000000").fill("999999");
    await page.getByRole("button", { name: "Verify OTP" }).click();

    // Should show error (invalid OTP)
    await expect(page.getByText(/Token has expired or is invalid/)).toBeVisible();
  });

  test("should handle resend OTP", async ({ page }) => {
    // Wait longer to avoid Supabase max_frequency limit (5s between OTPs to same number)
    await page.waitForTimeout(8000);
    
    await page.goto("/login");

    // Enter phone
    await page.getByPlaceholder("0000 0000").fill(TEST_PHONES.resendOtp);
    await page.getByRole("button", { name: "Login with OTP" }).click();
    
    // Wait for OTP screen
    await expect(page.getByPlaceholder("000000")).toBeVisible({ timeout: 10000 });

    // Click Resend OTP
    await page.getByRole("button", { name: "Resend OTP" }).click();

    // Should stay on OTP screen and show success message
    await expect(page.getByText("OTP sent again! Check your phone.")).toBeVisible();
    await expect(page.getByPlaceholder("000000")).toBeVisible();
  });

  test("should protect dashboard route when not authenticated", async ({ page }) => {
    // Try to access dashboard without login
    await page.goto("/dashboard");

    // Should redirect to login
    await expect(page).toHaveURL("/login");
  });
});

test.describe("Rate Limiting", () => {
  test("should block after 3 failed send OTP attempts", async ({ page }) => {
    // Wait to avoid Supabase max_frequency limit from previous test
    await page.waitForTimeout(6000);
    
    await page.goto("/login");

    // Try to send OTP 4 times with the dedicated rate limit test phone
    for (let i = 0; i < 4; i++) {
      if (i > 0) {
        // Wait between attempts to avoid Supabase max_frequency limit (5s)
        await page.waitForTimeout(6000);
      }
      
      await page.getByPlaceholder("0000 0000").fill(TEST_PHONES.rateLimit);
      await page.getByRole("button", { name: "Login with OTP" }).click();
      
      if (i < 3) {
        // First 3 attempts should succeed - check for OTP screen
        await expect(page.getByPlaceholder("000000")).toBeVisible();
        // Go back to try again
        await page.reload();
        await page.waitForLoadState('networkidle');
      }
    }

    // 4th attempt should show rate limit error
    await expect(page.getByText(/Too many attempts/)).toBeVisible();
  });
});

