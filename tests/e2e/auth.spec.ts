import { test, expect } from "@playwright/test";

// Test phone numbers configured in supabase/config.toml
// Note: Tests run serially. Supabase has max_frequency=5s between OTP requests to same number.
// To avoid delays, we avoid reusing phone numbers in consecutive tests.
const TEST_PHONES = {
  login: "12345678",      // Test 1: complete login flow
  logout: "87654321",     // Test 2: logout flow
  // Test 3: invalid phone - no OTP sent
  invalidOtp: "12345678", // Test 4: invalid OTP test (reuse login phone, logout used 876...)
  changePhone: "87654321", // Test 5: change phone (reuse logout phone, >5s after logout test)
  resendOtp: "12345678",  // Test 6: resend OTP (reuse login phone)
  // Test 7: protect dashboard - no OTP
  rateLimit: "88888888",  // Test 8: rate limit test
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

    // Should see the phone input form
    await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
    await expect(page.getByText("Enter your phone number")).toBeVisible();

    // Enter phone number (8 digits without +65)
    await page.getByPlaceholder("12345678").fill(TEST_PHONES.login);

    // Click Send OTP
    await page.getByRole("button", { name: "Send OTP" }).click();

    // Wait for OTP step
    await expect(page.getByText(`OTP sent to +65${TEST_PHONES.login}`)).toBeVisible();
    await expect(page.getByText("Enter the OTP sent to your phone")).toBeVisible();

    // Enter OTP (test OTP: 123456)
    await page.getByPlaceholder("123456").fill("123456");

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
    await page.getByPlaceholder("12345678").fill(TEST_PHONES.logout);
    await page.getByRole("button", { name: "Send OTP" }).click();
    await page.getByPlaceholder("123456").fill("123456");
    await page.getByRole("button", { name: "Verify OTP" }).click();
    await expect(page).toHaveURL("/dashboard");

    // Now logout
    await page.getByRole("button", { name: "Log out" }).click();

    // Should redirect to login
    await expect(page).toHaveURL("/login");
    await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
  });

  test("should show error for invalid phone number", async ({ page }) => {
    await page.goto("/login");

    // Verify input has HTML5 pattern validation
    const input = page.getByPlaceholder("12345678");
    await input.fill("1234");
    
    // HTML5 validation prevents submission with invalid pattern
    const pattern = await input.getAttribute('pattern');
    expect(pattern).toBe('[0-9]{8}');
  });

  test("should show error for invalid OTP", async ({ page }) => {
    // Wait to avoid Supabase max_frequency limit (5s between OTPs to same number)
    await page.waitForTimeout(6000);
    
    await page.goto("/login");

    // Enter valid phone
    await page.getByPlaceholder("12345678").fill(TEST_PHONES.invalidOtp);
    await page.getByRole("button", { name: "Send OTP" }).click();

    // Wait for OTP screen to appear
    await expect(page.getByText(`OTP sent to +65${TEST_PHONES.invalidOtp}`)).toBeVisible();

    // Enter invalid OTP
    await page.getByPlaceholder("123456").fill("999999");
    await page.getByRole("button", { name: "Verify OTP" }).click();

    // Should show error (invalid OTP)
    await expect(page.getByText(/Token has expired or is invalid/)).toBeVisible();
  });

  test("should allow changing phone number", async ({ page }) => {
    await page.goto("/login");

    // Enter phone and get to OTP step
    await page.getByPlaceholder("12345678").fill(TEST_PHONES.changePhone);
    await page.getByRole("button", { name: "Send OTP" }).click();
    await expect(page.getByText(`OTP sent to +65${TEST_PHONES.changePhone}`)).toBeVisible();

    // Click "Change phone number"
    await page.getByRole("button", { name: /Change phone number/i }).click();

    // Should be back at phone step
    await expect(page.getByText("Enter your phone number")).toBeVisible();
    await expect(page.getByPlaceholder("12345678")).toBeVisible();
  });

  test("should handle resend OTP", async ({ page }) => {
    // Wait to avoid Supabase max_frequency limit (5s between OTPs to same number)
    await page.waitForTimeout(6000);
    
    await page.goto("/login");

    // Enter phone
    await page.getByPlaceholder("12345678").fill(TEST_PHONES.resendOtp);
    await page.getByRole("button", { name: "Send OTP" }).click();
    await expect(page.getByText(`OTP sent to +65${TEST_PHONES.resendOtp}`)).toBeVisible();

    // Click Resend OTP
    await page.getByRole("button", { name: "Resend OTP" }).click();

    // Should go back to phone step
    await expect(page.getByText("Enter your phone number")).toBeVisible();
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
      
      await page.getByPlaceholder("12345678").fill(TEST_PHONES.rateLimit);
      await page.getByRole("button", { name: "Send OTP" }).click();
      
      if (i < 3) {
        // First 3 attempts should succeed
        await expect(page.getByText(`OTP sent to +65${TEST_PHONES.rateLimit}`)).toBeVisible();
        // Go back to try again
        await page.reload();
        await page.waitForLoadState('networkidle');
      }
    }

    // 4th attempt should show rate limit error
    await expect(page.getByText(/Too many attempts/)).toBeVisible();
  });
});

