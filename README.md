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

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Supabase CLI (for local development)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy environment variables:

```bash
cp .env.local.example .env.local
```

4. Start Supabase locally:

```bash
supabase start
```

5. Update `.env.local` with your Supabase credentials from the output above

6. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

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

## Phase 1 Features (MVP)

- ✅ Phone OTP Authentication
- ✅ Dashboard
- ✅ Create custom expense
- ✅ List expenses
- ✅ Rate limiting for OTP
- ✅ Unit and E2E tests
- ✅ Database migrations

## Phase 2 (Future)

- Recurring expenses (subscriptions)
- Shortcut expenses (frequent purchases)
- Event-driven expenses (one-time events)
- Modal routes (parallel/intercepting)
- Caching optimizations
- Monitoring (Sentry)

## License

Private project

