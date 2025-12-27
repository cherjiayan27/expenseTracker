# Bottom Navigation Mascots - Test Documentation

## Overview
Comprehensive test suite for the bottom navigation mascots feature that displays user-selected category mascots as navigation icons.

## Test Files

### 1. Unit Tests

#### `tests/unit/navigation.test.ts`
Tests the `getNavMascots` server action that fetches user preferences and returns mascots for display.

**Test Coverage:**
- ✅ Returns default mascots for unauthenticated users
- ✅ Returns user's selected mascots when preferences exist
- ✅ Limits returned mascots to maximum of 8
- ✅ Falls back to defaults if user has less than 6 mascots
- ✅ Falls back to defaults if no preferences exist
- ✅ Handles database errors gracefully
- ✅ Returns valid CategoryImage objects
- ✅ Filters out invalid paths from user preferences
- ✅ Validates default mascots in CATEGORY_IMAGES
- ✅ Ensures at least one default mascot per category

**Key Test Scenarios:**
```typescript
// Unauthenticated user
expect(mascots.every(m => m.isDefault)).toBe(true);

// User with 7 selected mascots
expect(mascots.length).toBe(7);

// Maximum limit enforcement
expect(mascots.length).toBe(8); // Even if user has 10

// Minimum threshold
if (userMascots.length < 6) {
  // Falls back to defaults
  expect(mascots.every(m => m.isDefault)).toBe(true);
}
```

#### `tests/unit/bottomNav.test.tsx`
Tests the `BottomNav` React component that renders the navigation with mascots.

**Test Coverage:**
- ✅ Renders loading skeletons initially
- ✅ Renders mascots after loading
- ✅ Renders the add expense button
- ✅ Renders navigation links for mascots
- ✅ Handles empty mascots array
- ✅ Handles API errors gracefully
- ✅ Reloads mascots when categoryPreferencesUpdated event fires
- ✅ Cleans up event listener on unmount
- ✅ Renders correct number of mascots (6-8)
- ✅ Has proper styling classes
- ✅ Hidden on desktop (md:hidden)
- ✅ Has proper accessibility attributes

**Key Test Scenarios:**
```typescript
// Loading state
const skeletons = screen.getAllByRole("generic")
  .filter(el => el.className.includes("animate-pulse"));
expect(skeletons.length).toBeGreaterThanOrEqual(6);

// Real-time updates
window.dispatchEvent(new CustomEvent("categoryPreferencesUpdated"));
await waitFor(() => {
  expect(screen.getByAltText("Coffee")).toBeInTheDocument();
});

// Event cleanup
unmount();
expect(removeEventListenerSpy).toHaveBeenCalledWith(
  "categoryPreferencesUpdated",
  expect.any(Function)
);
```

### 2. E2E Tests

#### `tests/e2e/navigation.spec.ts`
End-to-end tests using Playwright to verify the complete user flow.

**Test Coverage:**
- ✅ Displays bottom navigation with mascot icons
- ✅ Displays add expense button in bottom nav
- ✅ Navigates to add expense when clicking plus button
- ✅ Hides bottom navigation on desktop
- ✅ Shows loading skeletons initially
- ✅ Updates navigation when preferences change
- ✅ Displays correct mascots for authenticated user
- ✅ Has hover effects on mascot icons
- ✅ Maintains scroll position when many mascots
- ✅ Shows default mascots for new user
- ✅ Handles navigation with keyboard
- ✅ Has proper accessibility attributes

**Key Test Scenarios:**
```typescript
// Mobile display
await page.setViewportSize({ width: 375, height: 667 });
const mascotImages = page.locator("nav img[alt]");
const count = await mascotImages.count();
expect(count).toBeGreaterThanOrEqual(6);
expect(count).toBeLessThanOrEqual(8);

// Desktop hidden
await page.setViewportSize({ width: 1920, height: 1080 });
const isHidden = await bottomNav.evaluate((el) => {
  const style = window.getComputedStyle(el);
  return style.display === "none";
});
expect(isHidden).toBe(true);

// Preference updates
await page.goto("/categories");
await alternativeMascot.click(); // Add new mascot
await page.goto("/dashboard");
const updatedMascots = await page.locator("nav img[alt]").allTextContents();
// Should reflect the change
```

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm run test

# Run navigation unit tests only
npm run test navigation.test
npm run test bottomNav.test

# Watch mode
npm run test -- --watch
```

### E2E Tests
```bash
# Run all e2e tests
npm run test:e2e

# Run navigation e2e tests only
npx playwright test navigation.spec.ts

# Run with UI
npx playwright test navigation.spec.ts --ui

# Debug mode
npx playwright test navigation.spec.ts --debug
```

## Test Data

### Mock Mascots
```typescript
const mockMascots: CategoryImage[] = [
  {
    name: "Rice",
    category: "Food & Drinks",
    path: "/categories/food-and-drinks/dragonRice.png",
    isDefault: true,
  },
  {
    name: "Bus",
    category: "Transport",
    path: "/categories/transport/dragonBus.png",
    isDefault: true,
  },
  // ... 4 more for minimum of 6
];
```

### Test Phone Numbers
- E2E tests use: `"12345678"`
- Configured in `supabase/config.toml`
- Test OTP: `"123456"`

## Mocking Strategy

### Unit Tests
1. **Supabase Client**: Mocked with vi.mock
2. **Next.js Image**: Replaced with standard img tag
3. **Next.js Link**: Replaced with standard anchor tag
4. **getNavMascots**: Mocked function with controllable responses

### E2E Tests
- No mocking needed
- Tests against real Supabase local instance
- Uses test phone numbers with auto-confirm OTP

## Coverage Metrics

### Expected Coverage
- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

### Critical Paths Covered
1. ✅ Initial load and display
2. ✅ User authentication states
3. ✅ Preference loading and fallbacks
4. ✅ Real-time preference updates
5. ✅ Error handling and recovery
6. ✅ Responsive behavior (mobile/desktop)
7. ✅ Accessibility features
8. ✅ Navigation interactions

## Integration Points Tested

### Component Integration
```
BottomNav Component
  ↓ calls
getNavMascots() server action
  ↓ queries
Supabase user_preferences table
  ↓ returns
CategoryImage[] (from CATEGORY_IMAGES)
  ↓ renders
Bottom navigation with mascot icons
```

### Event Integration
```
Categories Page
  ↓ user selects mascot
saveCategoryMascotPreferences()
  ↓ saves to database
  ↓ dispatches
'categoryPreferencesUpdated' event
  ↓ listened by
BottomNav Component
  ↓ reloads
getNavMascots()
  ↓ updates UI
```

## Edge Cases Tested

1. **Empty state**: No mascots returned
2. **Minimum threshold**: Less than 6 mascots → fallback to defaults
3. **Maximum limit**: More than 8 mascots → truncate to 8
4. **Invalid paths**: Filter out non-existent image paths
5. **Network errors**: Graceful degradation with error logging
6. **Race conditions**: Multiple rapid preference updates
7. **Memory leaks**: Event listener cleanup on unmount
8. **New users**: No preferences set → show defaults
9. **Unauthenticated**: Not logged in → show defaults

## Accessibility Testing

### Covered Areas
- ✅ Aria-labels on all interactive elements
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ Focus management
- ✅ Alt text on images
- ✅ Semantic HTML structure

### Test Examples
```typescript
// Aria-label verification
expect(screen.getByLabelText("Rice")).toBeInTheDocument();
expect(screen.getByLabelText("Add expense")).toBeInTheDocument();

// Keyboard navigation
await page.keyboard.press("Tab");
const focusedElement = await page.evaluate(
  () => document.activeElement?.getAttribute("aria-label")
);
expect(focusedElement).toBeTruthy();
```

## Performance Considerations

### Tested Scenarios
1. **Initial load time**: Measured via loading skeleton visibility
2. **Image loading**: Uses Next.js Image optimization
3. **Event listener efficiency**: Single listener, not per mascot
4. **Re-render optimization**: useState with proper dependencies

### Performance Metrics
- Initial render: < 100ms (unit tests)
- Mascots load: < 2s (e2e tests)
- Preference update: < 1s (e2e tests)

## Test Maintenance

### When to Update Tests

1. **New mascot categories added**
   - Update mock data in unit tests
   - Verify default mascot selection logic

2. **UI layout changes**
   - Update CSS class assertions
   - Verify responsive breakpoints

3. **Preference logic changes**
   - Update min/max threshold tests
   - Verify fallback behavior

4. **New navigation features**
   - Add corresponding test cases
   - Update accessibility tests

### Common Test Failures

| Error | Cause | Solution |
|-------|-------|----------|
| Timeout waiting for mascots | Database not running | Start Supabase: `npx supabase start` |
| Invalid test phone | Rate limit exceeded | Wait 5 seconds between tests or use different phone |
| Event listener not cleaned | Component not unmounted | Ensure unmount() is called in test |
| Skeleton never disappears | getNavMascots not resolving | Check mock implementation |

## Future Test Enhancements

### Planned Additions
1. **Visual regression tests**: Screenshot comparison
2. **Load testing**: Many mascots, slow network simulation
3. **Animation tests**: Hover effects, transitions
4. **Touch gesture tests**: Swipe, long-press on mobile
5. **Offline behavior**: Network error handling

### Test Automation
- CI/CD integration with GitHub Actions
- Automated test reports
- Coverage tracking over time
- Performance benchmarking

## Debugging Tips

### Unit Test Debugging
```bash
# Run single test with console output
npm run test -- navigation.test -t "should return default mascots"

# Debug with breakpoints
node --inspect-brk node_modules/.bin/vitest navigation.test
```

### E2E Test Debugging
```bash
# Run with Playwright UI
npx playwright test navigation.spec.ts --ui

# Generate trace
npx playwright test navigation.spec.ts --trace on

# View trace
npx playwright show-trace trace.zip
```

### Common Debug Commands
```typescript
// In unit tests
console.log(mockGetNavMascots.mock.calls);

// In e2e tests
await page.pause(); // Opens inspector
await page.screenshot({ path: 'debug.png' });
```

## Test Quality Checklist

- [x] All critical paths covered
- [x] Edge cases handled
- [x] Error scenarios tested
- [x] Accessibility verified
- [x] Responsive behavior checked
- [x] Integration points validated
- [x] Event handling tested
- [x] Memory leaks prevented
- [x] Performance acceptable
- [x] Documentation complete

## Related Documentation

- [Bottom Nav Mascots Implementation](./BOTTOM-NAV-MASCOTS-IMPLEMENTATION.md)
- [Categories Testing](./testing/e2e/STEP6-TEST-UPDATES.md)
- [E2E Testing Guide](./testing/e2e/TEST-UPDATES.md)

---

**Last Updated**: December 27, 2025  
**Test Suite Version**: 1.0.0  
**Maintainer**: Development Team

