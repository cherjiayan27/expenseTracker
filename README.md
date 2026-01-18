# Expense Tracker

A production-ready expense tracking application built with Next.js App Router, TypeScript, and Supabase.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Phone OTP (SMS)
- **Validation**: Zod
- **Testing**: Vitest (unit), Playwright (E2E)

## Architecture

This project uses **Vertical Slice Architecture** where each feature has:
- `domain/` - Pure business logic (no React/Next imports)
- `data/` - Database queries and mappers
- `actions/` - Server Actions and client hooks
- `ui/` - React components

## Getting Started

**📖 For complete setup instructions, see [SETUP.md](./docs/SETUP.md)**

### Quick Start

1. **Clone and install**:
```bash
git clone <repository-url>
cd expenseTracker-2
npm install
```

2. **Start Supabase** (requires Docker Desktop running):
```bash
supabase start
```

3. **Create `.env.local`** with local credentials:
```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
EOF
```

4. **Start dev server**:
```bash
npm run dev
```

5. **Open** http://localhost:3000

### Important URLs

- **App**: http://localhost:3000
- **Supabase Studio**: http://127.0.0.1:54323
- **Email Testing**: http://127.0.0.1:54324

## Database Setup

### Migrations

Create a new migration:

```bash
supabase migration new <migration_name>
```

Apply migrations:

```bash
supabase db reset
```

### Seed Data

Seed data is automatically applied on `supabase db reset` from `supabase/seed.sql`.

## Testing

### Unit Tests

```bash
npm test
npm run test:coverage
```

### E2E Tests

```bash
npm run test:e2e
```

## Project Structure

```
src/
  app/                  # Next.js App Router
    (public)/          # Public routes (landing, login)
    (app)/             # Protected routes (dashboard, settings)
  features/            # Vertical slices
    auth/
    expenses/
    recurring-expenses/
    shortcuts/
    events/
  server/              # Server-only utilities
    supabase/          # Supabase clients
    ratelimit/         # Rate limiting
  shared/              # Shared utilities
    ui/                # Shared components
    lib/               # Shared functions
    types/             # Shared types
tests/
  unit/                # Vitest unit tests
  e2e/                 # Playwright E2E tests
supabase/
  migrations/          # SQL migrations
  seed.sql            # Seed data
```

## Documentation

The `docs/` folder contains reference materials for AI assistants working on this project:

| Folder/File | Purpose |
|-------------|---------|
| `docs/scaffold-guide/` | Blueprint for creating new projects from scratch with the same infrastructure |
| `docs/best-practices/` | Coding patterns and principles AI should follow when writing code |
| `docs/performance-improvement/` | Context on past optimizations - read before making performance changes |
| `docs/SETUP.md` | How to run this project after cloning |
| `docs/AI-QUICK-REF.md` | Quick reference for this specific codebase |

**How AI should use these:**

1. **Making changes** → Check `best-practices/` for correct patterns
2. **Optimizing performance** → Read `performance-improvement/` first, then cross-reference `best-practices/`
3. **Creating new project** → Follow `scaffold-guide/` step-by-step
4. **Understanding codebase** → Start with `AI-QUICK-REF.md`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript compiler check
- `npm test` - Run unit tests
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run E2E tests
## Deployment

This application is deployed to production on Vercel with Supabase and Twilio.

**Production URL:** [Will be added after deployment]

**Prerequisites:**
- GitHub account
- Supabase production project
- Twilio account with phone number and SMS configured
- Vercel account

**Quick Deploy:**

See [DEPLOYMENT.md](./docs/deployment/DEPLOYMENT.md) for complete deployment instructions.

**Key Steps:**
1. Push database migrations: `npx supabase db push`
2. Deploy to Vercel from GitHub
3. Configure environment variables in Vercel
4. Update Supabase redirect URLs
5. Test production deployment

**Environment Variables:**

See [ENV-PRODUCTION.md](./docs/deployment/ENV-PRODUCTION.md) for production environment configuration.

**Documentation:**
- [Complete Deployment Guide](./docs/deployment/DEPLOYMENT.md)
- [Environment Variables Reference](./docs/deployment/ENV-PRODUCTION.md)
- [Migration Deployment Guide](./docs/deployment/MIGRATION-DEPLOYMENT.md)
- [Vercel Setup Guide](./docs/deployment/VERCEL-DEPLOYMENT.md)
- [Testing Checklist](./docs/deployment/TESTING-CHECKLIST.md)

## License

Private project


