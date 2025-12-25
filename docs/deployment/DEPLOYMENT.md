# Production Deployment Guide

Complete guide for deploying the Expense Tracker application to production on Vercel with Supabase and Twilio.

## Prerequisites Checklist

Before you begin, ensure you have:

- [x] GitHub repository created: https://github.com/cherjiayan27/expenseTracker.git
- [x] Supabase production project created (ID: `zuosvgwkggpcmeofxokm`)
- [x] Twilio configured for SMS
- [x] Vercel account created
- [x] Local project linked to Supabase (`npx supabase link` completed)
- [ ] Migrations pushed to production
- [ ] Vercel deployment completed

---

## Phase 1: Push Database Migrations

Push your local database migrations to the production Supabase instance.

### Step 1: Verify Local Migrations

Check that your migrations exist:

```bash
ls -la supabase/migrations/
```

You should see:
- `20250101000000_create_expenses.sql` - Creates expenses table with RLS

### Step 2: Verify Project Link

Confirm you're linked to the correct production project:

```bash
npx supabase projects list
```

Look for the asterisk (*) next to `zuosvgwkggpcmeofxokm`:
```
* zuosvgwkggpcmeofxokm  expense-tracker-prod
```

### Step 3: Preview Migration Changes

See what will be applied:

```bash
npx supabase db diff
```

This shows the SQL that will be executed on production.

### Step 4: Push Migrations

Apply migrations to production:

```bash
npx supabase db push
```

Expected output:
```
Applying migration 20250101000000_create_expenses.sql...
Finished supabase db push.
```

### Step 5: Verify in Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/zuosvgwkggpcmeofxokm)
2. Navigate to **Table Editor**
3. Verify `expenses` table exists with columns:
   - `id` (uuid, primary key)
   - `user_id` (uuid, foreign key)
   - `amount` (numeric)
   - `description` (text)
   - `category` (text, nullable)
   - `date` (date)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

4. Navigate to **Authentication → Policies**
5. Click on `expenses` table
6. Verify 4 RLS policies exist:
   - `Users can view own expenses` (SELECT)
   - `Users can insert own expenses` (INSERT)
   - `Users can update own expenses` (UPDATE)
   - `Users can delete own expenses` (DELETE)

7. Check that RLS is enabled (shield icon visible on table)

**✅ Phase 1 Complete:** Database schema deployed to production.

See [MIGRATION-DEPLOYMENT.md](./MIGRATION-DEPLOYMENT.md) for detailed migration guide.

---

## Phase 2: Prepare Environment Variables

Gather the production environment variables you'll need for Vercel.

### Step 1: Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/zuosvgwkggpcmeofxokm)
2. Navigate to **Settings → API**
3. Copy the following values:

**Project URL:**
```
https://zuosvgwkggpcmeofxokm.supabase.co
```

**Publishable Key (anon key):**
```
eyJ... (long string starting with eyJ)
```

> **Important:** Copy the **publishable key**, NOT the secret key. The publishable key is safe to use in the browser.

### Step 2: Required Environment Variables

You'll need these two variables for Vercel:

| Variable Name | Value | Where to Find |
|--------------|-------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://zuosvgwkggpcmeofxokm.supabase.co` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `eyJ...` | Supabase → Settings → API → Publishable key |

> **Note:** `SUPABASE_SECRET_KEY` is optional and not currently used by the application.

**✅ Phase 2 Complete:** Environment variables ready for Vercel.

See [ENV-PRODUCTION.md](./ENV-PRODUCTION.md) for complete environment variable reference.

---

## Phase 3: Deploy to Vercel

Deploy the application to Vercel from GitHub.

### Step 1: Access Vercel Dashboard

1. Go to [https://vercel.com](https://vercel.com)
2. Sign in with your account
3. Click **"Add New..."** → **"Project"**

### Step 2: Import GitHub Repository

1. Select **"Import Git Repository"**
2. Choose your GitHub account
3. Find and select **"expenseTracker"** repository
4. Click **"Import"**

### Step 3: Configure Project Settings

Vercel should auto-detect Next.js. Verify these settings:

**Framework Preset:** Next.js  
**Root Directory:** `./` (default)  
**Build Command:** `npm run build` (default)  
**Output Directory:** `.next` (default)  
**Install Command:** `npm install` (default)  
**Node.js Version:** 20.x (recommended)

> **Note:** Do not change these unless you know what you're doing.

### Step 4: Add Environment Variables

Scroll down to the **Environment Variables** section.

**Add Variable 1:**
1. Click **"Add"** or expand the environment variables section
2. Key: `NEXT_PUBLIC_SUPABASE_URL`
3. Value: `https://zuosvgwkggpcmeofxokm.supabase.co`
4. Check all environments: ☑ Production ☑ Preview ☑ Development
5. Click checkmark or save

**Add Variable 2:**
1. Click **"Add"** again
2. Key: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. Value: Paste your publishable key from Phase 2
4. Check all environments: ☑ Production ☑ Preview ☑ Development
5. Click checkmark or save

> **Important:** Double-check that both variables are set for all three environments.

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for the build to complete
3. Watch the build logs for any errors

Expected build output:
```
Building...
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

### Step 6: Get Production URL

Once deployment succeeds:
1. Vercel shows a success screen with confetti 🎉
2. Copy your production URL (e.g., `expense-tracker-xxx.vercel.app`)
3. Click **"Visit"** to open your deployed app

### Step 7: Update Supabase Redirect URLs

Configure Supabase to accept redirects from your Vercel URL:

1. Go back to [Supabase Dashboard](https://supabase.com/dashboard/project/zuosvgwkggpcmeofxokm)
2. Navigate to **Authentication → URL Configuration**
3. Update **Site URL** to: `https://expense-tracker-xxx.vercel.app`
4. Under **Redirect URLs**, add: `https://expense-tracker-xxx.vercel.app/**`
5. Click **"Save"**

> **Replace** `expense-tracker-xxx.vercel.app` with your actual Vercel URL.

**✅ Phase 3 Complete:** Application deployed to production.

See [VERCEL-DEPLOYMENT.md](./VERCEL-DEPLOYMENT.md) for detailed Vercel setup guide.

---

## Phase 4: Post-Deployment Verification

Test your production deployment to ensure everything works.

### Quick Verification

Visit your production URL and verify the landing page loads.

### Comprehensive Testing

Follow the complete testing checklist to verify all features:

- [ ] Authentication with real phone number
- [ ] SMS OTP delivery via Twilio
- [ ] Login flow completes successfully
- [ ] Dashboard displays correctly
- [ ] Expense creation works
- [ ] Month-to-date calculation updates
- [ ] Logout works
- [ ] Protected routes redirect to login
- [ ] Rate limiting prevents abuse

See [TESTING-CHECKLIST.md](./TESTING-CHECKLIST.md) for the complete testing checklist.

**✅ Phase 4 Complete:** Production deployment verified and tested.

---

## Phase 5: Monitoring & Maintenance

Monitor your production deployment and maintain application health.

### Check Deployment Logs

**Vercel Logs:**
1. Go to Vercel Dashboard → Your Project
2. Click **"Logs"** tab
3. View real-time logs for errors and requests
4. Filter by time, status code, or search terms

**Useful for:**
- Debugging production errors
- Monitoring API response times
- Checking middleware execution

### Monitor Database Usage

**Supabase Dashboard:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/zuosvgwkggpcmeofxokm)
2. Navigate to **Reports**
3. Check:
   - Database size
   - API requests count
   - Active connections
   - Query performance

**Free tier limits:**
- 500 MB database storage
- 2 GB bandwidth per month
- 50,000 monthly active users

### Monitor SMS Usage

**Twilio Console:**
1. Go to [Twilio Console](https://console.twilio.com)
2. Navigate to **Monitor → Logs → Messaging**
3. Check:
   - SMS delivery status
   - Failed messages
   - Cost per message
   - Monthly spend

**Cost management:**
- Set up billing alerts
- Monitor unusual spikes
- Review delivery rates

### Application Errors

**Vercel:**
- Errors appear in real-time logs
- Set up error notifications in Project Settings → Notifications
- Configure Slack or email alerts

**Future enhancement:**
- Consider adding Sentry for error tracking
- Set up custom error boundaries

### Roll Back Deployment

If something goes wrong, you can quickly roll back:

1. Go to Vercel Dashboard → Your Project
2. Click **"Deployments"** tab
3. Find the last working deployment
4. Click **"︙"** (three dots) → **"Redeploy"**
5. Confirm redeployment

This instantly reverts to the previous version.

**✅ Phase 5 Complete:** Monitoring and maintenance procedures established.

---

## Troubleshooting

Common issues and their solutions.

### Build Fails on Vercel

**Symptom:** Deployment fails during build step

**Possible causes:**
1. Missing environment variables
2. TypeScript errors
3. Dependency issues

**Solutions:**
```bash
# Test build locally first
npm run build

# Check TypeScript
npm run typecheck

# Verify environment variables in Vercel dashboard
# Settings → Environment Variables
```

### SMS Not Sending

**Symptom:** OTP never arrives, login stuck

**Possible causes:**
1. Twilio credentials incorrect in Supabase
2. Phone number not verified in Twilio (trial account)
3. Supabase SMS provider not configured

**Solutions:**
1. Go to Supabase Dashboard → Authentication → Providers → Phone
2. Verify Twilio credentials are correct
3. Check Twilio Console for failed messages
4. Ensure phone number is verified (trial accounts)

### Database Connection Errors

**Symptom:** "Failed to connect to database" or RLS errors

**Possible causes:**
1. Supabase project paused (inactive for 7 days)
2. Migrations not applied
3. Environment variables incorrect

**Solutions:**
1. Check Supabase Dashboard for project status
2. Verify `NEXT_PUBLIC_SUPABASE_URL` matches project URL exactly
3. Verify `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is correct
4. Run `npx supabase db push` again

### Redirect Loops

**Symptom:** Page keeps redirecting between /login and /dashboard

**Possible causes:**
1. Cookie issues
2. Middleware configuration
3. Cached auth state

**Solutions:**
1. Clear browser cookies for your domain
2. Try in incognito/private browsing mode
3. Check Vercel logs for middleware errors
4. Verify Supabase redirect URLs include your Vercel domain

### RLS Permission Errors

**Symptom:** "Row level security policy violation" or "permission denied"

**Possible causes:**
1. RLS policies not applied
2. User not authenticated
3. Policy conditions incorrect

**Solutions:**
1. Check Supabase Dashboard → Table Editor → expenses table
2. Verify shield icon (RLS enabled) is visible
3. Click on table → Policies → verify 4 policies exist
4. Test manual query in SQL Editor:
   ```sql
   SELECT * FROM expenses WHERE user_id = auth.uid();
   ```

### Environment Variables Not Loading

**Symptom:** App can't connect to Supabase, undefined errors

**Possible causes:**
1. Variables not set in Vercel
2. Variables not set for all environments
3. Typo in variable names

**Solutions:**
1. Go to Vercel → Project → Settings → Environment Variables
2. Verify both variables exist
3. Verify they're checked for all environments
4. Redeploy after adding/updating variables

### Rate Limiting Not Working

**Symptom:** Can send unlimited OTP requests

**Possible causes:**
1. Rate limiter relies on in-memory storage (resets on deploy)
2. Multiple Vercel instances (serverless functions)

**Solutions:**
- This is expected behavior with in-memory rate limiting
- For production, consider:
  - Upstash Redis for persistent rate limiting
  - Vercel Edge Config
  - Supabase rate limiting on auth endpoints

---

## Next Steps

After successful deployment:

1. **Add Custom Domain (Optional)**
   - Vercel → Project → Settings → Domains
   - Add your custom domain
   - Update Supabase redirect URLs

2. **Set Up Monitoring**
   - Enable Vercel Analytics
   - Set up error notifications
   - Configure Slack/email alerts

3. **Enable Backups**
   - Supabase: Automatic daily backups (Pro plan)
   - Or: Manual pg_dump backups

4. **Update Documentation**
   - Add production URL to README.md
   - Document any custom configuration
   - Keep deployment notes updated

5. **Plan for Scaling**
   - Monitor Supabase usage
   - Watch Vercel function execution time
   - Consider upgrading plans if needed

---

## Support & Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Supabase Documentation:** https://supabase.com/docs
- **Next.js Documentation:** https://nextjs.org/docs
- **Project Issues:** https://github.com/cherjiayan27/expenseTracker/issues

---

**Deployment Status:** Ready for Production ✅

**Last Updated:** December 25, 2025

