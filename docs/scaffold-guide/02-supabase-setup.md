# Step 2: Supabase Setup

This step sets up Supabase for local development including Docker, CLI, database, and authentication infrastructure.

---

## Instructions (What To Do)

### Prerequisites

- Docker Desktop installed and running ([Download](https://www.docker.com/products/docker-desktop/))
- Project from Step 1 completed

### 1. Install Supabase CLI

**macOS (Homebrew):**
```bash
brew install supabase/tap/supabase
```

**Windows (Scoop):**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Linux:**
```bash
brew install supabase/tap/supabase
```

Verify installation:
```bash
supabase --version
```

### 2. Initialize Supabase Project

```bash
supabase init
```

This creates the `supabase/` folder with `config.toml`.

### 3. Configure Test OTP (for Phone Auth)

Edit `supabase/config.toml` and add test phone numbers in the `[auth]` section:

```toml
[auth]
enabled = true
site_url = "http://localhost:3000"

[auth.sms]
enable_confirmations = true

[auth.sms.test_otp]
"+6512345678" = "123456"
"+6587654321" = "123456"
```

This allows testing phone OTP locally without real SMS.

### 4. Start Supabase

Ensure Docker Desktop is running, then:

```bash
supabase start
```

First run downloads Docker images (can take several minutes). When complete, you'll see:

```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
        Inbucket URL: http://127.0.0.1:54324
          anon key: eyJhbGci...
  service_role key: eyJhbGci...
```

### 5. Create Environment Variables

Get credentials:
```bash
supabase status
```

Create `.env.local`:

```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
EOF
```

Note: These are the default local development keys (safe to use locally).

### 6. Create Database Types File

Create `src/shared/types/database.types.ts`:

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Tables will be added as you create migrations
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
```

### 7. Create Supabase Clients

Create three client variants for different contexts:

**Browser Client** - `src/server/supabase/client.browser.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/shared/types/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Server Client** - `src/server/supabase/client.server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/shared/types/database.types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
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
            // Called from Server Component - ignore
          }
        },
      },
    }
  )
}
```

**Middleware Client** - `src/server/supabase/client.middleware.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/shared/types/database.types'

export async function createClient(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  return { supabase, response: supabaseResponse }
}
```

### 8. Create Middleware

Create `src/middleware.ts`:

```typescript
import { type NextRequest } from 'next/server'
import { createClient } from '@/server/supabase/client.middleware'

const publicRoutes = ['/', '/login']

export async function middleware(request: NextRequest) {
  const { supabase, response } = await createClient(request)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)

  // Redirect unauthenticated users to login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return Response.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 9. Create Initial Migration

Create your first migration:

```bash
supabase migration new initial_schema
```

Edit the generated file in `supabase/migrations/` with your schema.

Apply migrations:
```bash
supabase db reset
```

### Verification

1. **Supabase running:**
   ```bash
   supabase status
   ```

2. **Studio accessible:** Open http://127.0.0.1:54323

3. **Middleware working:**
   ```bash
   curl -I http://localhost:3000/dashboard
   # Should redirect to /login (307)
   ```

4. **Build succeeds:**
   ```bash
   npm run build
   ```

---

## Reference (What Was Done in This Project)

### Supabase Services Running

| Service | URL |
|---------|-----|
| API | http://127.0.0.1:54321 |
| Studio | http://127.0.0.1:54323 |
| Database | postgresql://postgres:postgres@127.0.0.1:54322/postgres |
| Email Testing | http://127.0.0.1:54324 |

### Test OTP Configuration

In `supabase/config.toml`:

```toml
[auth.sms.test_otp]
"+6512345678" = "123456"
"+6587654321" = "123456"
"+6588888888" = "123456"
"+6599999999" = "123456"
```

### Environment Variables Used

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...(local dev key)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...(same as anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...(local dev key)
SUPABASE_SECRET_KEY=eyJhbGci...(same as service role)
```

Note: This project uses duplicate key names for compatibility.

### Files Created

```
src/server/supabase/
├── client.browser.ts   # Client Components
├── client.server.ts    # Server Components, Server Actions
└── client.middleware.ts # Middleware (Edge Runtime)

src/shared/types/
└── database.types.ts   # Database type definitions

src/middleware.ts       # Route protection

supabase/
├── config.toml         # Supabase configuration
├── migrations/         # SQL migrations
└── seed.sql            # Seed data
```

### Common Supabase Commands

```bash
supabase start          # Start all services
supabase stop           # Stop all services
supabase status         # Check status and get credentials
supabase db reset       # Drop + migrate + seed
supabase db diff        # Show schema changes
supabase migration new  # Create new migration
supabase logs           # View logs
```

### Middleware Route Protection

- Public routes: `/`, `/login`
- All other routes require authentication
- Unauthenticated users redirected to `/login`

### Key Points

1. **Three Supabase Clients**: Use the correct client for each context
   - Browser: Client Components
   - Server: Server Components and Server Actions
   - Middleware: Edge Runtime

2. **Cookie Handling**: Each client handles cookies differently for session management

3. **Local Dev Keys**: The default local development keys are the same for all projects

4. **Docker Required**: Supabase local development runs in Docker containers
