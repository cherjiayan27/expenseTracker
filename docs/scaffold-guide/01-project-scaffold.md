# Step 1: Project Scaffold

This step creates the foundational project structure using Next.js 15, TypeScript, and Vertical Slice Architecture.

---

## Instructions (What To Do)

### Prerequisites

- Node.js v18 or higher installed
- npm (comes with Node.js)

### 1. Create Next.js Project

```bash
npx create-next-app@latest my-project --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd my-project
```

When prompted:
- Would you like to use TypeScript? **Yes**
- Would you like to use ESLint? **Yes**
- Would you like to use Tailwind CSS? **Yes**
- Would you like to use `src/` directory? **Yes**
- Would you like to use App Router? **Yes**
- Would you like to customize the default import alias? **Yes** → `@/*`

### 2. Update TypeScript Configuration

Replace `tsconfig.json` with strict settings:

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 3. Install Core Dependencies

```bash
# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Validation
npm install zod

# Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
npm install -D @playwright/test
npx playwright install
```

### 4. Initialize shadcn/ui

```bash
npx shadcn@latest init
```

When prompted:
- Which style? **Default**
- Which color? **Slate** (or your preference)
- Would you like to use CSS variables? **Yes**

Install common components:

```bash
npx shadcn@latest add button input form card label alert dialog sheet tabs
```

### 5. Create Folder Structure

Create the Vertical Slice Architecture folders:

```bash
# Feature slices
mkdir -p src/features/auth/{domain,data,actions,ui}
mkdir -p src/features/expenses/{domain,data,actions,ui}

# Server utilities
mkdir -p src/server/supabase
mkdir -p src/server/ratelimit

# Shared utilities
mkdir -p src/shared/{config,types,ui,lib}

# Route groups
mkdir -p "src/app/(public)/login"
mkdir -p "src/app/(app)/dashboard"
mkdir -p "src/app/(app)/settings"

# Test directories
mkdir -p tests/unit tests/e2e

# Supabase
mkdir -p supabase/migrations
```

### 6. Create Route Group Layouts

Create `src/app/(public)/layout.tsx`:

```tsx
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
```

Create `src/app/(app)/layout.tsx`:

```tsx
export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <nav>{/* Navigation will go here */}</nav>
      <main>{children}</main>
    </div>
  )
}
```

### 7. Create Environment Configuration

Create `src/shared/config/env.ts`:

```typescript
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
})

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
})

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})

export const serverEnv = serverEnvSchema.parse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
})
```

Create `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 8. Create Feature Index Files

For each feature, create an `index.ts` that exports the public API:

```typescript
// src/features/auth/index.ts
export * from './domain'
export * from './actions'
export * from './ui'
```

### 9. Configure Testing

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/unit/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Create `tests/unit/setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 10. Add npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test"
  }
}
```

### Verification

Run these commands to verify setup:

```bash
npm run typecheck   # Should pass with no errors
npm run build       # Should build successfully
npm run dev         # Should start on http://localhost:3000
```

---

## Reference (What Was Done in This Project)

### Project Structure Created

```
src/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── global-error.tsx
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx (Landing page)
│   │   └── login/
│   │       ├── page.tsx
│   │       └── error.tsx
│   └── (app)/
│       ├── layout.tsx (App shell with navigation)
│       ├── error.tsx
│       ├── dashboard/
│       │   ├── page.tsx
│       │   ├── loading.tsx
│       │   └── @modal/
│       │       ├── default.tsx
│       │       └── (.)add-expense/
│       │           └── page.tsx
│       └── settings/
│           └── page.tsx
├── features/
│   ├── auth/
│   ├── expenses/
│   ├── recurring-expenses/
│   ├── shortcuts/
│   └── events/
│       ├── domain/
│       ├── data/
│       ├── actions/
│       ├── ui/
│       └── index.ts
├── server/
│   ├── supabase/
│   │   ├── client.browser.ts
│   │   ├── client.server.ts
│   │   └── client.middleware.ts
│   └── ratelimit/
│       └── limiter.ts
├── shared/
│   ├── config/
│   │   └── env.ts
│   ├── types/
│   ├── ui/
│   └── lib/
├── components/
│   └── ui/ (shadcn components)
├── lib/
│   └── utils.ts (cn helper)
└── middleware.ts
```

### Dependencies Installed

**Core:**
- next@^15.1.3
- react@^19.0.0
- typescript@^5

**Supabase:**
- @supabase/supabase-js@^2.47.10
- @supabase/ssr@^0.5.2

**Validation:**
- zod@^3.24.1

**UI (shadcn/ui):**
- @radix-ui/react-* (various)
- class-variance-authority
- clsx
- tailwind-merge
- lucide-react

**Testing:**
- vitest
- @testing-library/react
- @testing-library/jest-dom
- @playwright/test
- jsdom

### shadcn/ui Components Installed

- button, input, form, card, label, alert, dialog, sheet, tabs

### TypeScript Strict Settings Used

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true
}
```

### Key Architecture Decisions

1. **Vertical Slice Architecture**: Each feature is self-contained with domain, data, actions, and ui layers
2. **Route Groups**: `(public)` for unauthenticated routes, `(app)` for authenticated routes
3. **Parallel Routes**: `@modal` slot for modal overlays on dashboard
4. **Type-safe Environment**: Zod validation for environment variables at build time
