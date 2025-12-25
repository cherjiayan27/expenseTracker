# Production Testing Checklist

Comprehensive testing checklist to verify your production deployment works correctly.

## Overview

After deploying to Vercel, systematically test all features to ensure:
- Authentication works with real phone numbers
- SMS delivery via Twilio
- Database operations work correctly
- Security measures are active
- UI is responsive across devices

**Production URL:** `https://expense-tracker-[your-subdomain].vercel.app`

---

## Pre-Testing Setup

Before you begin testing:

- [ ] Deployment completed successfully on Vercel
- [ ] Database migrations pushed to Supabase production
- [ ] Environment variables configured in Vercel
- [ ] Supabase redirect URLs updated with Vercel URL
- [ ] Real Singapore phone number ready for testing
- [ ] Browser DevTools open (F12) to monitor console errors

---

## 1. Authentication Tests

Test the complete authentication flow with real credentials.

### 1.1 Landing Page

- [ ] Navigate to production URL
- [ ] Landing page loads without errors
- [ ] Check browser console (F12) - should have no errors
- [ ] "Get Started" or "Login" button visible
- [ ] Page styling looks correct (no missing CSS)

### 1.2 Phone Number Input

- [ ] Click "Get Started" or navigate to `/login`
- [ ] Login page loads
- [ ] Country code `+65` is pre-filled and disabled
- [ ] Phone number input field visible
- [ ] Placeholder text shows format (e.g., "12345678")
- [ ] "Send OTP" button visible

### 1.3 Send OTP

- [ ] Enter a **real Singapore phone number** (8 digits without +65)
- [ ] Click "Send OTP"
- [ ] Button shows loading state ("Sending..." or spinner)
- [ ] Success message appears: "OTP sent to +65XXXXXXXX"
- [ ] Form transitions to OTP input view
- [ ] Helper text shows: "For testing: use OTP 123456" (or similar)

### 1.4 SMS Delivery

- [ ] Check your phone for SMS within **30 seconds**
- [ ] SMS received from Twilio number
- [ ] OTP code is **6 digits**
- [ ] SMS includes "Your OTP is: XXXXXX" or similar text

> **If SMS doesn't arrive:** Check Twilio Console → Logs for delivery status

### 1.5 OTP Verification

- [ ] Enter OTP from SMS into input field
- [ ] "Verify OTP" button enabled
- [ ] Click "Verify OTP"
- [ ] Button shows loading state
- [ ] Redirects to `/dashboard` on success
- [ ] No console errors during redirect

### 1.6 Dashboard Access

- [ ] Dashboard page loads successfully
- [ ] URL is `/dashboard`
- [ ] Page title shows "Dashboard"
- [ ] "Month to Date" card visible
- [ ] "Add New Expense" form visible
- [ ] Empty state or existing expenses shown

**✅ Authentication Complete** - You're now logged in to production!

---

## 2. Expense Creation Tests

Test creating expenses with various inputs.

### 2.1 Create First Expense

- [ ] Fill out expense form:
  - **Amount:** `15.50`
  - **Description:** "Test lunch expense"
  - **Category:** Select "Food"
  - **Date:** Today (default)
- [ ] Click "Add Expense"
- [ ] Button shows loading state
- [ ] Success message appears: "Expense added successfully!"
- [ ] Form clears after submission

### 2.2 Verify Expense Appears

- [ ] New expense appears in "Recent Expenses" list immediately
- [ ] Expense shows:
  - Amount: "S$15.50" (formatted)
  - Description: "Test lunch expense"
  - Category badge: "Food"
  - Date: Today's date
- [ ] No duplicate entries

### 2.3 Verify Month-to-Date Updates

- [ ] "Spent this month" card updates
- [ ] Total includes the new expense
- [ ] Amount formatted correctly (S$15.50 or higher if you had existing data)

### 2.4 Create Multiple Expenses

- [ ] Add 2-3 more expenses with different:
  - Amounts (test decimals: 10.99, 20.00)
  - Descriptions
  - Categories (Transport, Shopping, etc.)
  - Dates (today and past dates)
- [ ] All expenses appear in list
- [ ] Listed in reverse chronological order (newest first)
- [ ] Month-to-date total continues updating

### 2.5 Form Validation

Test that validation works:

**Negative Amount:**
- [ ] Enter amount: `-10`
- [ ] Click "Add Expense"
- [ ] Error message: "Amount must be greater than 0"

**Empty Description:**
- [ ] Leave description blank
- [ ] Click "Add Expense"
- [ ] Error message: "Description is required"

**Long Description:**
- [ ] Enter 201+ characters in description
- [ ] Click "Add Expense"
- [ ] Error message: "Description must be 200 characters or less"

**Future Date:**
- [ ] Select tomorrow's date
- [ ] Click "Add Expense"
- [ ] Error message: "Date cannot be in the future"

**✅ Expense Creation Complete** - All forms working correctly!

---

## 3. Security Tests

Verify protected routes and authentication enforcement.

### 3.1 Logout

- [ ] Click "Log out" button (in navigation/header)
- [ ] Button shows loading state
- [ ] Redirects to `/login`
- [ ] Session cleared (check DevTools → Application → Cookies)

### 3.2 Protected Routes

After logging out, try to access protected pages directly:

**Dashboard:**
- [ ] Navigate to: `/dashboard`
- [ ] Redirects to `/login` immediately
- [ ] Does not show dashboard content

**Settings (if exists):**
- [ ] Navigate to: `/settings`
- [ ] Redirects to `/login` immediately

### 3.3 Re-login

- [ ] Log in again with phone + OTP
- [ ] Verify you can access dashboard again
- [ ] Previous expenses are still visible (data persisted)

### 3.4 Data Isolation (Multi-User Test)

If you have access to a second phone number:

**User 1 (your first login):**
- [ ] Create 2-3 expenses
- [ ] Note the expense descriptions
- [ ] Log out

**User 2 (second phone number):**
- [ ] Log in with different phone number
- [ ] Verify dashboard is empty (no expenses)
- [ ] Create 1-2 different expenses
- [ ] Log out

**User 1 (log back in):**
- [ ] Log in with original phone number
- [ ] Verify only YOUR expenses are visible
- [ ] User 2's expenses are NOT visible
- [ ] Expense count matches what you created

**✅ RLS Working!** Users can only see their own data.

**✅ Security Complete** - Auth and data isolation working correctly!

---

## 4. Rate Limiting Tests

Test OTP rate limiting to prevent abuse.

### 4.1 Multiple OTP Requests

- [ ] Log out
- [ ] Go to `/login`
- [ ] Send OTP (Attempt 1)
- [ ] Wait for success message
- [ ] Click "Back" or refresh page
- [ ] Send OTP again (Attempt 2)
- [ ] Wait for success message
- [ ] Refresh page
- [ ] Send OTP again (Attempt 3)
- [ ] Wait for success message

### 4.2 Rate Limit Triggered

- [ ] Refresh page one more time
- [ ] Send OTP (Attempt 4)
- [ ] **Should see error:** "Too many attempts. Please try again after X seconds."
- [ ] Button disabled or error shown
- [ ] SMS is NOT sent

### 4.3 Rate Limit Recovery

- [ ] Wait 15 minutes (or test with a different phone number)
- [ ] Try sending OTP again
- [ ] Should succeed
- [ ] SMS delivered

> **Note:** Rate limiting uses in-memory storage, so limits reset on Vercel function restart.

**✅ Rate Limiting Complete** - Abuse prevention working!

---

## 5. Mobile Responsiveness Tests

Test on mobile devices or using browser DevTools device emulation.

### 5.1 Enable Mobile View

**Chrome DevTools:**
1. Press F12 → Open DevTools
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select device: "iPhone 12 Pro" or "Pixel 5"

### 5.2 Landing Page (Mobile)

- [ ] Page fits screen width (no horizontal scroll)
- [ ] Text is readable (not too small)
- [ ] "Get Started" button is easily tappable
- [ ] Images/logos scale appropriately

### 5.3 Login Form (Mobile)

- [ ] Phone input field is large enough to tap
- [ ] Country code (+65) is visible
- [ ] On-screen keyboard appears when tapping input
- [ ] "Send OTP" button is tappable (not too small)
- [ ] Form doesn't break layout

### 5.4 OTP Input (Mobile)

- [ ] OTP input field is easily tappable
- [ ] Numeric keyboard appears (not full QWERTY)
- [ ] "Verify OTP" button is large enough
- [ ] "Resend OTP" and "Back" buttons accessible

### 5.5 Dashboard (Mobile)

- [ ] Month-to-date card displays correctly
- [ ] Expense form fields are accessible:
  - Amount input tappable
  - Description textarea expands properly
  - Category dropdown works
  - Date picker opens correctly
- [ ] "Add Expense" button is tappable
- [ ] Expense list scrolls smoothly
- [ ] Expense cards fit screen width

### 5.6 Navigation (Mobile)

- [ ] Bottom navigation visible (if implemented)
- [ ] Navigation items tappable
- [ ] Active page highlighted
- [ ] Logout button accessible

### 5.7 Landscape Mode

- [ ] Rotate device to landscape
- [ ] Layout adapts (no broken UI)
- [ ] All elements still accessible

**✅ Mobile Responsiveness Complete** - Works great on small screens!

---

## 6. Performance Tests

Measure and verify application performance.

### 6.1 Lighthouse Audit

Run Lighthouse in Chrome DevTools:

1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Select categories:
   - ☑ Performance
   - ☑ Accessibility
   - ☑ Best Practices
   - ☑ SEO
4. Select "Mobile" device
5. Click "Analyze page load"

**Target Scores:**
- [ ] **Performance:** > 70 (green)
- [ ] **Accessibility:** > 90 (green)
- [ ] **Best Practices:** > 90 (green)
- [ ] **SEO:** > 80 (green)

### 6.2 Page Load Time

- [ ] Clear browser cache (Ctrl+Shift+Del)
- [ ] Open DevTools → Network tab
- [ ] Navigate to production URL
- [ ] Check "DOMContentLoaded" time at bottom
- [ ] **Target:** < 3 seconds on fast 3G
- [ ] Page is interactive quickly (no long white screen)

### 6.3 Time to Interactive

- [ ] Page loads
- [ ] Can click "Get Started" within 2-3 seconds
- [ ] No janky animations or stuttering
- [ ] Smooth scrolling

### 6.4 Asset Loading

In DevTools → Network:
- [ ] CSS loads quickly (< 500ms)
- [ ] JavaScript chunks load efficiently
- [ ] Images optimized (not too large)
- [ ] Fonts load without flash of unstyled text (FOUT)

**✅ Performance Complete** - App loads fast and smooth!

---

## 7. Browser Compatibility Tests

Test on different browsers (if possible).

### 7.1 Chrome/Edge (Chromium)

- [ ] Full login flow works
- [ ] Expense creation works
- [ ] UI renders correctly
- [ ] No console errors

### 7.2 Safari (macOS/iOS)

- [ ] Login flow works
- [ ] OTP input functions
- [ ] Date picker works
- [ ] No Safari-specific errors

### 7.3 Firefox

- [ ] Authentication works
- [ ] Forms submit correctly
- [ ] Styling consistent
- [ ] No Firefox-specific errors

### 7.4 Mobile Browsers

- [ ] Safari (iOS) - Test on iPhone if available
- [ ] Chrome (Android) - Test on Android if available
- [ ] In-app browsers (e.g., Instagram, Facebook)

**✅ Browser Compatibility Complete** - Works across browsers!

---

## 8. Error Handling Tests

Test error scenarios and edge cases.

### 8.1 Network Offline

- [ ] Open DevTools → Network tab
- [ ] Set "Throttling" to "Offline"
- [ ] Try to send OTP
- [ ] See appropriate error message
- [ ] Set back to "Online"
- [ ] Try again - should work

### 8.2 Invalid OTP

- [ ] Request OTP
- [ ] Enter wrong code: "000000"
- [ ] Click "Verify OTP"
- [ ] See error: "Invalid OTP" or similar
- [ ] Can try again with correct OTP

### 8.3 Expired Session

- [ ] Log in
- [ ] Leave tab open for 24+ hours (or manually clear cookies)
- [ ] Try to create expense
- [ ] Should redirect to login or show auth error
- [ ] Can log in again

### 8.4 Database Errors (Simulated)

- [ ] Check Vercel logs for any database connection errors
- [ ] No "Row level security policy violated" errors
- [ ] No "Failed to connect" errors

**✅ Error Handling Complete** - Graceful error messages!

---

## 9. Console & Logs Check

Verify no errors in production.

### 9.1 Browser Console

Open DevTools → Console:
- [ ] No red error messages
- [ ] No warnings about missing env vars
- [ ] No CORS errors
- [ ] No "Failed to fetch" errors

Acceptable warnings:
- Next.js HMR (only in dev mode, shouldn't see in prod)
- Some third-party library warnings (usually safe)

### 9.2 Vercel Logs

Go to Vercel Dashboard → Project → Logs:
- [ ] Check for errors in last hour
- [ ] No server-side exceptions
- [ ] No timeout errors
- [ ] API routes respond successfully (200 status)

### 9.3 Supabase Logs

Go to Supabase Dashboard → Logs:
- [ ] Check API logs
- [ ] Verify successful queries
- [ ] No "permission denied" errors
- [ ] No connection failures

**✅ Logs Clean** - No critical errors!

---

## 10. Final Verification

Complete final checks before considering deployment successful.

### 10.1 Feature Completeness

- [ ] All Phase 1 MVP features working:
  - ✅ Phone OTP authentication
  - ✅ Dashboard view
  - ✅ Create expense
  - ✅ List expenses
  - ✅ Month-to-date calculation
  - ✅ Logout
  - ✅ Rate limiting

### 10.2 Data Persistence

- [ ] Create an expense
- [ ] Log out
- [ ] Log back in
- [ ] Expense still visible
- [ ] Data persisted correctly in Supabase

### 10.3 Production URLs

- [ ] Update README.md with production URL
- [ ] Share URL with test users (if applicable)
- [ ] Bookmark production URL

### 10.4 Monitoring Setup

- [ ] Vercel Analytics enabled (optional)
- [ ] Email notifications for deployment failures enabled
- [ ] Supabase usage monitoring checked

**✅ Final Verification Complete!**

---

## Summary Report

After completing all tests, summarize results:

### ✅ Passing Tests

Count total checkboxes completed: ____ / ~80

### ❌ Failing Tests

List any tests that failed:
- Test name: Issue description
- Test name: Issue description

### 🐛 Issues Found

Document any bugs or unexpected behavior:
1. Issue: ...
   - Impact: ...
   - Workaround: ...

### 📝 Follow-Up Actions

List any required fixes or improvements:
- [ ] Fix issue #1
- [ ] Improve performance in X area
- [ ] Add error handling for Y

---

## Testing Frequency

### After Each Deployment

Run quick smoke tests:
- [ ] Landing page loads
- [ ] Login works
- [ ] Can create expense
- [ ] No console errors

### Weekly

Run full checklist (this document)

### After Major Changes

Run full checklist + additional specific tests

---

## Related Documentation

- [Complete Deployment Guide](./DEPLOYMENT.md)
- [Environment Variables](./ENV-PRODUCTION.md)
- [Migration Deployment](./MIGRATION-DEPLOYMENT.md)
- [Vercel Setup](./VERCEL-DEPLOYMENT.md)

---

## Support

If tests fail or you encounter issues:

1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) Troubleshooting section
2. Review Vercel logs for errors
3. Check Supabase Dashboard for database issues
4. Verify environment variables are correct
5. Try redeploying from Vercel Dashboard

---

**Testing Status:** Ready for Production Testing ✅

**Last Updated:** December 25, 2025

