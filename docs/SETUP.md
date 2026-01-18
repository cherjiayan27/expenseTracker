# Expense Tracker - Local Development Setup Guide

This guide will help you set up the expense tracker application on your local machine from a fresh clone.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Supabase CLI** - [Installation Guide](https://supabase.com/docs/guides/cli/getting-started)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/) (required for Supabase local)

### Installing Supabase CLI

```bash
# macOS (Homebrew)
brew install supabase/tap/supabase

# Windows (Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
brew install supabase/tap/supabase
```

Verify installation:
```bash
supabase --version
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd expenseTracker-2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Supabase Local Development Environment

Make sure Docker Desktop is running, then start Supabase:

```bash
supabase start
```

This command will:
- Download and start all Supabase Docker containers
- Set up PostgreSQL database (port 54322)
- Start the API server (port 54321)
- Start Supabase Studio (port 54323)
- Start email testing server (port 54324)
- Apply all migrations from `supabase/migrations/`
- Run seed data from `supabase/seed.sql`

**Note**: First time setup can take 5-10 minutes as it downloads Docker images.

### 4. Create Environment Variables

After `supabase start` completes, get your local credentials:

```bash
supabase status -o env
```

Create a `.env.local` file in the project root with the following content:

```bash
# Supabase Local Development Configuration
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY from supabase status>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<ANON_KEY from supabase status>
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY from supabase status>
SUPABASE_SECRET_KEY=<SERVICE_ROLE_KEY from supabase status>
```

**Quick Setup Script** (Copy the output directly):

```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
EOF
```

**Note**: These are the default local development keys. They're safe to commit for local development only.

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at:
- **App**: http://localhost:3000
- **Supabase Studio**: http://127.0.0.1:54323
- **Email Testing (Mailpit)**: http://127.0.0.1:54324

## Database Management

### View Database Schema

Open Supabase Studio at http://127.0.0.1:54323 to:
- View tables and data
- Run SQL queries
- Manage authentication
- Test API endpoints

### Current Migrations

The project includes these migrations (auto-applied on `supabase start`):

1. **20250101000000_create_expenses.sql** - Creates expenses table
2. **20250102000000_add_subcategory_to_expenses.sql** - Adds subcategory support
3. **20250102000001_make_description_optional.sql** - Makes description nullable
4. **20250102000002_add_owed_to_column.sql** - Adds owed_to field
5. **20250127000000_add_user_preferences.sql** - Creates user preferences table

### Reset Database

To reset the database and reapply all migrations:

```bash
supabase db reset
```

This will:
- Drop all tables
- Rerun all migrations
- Execute seed data

### Create New Migration

```bash
supabase migration new <migration_name>
```

Then edit the generated file in `supabase/migrations/`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run end-to-end tests (Playwright) |

## Supabase CLI Commands

| Command | Description |
|---------|-------------|
| `supabase start` | Start all Supabase services |
| `supabase stop` | Stop all services |
| `supabase status` | Check service status and get credentials |
| `supabase status -o env` | Output credentials in .env format |
| `supabase db reset` | Reset database (drop + migrate + seed) |
| `supabase db diff` | Show schema differences |
| `supabase db push` | Push local schema to remote |
| `supabase db pull` | Pull remote schema to local |
| `supabase logs` | View logs from services |
| `supabase studio` | Open Studio in browser |

## Project Structure

```
expenseTracker-2/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── (app)/             # Authenticated app routes
│   │   └── (public)/          # Public routes (login, etc.)
│   ├── components/            # Shared UI components
│   │   ├── navigation/        # Navigation components
│   │   └── ui/                # shadcn/ui components
│   ├── features/              # Feature-based modules
│   │   ├── auth/             # Authentication
│   │   ├── budget/           # Budget management
│   │   ├── categories/       # Category management
│   │   ├── dashboard/        # Dashboard features
│   │   └── expenses/         # Expense tracking
│   ├── lib/                   # Shared utilities
│   ├── server/               # Server-side code
│   │   ├── ratelimit/        # Rate limiting
│   │   └── supabase/         # Supabase clients
│   └── shared/               # Shared types and config
│       ├── config/           # App configuration
│       └── types/            # TypeScript types
├── supabase/
│   ├── config.toml           # Supabase configuration
│   ├── migrations/           # Database migrations
│   └── seed.sql              # Seed data
├── public/                    # Static assets
├── tests/                     # Test files
│   ├── e2e/                  # End-to-end tests
│   └── unit/                 # Unit tests
└── docs/                      # Documentation

```

## Architecture Notes

### Supabase Client Variants

The app uses different Supabase clients for different contexts:

- **`client.browser.ts`** - Client Components (CSR)
- **`client.server.ts`** - Server Components, Server Actions
- **`client.middleware.ts`** - Middleware (Edge Runtime)

### Authentication

- Uses Supabase Auth with phone OTP
- Test phone numbers configured in `supabase/config.toml`:
  - `+6512345678` - OTP: `123456`
  - `+6587654321` - OTP: `123456`
  - `+6588888888` - OTP: `123456`
  - `+6599999999` - OTP: `123456`

### Environment Variables

The app uses a validated env schema (`src/shared/config/env.ts`) that:
- Validates env vars on startup
- Provides type-safe access
- Separates client/server variables

## Testing

### Unit Tests

```bash
npm test                    # Run tests in watch mode
npm run test:coverage      # Generate coverage report
```

### End-to-End Tests

```bash
npm run test:e2e           # Run Playwright tests
```

E2E tests include:
- Authentication flows
- Navigation
- Expense CRUD operations
- Category management

## Troubleshooting

### Supabase won't start

**Problem**: `supabase start` fails or hangs

**Solutions**:
1. Make sure Docker Desktop is running
2. Check Docker has enough resources (4GB+ RAM recommended)
3. Stop and restart: `supabase stop && supabase start`
4. Reset completely: `supabase stop --no-backup && supabase start`

### Port already in use

**Problem**: Port conflict (54321, 54322, 54323, etc.)

**Solutions**:
1. Stop existing Supabase instance: `supabase stop`
2. Check for other processes using ports: `lsof -i :54321`
3. Modify ports in `supabase/config.toml` if needed

### Permission denied on .env.local

**Problem**: Next.js can't read `.env.local`

**Solutions**:
```bash
chmod 644 .env.local
```

### Environment variables not loading

**Problem**: App can't connect to Supabase

**Solutions**:
1. Verify `.env.local` exists and has correct values
2. Restart dev server: Stop and run `npm run dev` again
3. Check env vars are loaded: `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`

### Database schema out of sync

**Problem**: Missing tables or columns

**Solutions**:
```bash
supabase db reset           # Reset and reapply migrations
```

### Docker connection issues

**Problem**: Can't connect to Docker daemon

**Solutions**:
1. Ensure Docker Desktop is running
2. Check Docker permissions
3. Restart Docker Desktop

## Production Deployment

For production deployment to Supabase Cloud:

1. Create a Supabase project at https://supabase.com
2. Link your local project: `supabase link --project-ref <project-ref>`
3. Push migrations: `supabase db push`
4. Update `.env.local` with production credentials
5. Deploy Next.js app to Vercel/your hosting provider

**Production Environment Variables**:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_SECRET_KEY=<your-service-role-key>
```

## Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Project Documentation**: See `docs/` folder
  - Architecture notes
  - Implementation details
  - Step-by-step guides

## Quick Start (TL;DR)

For experienced developers:

```bash
# 1. Install dependencies
npm install

# 2. Start Supabase (first time takes 5-10 min)
supabase start

# 3. Create .env.local with local credentials
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
EOF

# 4. Start dev server
npm run dev

# 5. Open http://localhost:3000
```

---

**Happy Coding! 🎉**

If you encounter any issues not covered here, check the `docs/` folder or create an issue in the repository.
