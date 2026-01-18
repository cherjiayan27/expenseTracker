# Best Practices Summary - Context7 Verified

> **Generated:** January 18, 2026
> 
> This document summarizes the key best practices for NextJS, React, Supabase, and Testing based on official documentation queries via Context7 and project-specific implementation patterns.

---

## Table of Contents

1. [Quick Decision Framework](#quick-decision-framework)
2. [NextJS & React Core Principles](#nextjs--react-core-principles)
3. [Supabase Integration Patterns](#supabase-integration-patterns)
4. [Testing Strategy](#testing-strategy)
5. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
6. [Quick Reference](#quick-reference)

---

## Quick Decision Framework

Use this flowchart when implementing a new feature:

```
┌─────────────────────────────────┐
│   New Feature Requirement      │
└────────────┬────────────────────┘
             │
             ▼
      ┌──────────────┐
      │ Does it need │
      │ interactivity?│
      └──┬────────┬──┘
         │ NO     │ YES
         ▼        ▼
    ┌─────────┐  ┌──────────────┐
    │ Server  │  │ Client       │
    │Component│  │ Component    │
    │         │  │ ('use client')│
    └────┬────┘  └──────┬───────┘
         │              │
         ▼              ▼
    ┌─────────┐  ┌──────────────┐
    │ Fetch   │  │ Receives     │
    │ data    │  │ data as props│
    │ directly│  │ from Server  │
    └────┬────┘  └──────┬───────┘
         │              │
         ▼              ▼
    ┌─────────────────────┐
    │ Use correct Supabase│
    │ client for context  │
    └─────────────────────┘
```

**Key Questions:**
1. **Needs browser APIs/hooks/state?** → Client Component
2. **Static or data-driven?** → Server Component
3. **Complex state logic?** → useReducer + Context
4. **Performance concern?** → Measure first, then optimize

---

## NextJS & React Core Principles

### 1. Server Components First (Default)

**Rule:** Every component is a Server Component by default in App Router.

```typescript
// ✅ Server Component (default)
export default async function ExpensesPage() {
  const supabase = await createClient()
  const { data: expenses } = await supabase.from('expenses').select('*')
  
  return <ExpensesList expenses={expenses} />
}

// ✅ Client Component (only when needed)
'use client'
export function ExpensesList({ expenses }) {
  const [filter, setFilter] = useState('')
  // Interactive features here
}
```

**When to use Client Components:**
- Event handlers (`onClick`, `onChange`, etc.)
- React hooks (`useState`, `useEffect`, etc.)
- Browser APIs (`localStorage`, `window`, etc.)
- Third-party libraries that require client-side execution

### 2. Component Composition Pattern

**Best Practice:** Server Components fetch data, Client Components handle interactivity.

```typescript
// page.tsx (Server Component)
async function getData() {
  const res = await fetch('https://api.example.com/data')
  return res.json()
}

export default async function Page() {
  const data = await getData()
  return <ClientComponent data={data} />
}
```

```typescript
// client-component.tsx (Client Component)
'use client'

export default function ClientComponent({ data }) {
  const [selected, setSelected] = useState(null)
  return (
    <div>
      {data.map(item => (
        <button key={item.id} onClick={() => setSelected(item)}>
          {item.name}
        </button>
      ))}
    </div>
  )
}
```

### 3. Data Fetching Strategies

**Three caching strategies in NextJS:**

```typescript
// Static (default) - like getStaticProps
const data = await fetch('https://api.example.com/posts', { 
  cache: 'force-cache' 
})

// Dynamic - like getServerSideProps
const data = await fetch('https://api.example.com/posts', { 
  cache: 'no-store' 
})

// Revalidated (ISR) - Incremental Static Regeneration
const data = await fetch('https://api.example.com/posts', {
  next: { revalidate: 60 } // Revalidate every 60 seconds
})
```

### 4. State Management Decision Tree

```
Simple state (1-2 variables)
  → useState

Complex state (multiple sub-values, interdependent)
  → useReducer

App-wide state (many components need access)
  → useReducer + Context

External server state (API data)
  → React Query / SWR
```

**useState vs useReducer:**

| Aspect | useState | useReducer |
|--------|----------|------------|
| Code size | Less upfront | More (reducer + actions) |
| Readability | Simple updates | Complex updates cleaner |
| Debugging | Harder to trace | Action logs help |
| Testing | Test components | Test reducer in isolation |

### 5. React Core Rules

**Pure Components & Hooks:**
- Same inputs → same outputs
- No side effects during render
- Side effects belong in `useEffect` or event handlers

```typescript
// ❌ Bad - side effect during render
function Component() {
  localStorage.setItem('key', 'value') // Wrong!
  return <div>Hello</div>
}

// ✅ Good - side effect in useEffect
function Component() {
  useEffect(() => {
    localStorage.setItem('key', 'value')
  }, [])
  return <div>Hello</div>
}
```

**Rules of Hooks:**
- Call at top level only (no loops, conditions, nested functions)
- Call from React functions or custom Hooks only

---

## Supabase Integration Patterns

### 1. Three Client Types (Critical)

**You MUST use the correct client for the context:**

```typescript
// 1. Server Component/Action → client.server.ts
import { createClient } from '@/server/supabase/client.server'

export default async function ServerComponent() {
  const supabase = await createClient() // ← Must await!
  const { data } = await supabase.from('table').select()
  return <div>{/* ... */}</div>
}

// 2. Client Component → client.browser.ts
'use client'
import { createClient } from '@/server/supabase/client.browser'

export default function ClientComponent() {
  const supabase = createClient() // ← No await
  // ...
}

// 3. Middleware → client.middleware.ts
import { updateSession } from '@/server/supabase/client.middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}
```

### 2. Authentication Pattern

**Always use Server Actions for auth (keeps credentials secure):**

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/server/supabase/client.server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) redirect('/error')

  revalidatePath('/', 'layout') // ← Critical for auth state update
  redirect('/')
}
```

### 3. Row Level Security (RLS) - Performance Critical

**⚠️ MOST IMPORTANT RLS OPTIMIZATION:**

```sql
-- ❌ BAD: Function called for EVERY row (slow)
create policy "user_access" on expenses
using ( auth.uid() = user_id );

-- ✅ GOOD: Function result cached (fast)
create policy "user_access" on expenses
using ( (select auth.uid()) = user_id );
```

**Why?** Wrapping in `SELECT` creates an "initPlan" that caches the result.

**Always add indexes:**

```sql
-- RLS policy
create policy "user_access" on expenses
to authenticated
using ( (select auth.uid()) = user_id );

-- Critical index for performance
create index idx_expenses_user_id on expenses(user_id);
```

### 4. Data Querying Patterns

**Server Component (preferred):**

```typescript
import { createClient } from '@/server/supabase/client.server'
import { Suspense } from 'react'

async function DataComponent() {
  const supabase = await createClient()
  const { data } = await supabase.from('expenses').select('*')
  return <div>{/* render data */}</div>
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DataComponent />
    </Suspense>
  )
}
```

**Server Action (for mutations):**

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/server/supabase/client.server'

export async function createExpense(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('expenses')
    .insert({ /* ... */ })

  if (error) throw error

  revalidatePath('/expenses') // ← Refresh cached data
  return data
}
```

### 5. Security Checklist

✅ **Always:**
- Use correct Supabase client for context
- Enable RLS on all user data tables
- Wrap `auth.uid()` in `SELECT` statements
- Add indexes on RLS columns
- Validate all inputs with Zod
- Call `revalidatePath()` after auth changes
- Never expose service role key to client

❌ **Never:**
- Use browser client in Server Components
- Forget to `await` server client creation
- Skip input validation
- Create RLS policies without indexes
- Use service role key in client code

---

## Testing Strategy

### Test Pyramid

```
        /\
       /  \      ← Few E2E Tests (critical flows)
      /────\
     /      \    ← Some Integration Tests (wiring)
    /────────\
   /          \  ← Many Unit Tests (logic)
  /____________\
```

**Principles:**
1. **Behavior > Implementation** - Test what users observe
2. **Determinism is non-negotiable** - No flaky tests
3. **Right level, right cost** - Unit for logic, E2E for flows

### AAA Structure (Must Follow)

```typescript
test('should calculate total expense correctly', () => {
  // Arrange
  const expenses = [
    { amount: 50, category: 'food' },
    { amount: 100, category: 'transport' },
  ]

  // Act
  const total = calculateTotal(expenses)

  // Assert
  expect(total).toBe(150)
})
```

### E2E Selector Strategy

1. **Prefer semantic**: `getByRole`, `getByLabel`, `getByPlaceholder`
2. **Fallback**: `data-testid` for non-semantic elements
3. **Last resort**: CSS selectors (avoid)

```typescript
// ✅ Good - semantic
await page.getByRole('button', { name: 'Submit' }).click()
await page.getByLabel('Email').fill('test@example.com')

// 🟡 OK - testid when needed
await page.getByTestId('expense-list-item').click()

// ❌ Bad - brittle CSS
await page.locator('div.container > ul > li:nth-child(2)').click()
```

### Must-Follow Rules

- **One behavior per test** - Test fails for one reason only
- **No hidden async** - Wait for conditions, not fixed sleeps
- **No global leaks** - Reset mocks/timers between tests
- **Deterministic data** - Control time, randomness, network

---

## Common Pitfalls & Solutions

### 1. Wrong Supabase Client

```typescript
// ❌ Problem: Using browser client in Server Component
import { createClient } from '@/server/supabase/client.browser'

export default async function ServerComponent() {
  const supabase = createClient() // Wrong!
  // ...
}

// ✅ Solution: Use server client with await
import { createClient } from '@/server/supabase/client.server'

export default async function ServerComponent() {
  const supabase = await createClient() // Correct!
  // ...
}
```

### 2. Forgetting revalidatePath After Mutations

```typescript
// ❌ Problem: UI doesn't update after mutation
export async function createExpense(data) {
  'use server'
  const supabase = await createClient()
  await supabase.from('expenses').insert(data)
  // Missing revalidatePath!
}

// ✅ Solution: Always revalidate
export async function createExpense(data) {
  'use server'
  const supabase = await createClient()
  await supabase.from('expenses').insert(data)
  revalidatePath('/expenses') // Refresh cache
}
```

### 3. Slow RLS Policies

```sql
-- ❌ Problem: Function called for every row
create policy "user_access" on expenses
using ( auth.uid() = user_id );

-- ✅ Solution: Wrap in SELECT + add index
create policy "user_access" on expenses
using ( (select auth.uid()) = user_id );

create index idx_expenses_user_id on expenses(user_id);
```

### 4. Unnecessary Client Components

```typescript
// ❌ Problem: Entire page is client component
'use client'

export default async function Page() {
  const [data, setData] = useState([])
  // Entire page ships JavaScript
}

// ✅ Solution: Minimize client boundary
export default async function Page() {
  const data = await getData() // Server Component
  return <ClientList data={data} /> // Only list is client
}
```

### 5. Not Validating Inputs

```typescript
// ❌ Problem: No input validation
export async function createExpense(formData: FormData) {
  'use server'
  const supabase = await createClient()
  await supabase.from('expenses').insert({
    amount: formData.get('amount'), // Could be anything!
  })
}

// ✅ Solution: Always validate with Zod
import { z } from 'zod'

const schema = z.object({
  amount: z.number().positive().max(1000000),
  category: z.string().min(1).max(50),
})

export async function createExpense(formData: FormData) {
  'use server'
  const validated = schema.parse({
    amount: parseFloat(formData.get('amount') as string),
    category: formData.get('category'),
  })
  // Now safe to use
}
```

---

## Quick Reference

### Decision Matrix

| Scenario | Use | Why |
|----------|-----|-----|
| Static content | Server Component | No JS needed |
| Fetch data | Server Component | Secure, fast |
| Interactive UI | Client Component | Needs state/events |
| Form submission | Server Action | Secure, progressive |
| Simple state | `useState` | Less code |
| Complex state | `useReducer` | Better debugging |
| App-wide state | Reducer + Context | Avoid prop drilling |
| Auth operations | Server Action | Never expose credentials |
| Database queries | Server Component/Action | Security + RLS |
| Real-time updates | Client Component | Browser subscription |

### Code Patterns

```typescript
// ✅ Server Component data fetch
async function Component() {
  const supabase = await createClient()
  const { data } = await supabase.from('table').select()
  return <div>{JSON.stringify(data)}</div>
}

// ✅ Server Action mutation
async function action(formData: FormData) {
  'use server'
  const supabase = await createClient()
  await supabase.from('table').insert({...})
  revalidatePath('/path')
}

// ✅ Client Component with hooks
'use client'
function Component() {
  const [state, setState] = useState(null)
  const supabase = createClient()
  // Interactive logic
}

// ✅ RLS with performance
-- SQL
create policy "name" on table
using ( (select auth.uid()) = user_id );
create index idx_table_user_id on table(user_id);
```

### Validation Pattern

```typescript
import { z } from 'zod'

// Define schema
const schema = z.object({
  amount: z.number().positive(),
  category: z.string().min(1),
})

// Use in Server Action
export async function action(formData: FormData) {
  'use server'
  const validated = schema.parse({
    amount: parseFloat(formData.get('amount') as string),
    category: formData.get('category') as string,
  })
  // Safe to use validated data
}
```

### Project Structure Pattern

```
src/features/[feature]/
  ├── domain/         # Pure TypeScript (no React/Supabase)
  ├── data/           # Supabase queries (repository pattern)
  ├── actions/        # Server Actions + client hooks
  └── ui/             # React components
```

---

## Golden Rules Summary

### NextJS
1. ✅ Default to Server Components
2. ✅ Fetch data in Server Components, pass to Client Components
3. ✅ Use appropriate cache strategy (`force-cache`, `no-store`, `revalidate`)
4. ✅ Minimize Client Component boundaries

### React
1. ✅ Components must be pure (no side effects during render)
2. ✅ Choose right state tool (useState vs useReducer vs Context)
3. ✅ Follow Rules of Hooks (top level only)
4. ✅ Optimize deliberately (measure first)

### Supabase
1. ✅ Use correct client type (server/browser/middleware)
2. ✅ Always `await` server client creation
3. ✅ Wrap `auth.uid()` in `SELECT` for RLS
4. ✅ Add indexes on RLS columns
5. ✅ Validate all inputs with Zod
6. ✅ Call `revalidatePath()` after mutations
7. ✅ Never expose service role key to client

### Testing
1. ✅ Follow test pyramid (many unit, some integration, few E2E)
2. ✅ Use AAA structure (Arrange, Act, Assert)
3. ✅ One behavior per test
4. ✅ Prefer semantic selectors
5. ✅ Make tests deterministic (control time/randomness/network)

---

## Additional Resources

- [NextJS Best Practices (Detailed)](./nextjs-react-best-practices.md)
- [Supabase Best Practices (Detailed)](./supabase-best-practices.md)
- [Testing Best Practices](./testing-best-practices.md)
- [Project Architecture Notes](../ARCHITECTURE-NOTES.md)

---

**Generated from Context7 documentation queries:**
- NextJS Library: `/vercel/next.js`
- React Library: `/websites/18_react_dev`
- Supabase Library: `/websites/supabase`, `/supabase/supabase-js`

**Last Updated:** January 18, 2026
