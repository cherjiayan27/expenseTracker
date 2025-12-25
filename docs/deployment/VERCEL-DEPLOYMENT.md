# Vercel Deployment Guide

Complete step-by-step guide for deploying the Expense Tracker to Vercel.

## Overview

This guide walks you through deploying your Next.js application to Vercel from your GitHub repository.

**What you need:**
- GitHub repository: https://github.com/cherjiayan27/expenseTracker.git
- Vercel account (free tier)
- Supabase credentials ready (see [ENV-PRODUCTION.md](./ENV-PRODUCTION.md))

**What you'll get:**
- Production URL: `expense-tracker-xxx.vercel.app`
- Automatic deployments on git push
- SSL certificate (HTTPS)
- Global CDN distribution

---

## Step 1: Access Vercel Dashboard

### Create/Sign In to Vercel Account

1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Sign Up"** (if new) or **"Log In"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

> **Tip:** Using GitHub authentication makes repository imports seamless.

### Navigate to New Project

1. Once logged in, you'll see the Vercel Dashboard
2. Click **"Add New..."** button (top right)
3. Select **"Project"** from the dropdown

---

## Step 2: Import GitHub Repository

### Connect GitHub

If this is your first time:
1. Click **"Import Git Repository"**
2. Select **"GitHub"**
3. Authorize Vercel to access your repositories

### Find Your Repository

1. In the repository list, search for: **"expenseTracker"**
2. Or scroll to find: **cherjiayan27/expenseTracker**
3. Click **"Import"** button next to it

> **If repository not visible:** Click "Adjust GitHub App Permissions" and grant access to the repo.

---

## Step 3: Configure Project

Vercel auto-detects Next.js projects. Verify the following settings:

### Framework Preset

```
Framework Preset: Next.js
```

✅ Should be automatically detected

### Root Directory

```
Root Directory: ./
```

✅ Leave as default (unless project is in subdirectory)

### Build and Output Settings

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
.next
```

**Install Command:**
```bash
npm install
```

**Development Command:**
```bash
npm run dev
```

✅ All should be auto-detected. **Do not change unless you know what you're doing.**

### Node.js Version

```
Node.js Version: 20.x
```

✅ Recommended version for Next.js 15

> **Note:** Vercel automatically uses the latest stable Node.js 20.x release.

---

## Step 4: Environment Variables

This is the most critical step. Add your Supabase credentials.

### Access Environment Variables Section

1. Scroll down to **"Environment Variables"** section
2. You'll see fields for Key, Value, and Environment selection

### Add Variable 1: NEXT_PUBLIC_SUPABASE_URL

1. Click **"Add"** or the first empty key field
2. **Key:** `NEXT_PUBLIC_SUPABASE_URL`
3. **Value:** `https://zuosvgwkggpcmeofxokm.supabase.co`
4. **Environments:** Check all three:
   - ☑ Production
   - ☑ Preview
   - ☑ Development
5. Click the **checkmark ✓** or press Enter to save

**Visual representation:**
```
┌─────────────────────────────────────────┬─────────────────────────────────────┐
│ Key                                      │ Value                              │
├─────────────────────────────────────────┼─────────────────────────────────────┤
│ NEXT_PUBLIC_SUPABASE_URL                 │ https://zuosvgwkggpcmeofxokm...    │
└─────────────────────────────────────────┴─────────────────────────────────────┘
Environments: ☑ Production  ☑ Preview  ☑ Development
```

### Add Variable 2: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

1. Click **"Add"** again for a new variable
2. **Key:** `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. **Value:** Paste your publishable key from Supabase Dashboard
   - Go to: Supabase Dashboard → Settings → API
   - Copy the **"anon" "public"** key (starts with `eyJ...`)
4. **Environments:** Check all three:
   - ☑ Production
   - ☑ Preview
   - ☑ Development
5. Click the **checkmark ✓** or press Enter to save

**Visual representation:**
```
┌─────────────────────────────────────────┬─────────────────────────────────────┐
│ Key                                      │ Value                              │
├─────────────────────────────────────────┼─────────────────────────────────────┤
│ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY     │ eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp... │
└─────────────────────────────────────────┴─────────────────────────────────────┘
Environments: ☑ Production  ☑ Preview  ☑ Development
```

### Verify Environment Variables

Before proceeding, double-check:

- [ ] Two variables added
- [ ] Variable names exactly match (case-sensitive)
- [ ] No typos in keys
- [ ] Values copied correctly (no extra spaces)
- [ ] All three environments selected for both variables

> **Critical:** Incorrect variable names will cause deployment to fail or app to not connect to Supabase.

---

## Step 5: Deploy

### Initiate Deployment

1. Review all settings one final time
2. Click the big **"Deploy"** button
3. Vercel starts building your application

### Watch Build Progress

You'll see a build log with real-time output:

```
Cloning github.com/cherjiayan27/expenseTracker...
Installing dependencies...
Building...
  ▲ Next.js 15.5.9
  Creating an optimized production build...
  ✓ Compiled successfully in 2.9s
  Linting and checking validity of types...
  Collecting page data...
  Generating static pages (0/8)...
  ✓ Generating static pages (8/8)
  Finalizing page optimization...
  Collecting build traces...

Route (app)                Size     First Load JS
┌ ○ /                     161 B    106 kB
├ ƒ /dashboard            2.27 kB  114 kB
├ ○ /login                2.68 kB  114 kB
└ ○ /settings             134 B    102 kB

ƒ  Middleware             93 kB

Build completed successfully!
```

**Build typically takes 2-3 minutes.**

### Common Build Stages

1. **Cloning** (~10 seconds) - Downloads code from GitHub
2. **Installing** (~30 seconds) - Runs `npm install`
3. **Building** (~90 seconds) - Runs `npm run build`
4. **Uploading** (~30 seconds) - Deploys to Vercel CDN

---

## Step 6: Deployment Success

### Success Screen

Once build completes, you'll see:

🎉 **Congratulations!** (with confetti animation)

Your deployment is ready:
```
expense-tracker-abc123.vercel.app
```

### Actions Available

**Visit Button:**
- Click **"Visit"** to open your production site
- Opens: `https://expense-tracker-abc123.vercel.app`

**Continue to Dashboard:**
- Click **"Continue to Dashboard"** to manage your project

### Copy Production URL

**Important:** Copy your production URL for next steps:

1. Highlight the URL: `expense-tracker-abc123.vercel.app`
2. Copy to clipboard (Ctrl+C / Cmd+C)
3. Save it temporarily - you'll need it for Supabase configuration

> **Your URL will be different.** The format is always: `expense-tracker-[random].vercel.app`

---

## Step 7: Update Supabase Configuration

Configure Supabase to accept authentication redirects from your Vercel URL.

### Navigate to Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: **zuosvgwkggpcmeofxokm**
3. Navigate to **Authentication** (left sidebar)
4. Click **URL Configuration**

### Update Site URL

1. Find **"Site URL"** field
2. Replace with your Vercel URL:
   ```
   https://expense-tracker-abc123.vercel.app
   ```
   (Use your actual URL, not this example)
3. Ensure it starts with `https://`
4. No trailing slash

### Add Redirect URL

1. Scroll down to **"Redirect URLs"** section
2. Click **"Add URL"**
3. Enter:
   ```
   https://expense-tracker-abc123.vercel.app/**
   ```
   (Use your actual URL + `/**` wildcard)
4. Click **"Add"** or press Enter

**The `/**` wildcard allows:**
- `https://your-app.vercel.app/`
- `https://your-app.vercel.app/login`
- `https://your-app.vercel.app/dashboard`
- Any route in your app

### Save Configuration

1. Scroll to bottom
2. Click **"Save"** button
3. Wait for "Configuration updated" success message

> **Why this is needed:** Supabase validates redirect URLs for security. Without this, login will fail with "redirect_uri not allowed" error.

---

## Step 8: Verify Deployment

### Test Production Site

1. Open your production URL: `https://expense-tracker-abc123.vercel.app`
2. Verify landing page loads
3. Check for any console errors (F12 → Console)

### Quick Smoke Test

1. Click **"Get Started"** or navigate to `/login`
2. Login page should load without errors
3. See phone number input and OTP form

> **Full testing:** See [TESTING-CHECKLIST.md](./TESTING-CHECKLIST.md) for comprehensive testing.

---

## Post-Deployment Configuration

### Configure Deployment Settings (Optional)

#### Enable Production Protection

1. Go to Vercel Dashboard → Your Project
2. Navigate to **Settings → General**
3. Scroll to **Deployment Protection**
4. Options:
   - **None** - Anyone can access (default for personal)
   - **Vercel Authentication** - Requires Vercel login
   - **Password** - Requires password to access

For personal projects, "None" is fine.

#### Set Up Notifications

1. Go to **Settings → Notifications**
2. Configure:
   - **Email on deployment failure** ✅ Recommended
   - **Email on deployment success** (optional)
   - **Slack integration** (if you use Slack)

#### Configure Domains (Optional)

To use a custom domain instead of `.vercel.app`:

1. Go to **Settings → Domains**
2. Click **"Add"**
3. Enter your domain: `example.com`
4. Follow DNS configuration instructions
5. Update Supabase redirect URLs with new domain

> **Note:** Custom domains require domain ownership and DNS access.

---

## Managing Deployments

### View Deployment History

1. Go to Vercel Dashboard → Your Project
2. Click **"Deployments"** tab
3. See all deployments with:
   - Commit message
   - Branch name
   - Status (Success/Failed/Building)
   - Timestamp
   - Production/Preview label

### Automatic Deployments

Vercel automatically deploys when you:

**Production Deployments:**
- Push to `main` or `master` branch
- Merge a pull request to `main`

**Preview Deployments:**
- Push to any other branch
- Open a pull request
- Each PR gets a unique preview URL

### Manual Redeploy

To redeploy without code changes:

1. Go to **Deployments** tab
2. Find the deployment you want to redeploy
3. Click **"︙"** (three dots menu)
4. Select **"Redeploy"**
5. Confirm

**Use cases:**
- Environment variable changes
- Rollback to previous version
- Force rebuild after Vercel issue

### Rollback to Previous Version

If new deployment breaks something:

1. Go to **Deployments** tab
2. Find the last working deployment
3. Click **"︙"** → **"Promote to Production"**
4. Confirm promotion

This instantly switches production to the older version.

---

## Environment Variables Management

### View Current Variables

1. Go to **Settings → Environment Variables**
2. See all configured variables
3. Click **"Reveal"** to see values (requires confirmation)

### Add New Variable

1. Click **"Add New"**
2. Enter key and value
3. Select environments
4. Click **"Save"**
5. **Redeploy** for changes to take effect

### Update Existing Variable

1. Find variable in list
2. Click **"Edit"** (pencil icon)
3. Change value
4. Click **"Save"**
5. **Redeploy** for changes to take effect

### Delete Variable

1. Find variable in list
2. Click **"Remove"** (trash icon)
3. Confirm deletion
4. **Redeploy** for changes to take effect

> **Important:** Always redeploy after environment variable changes. They don't apply to existing deployments.

---

## Monitoring & Logs

### View Build Logs

1. Go to **Deployments** tab
2. Click on any deployment
3. View complete build output
4. Download logs if needed

### View Runtime Logs

1. Click on a deployment
2. Navigate to **Logs** tab (or **Functions** tab)
3. See real-time server logs:
   - API route calls
   - Middleware execution
   - Server Component renders
   - Errors and warnings

**Filter logs:**
- By time range
- By status code
- By path
- Search text

### Check Build Errors

If deployment fails:

1. Click on failed deployment
2. Look for red error messages
3. Common issues:
   - TypeScript errors
   - Missing environment variables
   - Build timeouts
   - Dependency issues

**Fix and redeploy:**
1. Fix issue locally
2. Commit and push to GitHub
3. Vercel auto-deploys again

---

## Troubleshooting

### Deployment Fails

**Error: "Build failed"**

**Check:**
1. View build logs for specific error
2. Test locally: `npm run build`
3. Fix TypeScript errors: `npm run typecheck`
4. Verify all dependencies in `package.json`

### App Can't Connect to Supabase

**Error in browser console:** "Failed to fetch" or connection errors

**Check:**
1. Vercel → Settings → Environment Variables
2. Verify both Supabase variables exist
3. Verify no typos in variable names
4. Verify values are correct (copy from Supabase Dashboard)
5. Redeploy after fixing variables

### Login Redirects Fail

**Error:** "redirect_uri not allowed"

**Fix:**
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Verify Site URL matches your Vercel URL exactly
3. Verify Redirect URL includes `/**` wildcard
4. Ensure `https://` (not `http://`)
5. Save and try again

### Build Timeout

**Error:** "Build exceeded maximum duration"

**Causes:**
- Very large dependencies
- Slow network
- Complex build process

**Solutions:**
1. Upgrade to Vercel Pro (longer timeout)
2. Optimize dependencies
3. Check for accidental infinite loops in build

### Preview Deployments Not Working

**Symptom:** Pull requests don't get preview URLs

**Check:**
1. Vercel → Settings → Git
2. Ensure "Automatically expose System Environment Variables" is enabled
3. Ensure GitHub integration is connected
4. Check GitHub app permissions

---

## Next Steps

After successful Vercel deployment:

1. **Test Production** - See [TESTING-CHECKLIST.md](./TESTING-CHECKLIST.md)
2. **Set Up Monitoring** - Configure Vercel Analytics
3. **Update README** - Add production URL
4. **Share with Users** - Your app is live!

---

## Related Documentation

- [Complete Deployment Guide](./DEPLOYMENT.md)
- [Environment Variables Reference](./ENV-PRODUCTION.md)
- [Migration Deployment](./MIGRATION-DEPLOYMENT.md)
- [Testing Checklist](./TESTING-CHECKLIST.md)

---

## Vercel Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Next.js on Vercel:** https://vercel.com/docs/frameworks/nextjs
- **Environment Variables:** https://vercel.com/docs/environment-variables
- **Custom Domains:** https://vercel.com/docs/custom-domains

---

**Deployment Status:** Ready to Deploy ✅

**Last Updated:** December 25, 2025

