# Quick Reference for AI Assistants

This document provides a quick reference for AI assistants (like Cursor AI) working with this codebase.

## Project Type
Next.js 15 (App Router) + TypeScript + Supabase expense tracker

## Setup Commands (Fresh Clone)
```bash
npm install
supabase start
cp .env.example .env.local
npm run dev
```

## Architecture Pattern
**Vertical Slice Architecture** - Each feature is self-contained in `src/features/`

### Feature Structure
```
src/features/<feature-name>/
├── domain/          # Pure business logic (no React/Next/Supabase)
├── data/           # Database queries, data mappers
├── actions/        # Server Actions + client hooks
├── ui/             # React components
└── index.ts        # Public API exports
```

## Critical Files

### Supabase Clients (3 variants - use the right one!)
- `src/server/supabase/client.browser.ts` → Client Components
- `src/server/supabase/client.server.ts` → Server Components, Server Actions
- `src/server/supabase/client.middleware.ts` → Middleware (Edge Runtime)

### Environment Config
- `src/shared/config/env.ts` - Validated with Zod, typed env vars
- `.env.local` - Local environment variables (gitignored)
- `.env.example` - Template with default local keys

### Database
- `supabase/config.toml` - Supabase configuration
- `supabase/migrations/*.sql` - Database migrations (timestamped)
- `supabase/seed.sql` - Seed data

## Environment Variables

### Required Variables (Both Names for Same Values)
```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<jwt-token>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<same-as-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-jwt>
SUPABASE_SECRET_KEY=<same-as-service-role>
```

**Why duplicate keys?** App uses both naming conventions for compatibility.

## Common Operations

### Database
```bash
supabase start              # Start local Supabase
supabase status            # Check status, get credentials
supabase db reset          # Drop + migrate + seed
supabase migration new X   # Create new migration
supabase db diff           # Check for schema changes
```

### Development
```bash
npm run dev                # Start Next.js dev server
npm test                   # Run unit tests (Vitest)
npm run test:e2e          # Run E2E tests (Playwright)
npm run typecheck         # TypeScript check
npm run lint              # ESLint
```

## Key Patterns

### Server Actions Pattern
```typescript
// actions/create-expense.action.ts
'use server'
export async function createExpense(data: FormData) {
  const supabase = await createServerClient()
  // ... implementation
}

// actions/use-expenses.ts
export function useExpenses() {
  return useSWR('/api/expenses', fetcher)
}
```

### Domain Layer Rules
- ✅ Pure TypeScript functions
- ✅ Export types and business logic
- ❌ NO React imports
- ❌ NO Next.js imports
- ❌ NO Supabase imports

### Data Layer
```typescript
// data/expense.query.ts
export async function getExpenses(supabase: SupabaseClient) {
  const { data } = await supabase.from('expenses').select('*')
  return data
}
```

## Testing

### Test Phone Numbers (Local OTP)
- `+6512345678` → OTP: `123456`
- `+6587654321` → OTP: `123456`
- `+6588888888` → OTP: `123456`
- `+6599999999` → OTP: `123456`

Configured in `supabase/config.toml` lines 245-249.

### Test Auth Flow
1. Go to http://localhost:3000
2. Enter test phone number
3. Use OTP `123456`
4. Access protected routes

## URLs

### Local Development
- **App**: http://localhost:3000
- **Supabase Studio**: http://127.0.0.1:54323
- **API**: http://127.0.0.1:54321
- **Email Testing**: http://127.0.0.1:54324

## Documentation Structure
```
docs/
├── ARCHITECTURE-NOTES.md        # Architecture decisions
├── CURRENT-STATUS.md            # Project status
├── README.md                    # Docs index
├── steps/                       # Implementation guides
│   ├── STEP1-COMPLETE.md
│   └── ...
└── testing/                     # Testing guides
    ├── e2e/
    └── NAVIGATION-TESTS.md
```

## Database Schema

### Main Tables
- `expenses` - User expenses with categories
- `user_preferences` - User settings and preferences

### Key Columns (expenses)
- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users)
- `amount` (numeric)
- `category` (text)
- `subcategory` (text, nullable)
- `description` (text, nullable)
- `owed_to` (text, nullable)
- `expense_date` (date)
- `created_at` (timestamp)

## Tech Stack
- **Framework**: Next.js 15.5+
- **Language**: TypeScript 5+ (strict mode)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Phone OTP)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: SWR for data fetching
- **Validation**: Zod
- **Testing**: Vitest (unit), Playwright (E2E)

## Code Style

### Naming
- Components: `PascalCase`
- Files: `kebab-case` (utilities), `PascalCase.tsx` (components)
- Server Actions: `createExpense`, `deleteExpense` (verb + noun)
- Hooks: `useExpenses`, `useCategories` (use + noun)

### Imports
Use absolute imports with `@/` prefix:
```typescript
import { createServerClient } from '@/server/supabase/client.server'
import { Button } from '@/components/ui/button'
```

### TypeScript
- Strict mode enabled
- Explicit types for parameters and returns
- Use `type` for objects, `interface` for extensible contracts
- Zod for runtime validation

## Common Issues

### Can't connect to Supabase
1. Check Docker is running
2. Run: `supabase status`
3. Verify `.env.local` has correct URL and keys

### Migrations not applied
```bash
supabase db reset
```

### Wrong Supabase client used
- Server Component → `client.server.ts`
- Client Component → `client.browser.ts`
- Middleware → `client.middleware.ts`

## When Adding Features

1. ✅ Create feature directory in `src/features/`
2. ✅ Follow vertical slice structure
3. ✅ Keep domain layer pure
4. ✅ Add types to `domain/types.ts`
5. ✅ Create Server Actions in `actions/`
6. ✅ Add UI components in `ui/`
7. ✅ Export from `index.ts`
8. ✅ Add tests
9. ✅ Update migrations if schema changes

## Security Notes
- Service role key is server-only (never expose to client)
- Local dev keys are safe to commit (default Supabase keys)
- Production keys must be in environment variables only
- Rate limiting configured for OTP in `src/server/ratelimit/`

## Performance
- SWR for client-side caching
- Server Components for initial data loading
- Parallel data fetching where possible
- Images optimized via Next.js Image component

---

**For complete setup instructions, see [SETUP.md](./SETUP.md)**

**For architecture details, see [ARCHITECTURE-NOTES.md](./ARCHITECTURE-NOTES.md)**
