# Supabase Best Practices

> **Last Updated:** January 18, 2026
> 
> This guide consolidates best practices for using Supabase in a Next.js application, based on official Supabase documentation and real-world implementation patterns.

## Table of Contents

1. [Client Architecture](#client-architecture)
2. [Authentication Patterns](#authentication-patterns)
3. [Data Querying](#data-querying)
4. [Row Level Security (RLS)](#row-level-security-rls)
5. [Performance Optimization](#performance-optimization)
6. [Real-time Subscriptions](#real-time-subscriptions)
7. [Security Considerations](#security-considerations)
8. [Error Handling](#error-handling)
9. [Project-Specific Implementation](#project-specific-implementation)

---

## Client Architecture

### Three Client Types Required

Supabase requires **three distinct client implementations** for Next.js applications:

#### 1. Server Component Client

**Purpose:** For Server Components, Server Actions, and Route Handlers

**Location:** `src/server/supabase/client.server.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have proxy refreshing user sessions.
          }
        },
      },
    }
  )
}
```

**Key Points:**
- Uses `@supabase/ssr` package for cookie-based auth
- Handles cookie read/write operations
- Gracefully handles `setAll` errors in Server Components
- Always use `await` when calling `createClient()`

#### 2. Client Component Client

**Purpose:** For Client Components running in the browser

**Location:** `src/server/supabase/client.browser.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Key Points:**
- Uses `createBrowserClient` from `@supabase/ssr`
- Synchronous function (no `await` needed)
- Automatically handles browser cookie storage
- Only use in Client Components (`'use client'` directive)

#### 3. Middleware Client

**Purpose:** For Next.js middleware running on Edge Runtime

**Location:** `src/server/supabase/client.middleware.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  await supabase.auth.getUser()

  return response
}
```

**Key Points:**
- Handles session refresh on every request
- Updates cookies in both request and response
- Essential for maintaining auth state across page navigations

### ❌ Common Mistakes

```typescript
// ❌ DON'T: Use browser client in Server Components
import { createClient } from '@/server/supabase/client.browser'

export default async function ServerComponent() {
  const supabase = createClient() // Wrong client type!
  // ...
}

// ❌ DON'T: Forget to await server client creation
import { createClient } from '@/server/supabase/client.server'

export default async function ServerComponent() {
  const supabase = createClient() // Missing await!
  // ...
}

// ✅ DO: Use correct client type with proper async/await
import { createClient } from '@/server/supabase/client.server'

export default async function ServerComponent() {
  const supabase = await createClient() // Correct!
  // ...
}
```

---

## Authentication Patterns

### Server Actions (Recommended)

**Why:** Keeps credentials secure on the server, never exposed to client

```typescript
// app/auth/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/server/supabase/client.server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  // ⚠️ Always validate inputs in production
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  // Revalidate layout to update auth state
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/verify-email')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
```

### Getting Current User

```typescript
// Server Component
import { createClient } from '@/server/supabase/client.server'

export default async function Profile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <div>Hello {user.email}</div>
}
```

### Phone OTP Authentication

```typescript
// Send OTP
export async function sendOtp(phoneNumber: string) {
  'use server'
  
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    phone: phoneNumber,
  })

  if (error) throw error
}

// Verify OTP
export async function verifyOtp(phone: string, token: string) {
  'use server'
  
  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  })

  if (error) throw error
  
  revalidatePath('/', 'layout')
  redirect('/')
}
```

### Best Practices

✅ **DO:**
- Always use Server Actions for authentication
- Call `revalidatePath()` after auth state changes
- Validate all inputs before passing to Supabase
- Use TypeScript types for form data
- Handle errors gracefully with user-friendly messages

❌ **DON'T:**
- Expose service role key to the client
- Store passwords in plain text
- Skip input validation
- Ignore error responses
- Use client-side only authentication

---

## Data Querying

### Server Components (Preferred)

```typescript
import { createClient } from '@/server/supabase/client.server'
import { Suspense } from 'react'

// Async data fetching component
async function ExpensesList() {
  const supabase = await createClient()
  
  const { data: expenses, error } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching expenses:', error)
    return <div>Error loading expenses</div>
  }

  return (
    <ul>
      {expenses?.map(expense => (
        <li key={expense.id}>{expense.description}</li>
      ))}
    </ul>
  )
}

// Main component with Suspense
export default function ExpensesPage() {
  return (
    <Suspense fallback={<div>Loading expenses...</div>}>
      <ExpensesList />
    </Suspense>
  )
}
```

### Server Actions for Mutations

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/server/supabase/client.server'

export async function createExpense(formData: FormData) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const expense = {
    user_id: user.id,
    amount: parseFloat(formData.get('amount') as string),
    category: formData.get('category') as string,
    description: formData.get('description') as string,
    date: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select()
    .single()

  if (error) throw error

  // Revalidate the page to show new data
  revalidatePath('/expenses')
  
  return data
}

export async function deleteExpense(expenseId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId)

  if (error) throw error

  revalidatePath('/expenses')
}
```

### Client Components (when needed)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/server/supabase/client.browser'

export function RealtimeExpenses() {
  const [expenses, setExpenses] = useState([])
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    const fetchExpenses = async () => {
      const { data } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setExpenses(data)
    }

    fetchExpenses()

    // Set up real-time subscription
    const channel = supabase
      .channel('expenses_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'expenses'
      }, fetchExpenses)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <ul>
      {expenses.map(expense => (
        <li key={expense.id}>{expense.description}</li>
      ))}
    </ul>
  )
}
```

### Query Patterns

```typescript
// Filtering
const { data } = await supabase
  .from('expenses')
  .select('*')
  .eq('category', 'food')
  .gte('amount', 10)
  .lte('amount', 100)

// Joins
const { data } = await supabase
  .from('expenses')
  .select(`
    *,
    categories (
      name,
      icon
    )
  `)

// Pagination
const { data, count } = await supabase
  .from('expenses')
  .select('*', { count: 'exact' })
  .range(0, 9)
  .order('created_at', { ascending: false })

// Aggregation
const { data } = await supabase
  .from('expenses')
  .select('category, amount.sum()')
  .eq('user_id', userId)

// Text search
const { data } = await supabase
  .from('expenses')
  .select('*')
  .textSearch('description', 'coffee OR tea')
```

---

## Row Level Security (RLS)

### Critical Performance Optimization

#### ✅ Always Wrap Auth Functions in SELECT

**This is one of the most important optimizations for RLS performance.**

```sql
-- ❌ BAD: Function called for EVERY row (extremely slow)
create policy "user_access" on expenses
to authenticated
using ( auth.uid() = user_id );

-- ✅ GOOD: Function result cached per statement (fast)
create policy "user_access" on expenses
to authenticated
using ( (select auth.uid()) = user_id );
```

**Why?** Wrapping in `SELECT` allows PostgreSQL to create an "initPlan" that caches the function result for the entire query, rather than calling it for every single row.

#### ✅ Add Indexes on RLS Columns

```sql
-- Create RLS policy
create policy "user_access" on expenses
to authenticated
using ( (select auth.uid()) = user_id );

-- Add index for performance
create index idx_expenses_user_id 
on expenses 
using btree (user_id);
```

### Common RLS Patterns

#### User-specific Access

```sql
-- Users can only read their own expenses
create policy "Users can view own expenses"
on expenses for select
to authenticated
using ( (select auth.uid()) = user_id );

-- Users can only insert their own expenses
create policy "Users can insert own expenses"
on expenses for insert
to authenticated
with check ( (select auth.uid()) = user_id );

-- Users can only update their own expenses
create policy "Users can update own expenses"
on expenses for update
to authenticated
using ( (select auth.uid()) = user_id )
with check ( (select auth.uid()) = user_id );

-- Users can only delete their own expenses
create policy "Users can delete own expenses"
on expenses for delete
to authenticated
using ( (select auth.uid()) = user_id );
```

#### Organization/Team Access

```sql
-- Users can access data from their organization
create policy "org_access" on projects
to authenticated
using (
  (select auth.uid()) in (
    select user_id 
    from organization_members 
    where organization_id = projects.organization_id
  )
);

-- Add indexes for performance
create index idx_projects_org_id on projects(organization_id);
create index idx_org_members_user_org on organization_members(user_id, organization_id);
```

#### Public Read, Authenticated Write

```sql
-- Anyone can read
create policy "public_read" on blog_posts
for select
to anon, authenticated
using ( published = true );

-- Only authenticated users can write
create policy "authenticated_write" on blog_posts
for insert
to authenticated
with check ( (select auth.uid()) = author_id );
```

#### Using JWT Claims

```sql
-- Access based on custom JWT claims
create policy "admin_access" on admin_logs
to authenticated
using (
  (select auth.jwt() ->> 'user_role') = 'admin'
);
```

### Testing RLS Policies

```sql
-- Test as specific user
set request.jwt.claims.sub = 'user-id-here';

-- Test queries
select * from expenses;

-- Reset
reset request.jwt.claims.sub;
```

### RLS Best Practices

✅ **DO:**
- Always wrap `auth.uid()` and `auth.jwt()` in `SELECT` statements
- Add indexes on all columns used in RLS policies
- Test policies with different user roles
- Use specific policy names that describe what they do
- Enable RLS on all tables that contain user data

❌ **DON'T:**
- Create overly complex policies (break them into smaller ones)
- Forget to add indexes (huge performance impact)
- Use RLS as the only security layer (also validate on application level)
- Grant unnecessary permissions (principle of least privilege)

---

## Performance Optimization

### Database Indexes

#### Essential Indexes

```sql
-- Primary keys (automatic)
-- Foreign keys (critical for joins and RLS)
create index idx_expenses_user_id on expenses(user_id);
create index idx_expenses_category_id on expenses(category_id);

-- Frequently queried columns
create index idx_expenses_date on expenses(date);
create index idx_expenses_created_at on expenses(created_at);

-- Composite indexes for common queries
create index idx_expenses_user_date on expenses(user_id, date desc);

-- Partial indexes for specific conditions
create index idx_expenses_pending on expenses(user_id) 
where status = 'pending';
```

#### Check Query Performance

```sql
-- Use EXPLAIN ANALYZE to check query performance
explain analyze
select * from expenses 
where user_id = 'user-id' 
and date >= '2024-01-01';
```

### Connection Pooling

```typescript
// Use connection pooler for serverless functions
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: false,
    },
  }
)
```

### Caching Strategies

#### SWR (Stale-While-Revalidate)

```typescript
'use client'

import useSWR from 'swr'
import { createClient } from '@/server/supabase/client.browser'

function useExpenses() {
  const supabase = createClient()
  
  return useSWR('expenses', async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  })
}
```

#### Next.js Cache

```typescript
import { cache } from 'react'
import { createClient } from '@/server/supabase/client.server'

// Cache for the duration of the request
export const getExpenses = cache(async (userId: string) => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    
  if (error) throw error
  return data
})
```

### Batch Operations

```typescript
// ✅ Good: Batch insert
const expenses = [
  { amount: 50, category: 'food' },
  { amount: 100, category: 'transport' },
  { amount: 25, category: 'entertainment' },
]

const { data, error } = await supabase
  .from('expenses')
  .insert(expenses)

// ❌ Bad: Individual inserts
for (const expense of expenses) {
  await supabase.from('expenses').insert(expense) // Multiple round trips!
}
```

### Limit Result Sets

```typescript
// Always use limits for large datasets
const { data } = await supabase
  .from('expenses')
  .select('*')
  .limit(100) // Prevents loading too much data
  .order('created_at', { ascending: false })
```

---

## Real-time Subscriptions

### Setup

```sql
-- Enable replica identity for full change data
alter table expenses replica identity full;

-- Enable real-time for specific tables (done in Supabase Dashboard)
```

### Basic Subscription

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/server/supabase/client.browser'

export function RealtimeExpenses() {
  const [expenses, setExpenses] = useState([])
  const supabase = createClient()

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      const { data } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setExpenses(data)
    }

    fetchData()

    // Subscribe to changes
    const channel = supabase
      .channel('expenses_db_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
        },
        (payload) => {
          console.log('Change received!', payload)
          
          if (payload.eventType === 'INSERT') {
            setExpenses(prev => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setExpenses(prev =>
              prev.map(exp => exp.id === payload.new.id ? payload.new : exp)
            )
          } else if (payload.eventType === 'DELETE') {
            setExpenses(prev =>
              prev.filter(exp => exp.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <ul>
      {expenses.map(expense => (
        <li key={expense.id}>{expense.description}</li>
      ))}
    </ul>
  )
}
```

### Filtered Subscriptions

```typescript
// Listen to specific user's changes
const channel = supabase
  .channel('user_expenses')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'expenses',
      filter: `user_id=eq.${userId}`,
    },
    handleChange
  )
  .subscribe()
```

### Presence (Track Online Users)

```typescript
const channel = supabase.channel('online-users', {
  config: {
    presence: {
      key: userId,
    },
  },
})

// Track presence
channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState()
    console.log('Online users:', Object.keys(state))
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('User joined:', key)
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    console.log('User left:', key)
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ online_at: new Date().toISOString() })
    }
  })
```

### Best Practices

✅ **DO:**
- Always clean up subscriptions with `removeChannel()`
- Use specific channel names
- Handle all event types (INSERT, UPDATE, DELETE)
- Enable real-time only on tables that need it
- Use filters to reduce unnecessary events

❌ **DON'T:**
- Create multiple subscriptions to the same table
- Forget to unsubscribe (memory leaks)
- Enable real-time on all tables (performance/cost impact)
- Use for data fetching (use queries instead)

---

## Security Considerations

### Environment Variables

```typescript
// src/shared/config/env.ts
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
})

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
})
```

### Service Role (Admin) Client

**⚠️ CRITICAL: Never expose service role key to the browser!**

```typescript
// ✅ Server-side only (e.g., API route or server action)
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Server-only!
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// Use for admin operations that bypass RLS
export async function deleteUserAccount(userId: string) {
  'use server'
  
  const supabase = createAdminClient()
  
  // This bypasses RLS policies
  const { error } = await supabase.auth.admin.deleteUser(userId)
  
  if (error) throw error
}
```

### Input Validation

```typescript
// Always validate inputs
import { z } from 'zod'

const expenseSchema = z.object({
  amount: z.number().positive().max(1000000),
  category: z.string().min(1).max(50),
  description: z.string().max(500),
  date: z.string().datetime(),
})

export async function createExpense(rawData: unknown) {
  'use server'
  
  // Validate input
  const validated = expenseSchema.parse(rawData)
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('expenses')
    .insert(validated)
  
  if (error) throw error
  return data
}
```

### Rate Limiting

```typescript
// src/server/ratelimit/limiter.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

// Use in API routes or server actions
export async function createExpense(formData: FormData) {
  'use server'
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { success } = await ratelimit.limit(user.id)
  if (!success) throw new Error('Rate limit exceeded')
  
  // ... rest of logic
}
```

### SQL Injection Prevention

```typescript
// ✅ Safe: Using Supabase query builder (parameterized)
const { data } = await supabase
  .from('expenses')
  .select('*')
  .eq('category', userInput) // Safe!

// ❌ Dangerous: Raw SQL with user input
const { data } = await supabase.rpc('raw_query', {
  query: `SELECT * FROM expenses WHERE category = '${userInput}'` // Dangerous!
})

// ✅ Safe: If you must use RPC, use parameters
const { data } = await supabase.rpc('get_expenses_by_category', {
  category_name: userInput // Safe!
})
```

---

## Error Handling

### Typed Error Handling

```typescript
import { PostgrestError } from '@supabase/supabase-js'

export async function getExpenses() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
  
  if (error) {
    // Handle specific error codes
    if (error.code === 'PGRST116') {
      console.error('Table not found')
    } else if (error.code === '42501') {
      console.error('Permission denied - check RLS policies')
    }
    
    throw new Error(`Database error: ${error.message}`)
  }
  
  return data
}
```

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `PGRST116` | Table not found | Check table name spelling |
| `42501` | Permission denied | Check RLS policies |
| `23505` | Unique constraint violation | Handle duplicate entries |
| `23503` | Foreign key violation | Check referenced record exists |
| `22P02` | Invalid input syntax | Validate data types |

### Error Boundaries

```typescript
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### Graceful Degradation

```typescript
async function ExpensesList() {
  const supabase = await createClient()
  
  const { data: expenses, error } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false })

  // Show error UI instead of throwing
  if (error) {
    return (
      <div className="error-state">
        <p>Unable to load expenses</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    )
  }

  // Show empty state
  if (!expenses || expenses.length === 0) {
    return (
      <div className="empty-state">
        <p>No expenses yet</p>
      </div>
    )
  }

  return (
    <ul>
      {expenses.map(expense => (
        <li key={expense.id}>{expense.description}</li>
      ))}
    </ul>
  )
}
```

---

## Project-Specific Implementation

### Our Architecture

This project follows a **vertical slice architecture** with three Supabase clients:

```
src/
├── server/
│   └── supabase/
│       ├── client.browser.ts   # Client Components
│       ├── client.server.ts    # Server Components/Actions
│       └── client.middleware.ts # Middleware
├── features/
│   └── [feature]/
│       ├── domain/      # Pure TypeScript (no Supabase)
│       ├── data/        # Supabase queries
│       ├── actions/     # Server Actions + hooks
│       └── ui/          # React components
```

### Usage Guidelines

#### In Feature Domains (Pure Logic)

```typescript
// src/features/expenses/domain/expense.types.ts
// ✅ No Supabase imports - pure types
export type Expense = {
  id: string
  amount: number
  category: string
  description: string
  user_id: string
  created_at: string
}

// src/features/expenses/domain/calculations/expense-totals.ts
// ✅ Pure functions - no database
export function calculateTotal(expenses: Expense[]): number {
  return expenses.reduce((sum, exp) => sum + exp.amount, 0)
}
```

#### In Data Layer

```typescript
// src/features/expenses/data/expense.repository.ts
import { createClient } from '@/server/supabase/client.server'

export async function getExpenses(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}
```

#### In Server Actions

```typescript
// src/features/expenses/actions/createExpense.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/server/supabase/client.server'
import { expenseSchema } from '../domain/expense.schema'

export async function createExpense(formData: FormData) {
  const supabase = await createClient()
  
  // Get user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Validate
  const validated = expenseSchema.parse({
    amount: parseFloat(formData.get('amount') as string),
    category: formData.get('category'),
    description: formData.get('description'),
  })

  // Insert
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      ...validated,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/expenses')
  return data
}
```

#### In Client Hooks

```typescript
// src/features/expenses/actions/useCreateExpense.ts
'use client'

import { useMutation } from '@tanstack/react-query'
import { createExpense } from './createExpense'

export function useCreateExpense() {
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      // Handle success
    },
    onError: (error) => {
      // Handle error
    },
  })
}
```

### Checklist for New Features

When adding a new feature with database access:

- [ ] Create migration in `supabase/migrations/`
- [ ] Enable RLS on new tables
- [ ] Add RLS policies with `SELECT`-wrapped auth functions
- [ ] Add indexes on foreign keys and frequently queried columns
- [ ] Create types in `domain/` (no Supabase dependencies)
- [ ] Create repository functions in `data/`
- [ ] Create Server Actions in `actions/`
- [ ] Add Zod validation schemas
- [ ] Create client hooks if needed
- [ ] Test with different user roles
- [ ] Add error handling
- [ ] Document any non-obvious behavior

---

## Quick Reference

### Command Cheat Sheet

```bash
# Start local Supabase
supabase start

# Create migration
supabase migration new feature_name

# Apply migrations
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > src/shared/types/database.types.ts

# Check status
supabase status

# View logs
supabase logs

# Stop Supabase
supabase stop
```

### Common Patterns

```typescript
// ✅ Server Component data fetching
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

// ✅ Client Component with hook
function Component() {
  const { data } = useQuery({
    queryKey: ['data'],
    queryFn: async () => {
      const supabase = createClient()
      const { data } = await supabase.from('table').select()
      return data
    }
  })
}
```

---

## Additional Resources

- [Official Supabase Docs](https://supabase.com/docs)
- [Supabase Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Row Level Security Deep Dive](https://supabase.com/docs/learn/auth-deep-dive/auth-row-level-security)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Last Updated:** January 18, 2026
