# Architecture Notes

## Authentication & Redirect Strategy

### Problem: Redirect Loops

**Issue**: Using `redirect()` from `next/navigation` in Server Components that fetch data can create infinite redirect loops.

**Scenario**:
1. User visits `/dashboard`
2. Server Component calls `getExpenses()`
3. `getExpenses()` checks auth and calls `redirect("/login")`
4. Middleware sees session cookie and redirects back to `/dashboard`
5. Loop repeats infinitely

**Root Cause**: Race condition between middleware session check and Server Component `getUser()` call.

### Solution: Single Source of Truth

**Principle**: Middleware handles ALL authentication redirects. Server Components focus only on data.

#### ✅ Correct Pattern:

```typescript
// middleware.ts - ONLY place for auth redirects
export async function middleware(request: NextRequest) {
  const { session } = await supabase.auth.getSession();
  
  if (isAppRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  return response;
}

// Server Action - Return empty/error, don't redirect
export const getExpenses = cache(async () => {
  const { user } = await supabase.auth.getUser();
  
  if (!user) {
    return []; // ✅ Return empty, let middleware handle routing
  }
  
  return await getUserExpenses(user.id);
});
```

#### ❌ Anti-Pattern:

```typescript
// DON'T DO THIS - Creates redirect loops
export const getExpenses = cache(async () => {
  const { user } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login"); // ❌ Conflicts with middleware
  }
  
  return await getUserExpenses(user.id);
});
```

### Benefits

1. **No Race Conditions**: Single source of truth for auth redirects
2. **Graceful Degradation**: Components return empty data instead of crashing
3. **Better UX**: Middleware redirects are faster than Server Component redirects
4. **Clearer Separation**: Routing logic stays in routing layer

### Implementation in This Project

- ✅ `src/middleware.ts` - Handles all authentication redirects
- ✅ `src/features/*/actions/getExpenses.ts` - Returns empty array if no user
- ✅ `src/features/*/actions/createExpense.ts` - Returns error if no user
- ✅ All Server Components - Trust middleware for auth, focus on data

### When to Use redirect()

**Acceptable use cases**:
- After successful form submission (e.g., `redirect("/dashboard")` after login)
- Explicit user-triggered navigation
- One-time redirects NOT in render path

**Avoid**:
- In data-fetching functions
- In Server Components that run on every render
- Anywhere that could conflict with middleware

---

**Last Updated**: December 25, 2025  
**Related**: Step 4 implementation

