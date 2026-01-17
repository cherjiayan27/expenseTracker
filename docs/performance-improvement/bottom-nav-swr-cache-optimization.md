# Bottom Navigation SWR Cache Optimization

## Date
January 17, 2026

## Problem Statement
When users made changes to their category mascot preferences on the Categories page and returned to the Home page, the bottom navigation bar did not reflect the updated mascots. The nav showed stale cached data because:

1. The update signal was an in-memory event emitter that only worked when `BottomNav` was mounted.
2. When navigating to `/categories`, `BottomNav` was unmounted and couldn't listen to preference updates.
3. On return to Home, SWR served cached data without revalidating (by design: `revalidateOnFocus: false`).

## Solution Overview
Implemented **SWR as a global cache store** pattern, where category preference saves directly update the SWR cache, eliminating the need for event-based revalidation and ensuring the nav always shows the latest data.

## Architecture Change

### Before (Event-Driven)
```
User saves preferences
  → Server action persists to Supabase
  → Emit "categoryPreferencesUpdated" event
  → BottomNav listener (if mounted) triggers mutate()
  → SWR refetches from server
```

**Issues:**
- Event listeners only work when component is mounted
- Navigation causes listener cleanup
- Stale data on return to Home

### After (Cache-First)
```
User saves preferences
  → Server action persists to Supabase
  → Compute CategoryImage[] from saved paths
  → Directly update SWR cache: mutate("nav-mascots", newData, false)
  → BottomNav reads from updated cache (no refetch needed)
```

**Benefits:**
- Cache is always authoritative after save
- No dependency on component mount state
- Zero unnecessary fetches on navigation
- Simpler data flow

## Implementation Details

### Changes to `useCategoryPreferences.ts`
After a successful save to Supabase, the hook now:

1. Maps the saved image paths to full `CategoryImage[]` objects
2. Updates the SWR cache directly using `mutate("nav-mascots", updatedMascots, false)`
3. The `false` parameter means "don't revalidate" — we trust the data we just saved

```typescript
// After successful save
const imageByPath = new Map(CATEGORY_IMAGES.map((img) => [img.path, img]));
const updatedMascots = paths
  .map((path) => imageByPath.get(path))
  .filter((img): img is CategoryImage => Boolean(img));

mutate("nav-mascots", updatedMascots, false);
```

### Changes to `BottomNav.tsx`
Removed event-based revalidation logic:

- Removed `useEffect` hook that subscribed to `categoryPreferencesUpdated`
- Removed `subscribeCategoryPreferencesUpdated` import
- Removed `mutate` import from SWR (no longer manually triggering refetch)
- Component now simply reads from SWR cache via `useSWR("nav-mascots", getNavMascots)`

### Kept Intact
- Event emitter code (`categoryPreferencesEvents.ts`) remains for backward compatibility
- SWR configuration unchanged: still caches for 60s with no focus/reconnect revalidation
- Server action `getNavMascots` unchanged

## User Experience Flow

### First Load (Authenticated User)
1. BottomNav mounts and calls `useSWR("nav-mascots", getNavMascots)`
2. SWR fetches from Supabase via server action
3. Cache is populated with user's selected mascots
4. Nav renders with loading skeleton → mascot images

### No Changes Made
1. User navigates between pages
2. BottomNav reads from SWR cache (no refetch)
3. Instant rendering with cached mascots
4. Zero server calls

### User Changes Mascots
1. User adds/removes images on Categories page
2. Save triggers `saveCategoryMascotPreferences` (Supabase write)
3. `useCategoryPreferences` updates SWR cache immediately
4. User navigates back to Home
5. BottomNav reads from already-updated cache
6. **Latest mascots displayed instantly, no fetch needed**

## Performance Metrics

### Eliminated Overhead
- **Removed event listener setup/cleanup** on every BottomNav mount
- **Zero refetches** when navigating back after preference changes
- **Eliminated race conditions** from async event handling

### Improved UX
- **Instant updates**: Nav shows latest mascots immediately on return
- **Consistent state**: Cache is single source of truth
- **Predictable behavior**: No timing dependencies on mount/unmount

## Technical Benefits

### 1. Simpler Mental Model
- One data source: SWR cache
- One update path: direct cache mutation on save
- No distributed state across events and cache

### 2. More Reliable
- No dependency on component lifecycle
- No risk of missed events during navigation
- Cache can't be out of sync with what was saved

### 3. Better Performance
- Fewer network requests (no refetch on return)
- Less client-side computation (no event bus overhead)
- Faster perceived load times (cache hit on navigation)

### 4. Easier to Debug
- Clear data flow: save → mutate cache → render
- No async event timing issues
- SWR DevTools shows cache state directly

## Migration Notes

### Backward Compatibility
- Event emitter code remains in place
- No breaking changes to public APIs
- Categories page behavior unchanged from user perspective

### Future Cleanup Opportunities
- Can remove `categoryPreferencesEvents.ts` entirely
- Can remove `emitCategoryPreferencesUpdated()` calls from hooks
- Can document SWR as the standard pattern for shared client state

## Testing Recommendations

1. **Test: Fresh load after preference change**
   - Change mascots on Categories page
   - Navigate to Home
   - Verify nav shows new mascots without loading state

2. **Test: No changes made**
   - Navigate to Categories (don't change anything)
   - Navigate to Home
   - Verify nav shows cached mascots instantly

3. **Test: Multiple rapid changes**
   - Add/remove multiple mascots quickly
   - Navigate to Home
   - Verify nav reflects the final state

4. **Test: Unauthenticated users**
   - Log out
   - Verify nav shows default mascots
   - No errors in console

## Related Files
- `src/features/user/actions/useCategoryPreferences.ts` - Cache update logic
- `src/components/navigation/BottomNav.tsx` - Cache consumer
- `src/features/user/actions/getNavMascots.ts` - Server action (unchanged)
- `src/features/user/actions/categoryPreferencesEvents.ts` - Event emitter (kept for compatibility)

## Commit Reference
- Commit: `3a929fc`
- Message: "perf: performance improvement for bottom navigation bar"
- Date: January 17, 2026

## Lessons Learned

### When to Use SWR as Global State
SWR cache is ideal when:
- Data is shared across multiple components/routes
- Updates are explicit (user actions, not reactive)
- You want smart caching without manual cache management
- Server data is the source of truth

### When to Use Events
Event emitters are better when:
- Multiple independent listeners need to react
- Updates are reactive (WebSocket, polling)
- Listeners need to trigger side effects beyond UI updates
- Component-to-component communication without shared state

### Key Takeaway
For user preference data that needs to persist across navigation, **treat SWR as your client-side database** and mutate it directly after successful saves. This eliminates the complexity of event-driven synchronization.
