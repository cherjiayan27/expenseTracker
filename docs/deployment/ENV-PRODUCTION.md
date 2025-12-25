# Production Environment Variables

Complete reference for environment variables needed for production deployment on Vercel.

## Required Variables

Your production deployment requires **2 environment variables** that must be configured in the Vercel dashboard.

### 1. NEXT_PUBLIC_SUPABASE_URL

**Description:** The URL of your Supabase production project.

**Value:**
```
https://zuosvgwkggpcmeofxokm.supabase.co
```

**Where to find:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/zuosvgwkggpcmeofxokm)
2. Navigate to **Settings → API**
3. Look for **Project URL** section
4. Copy the URL

**Important:**
- This is a public value (safe to expose in browser)
- It starts with `https://` and ends with `.supabase.co`
- Do not confuse with localhost URLs from local development

---

### 2. NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

**Description:** The public/publishable key (also called "anon key") for Supabase client authentication.

**Value:**
```
eyJ... (long string starting with eyJ)
```

**Where to find:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/zuosvgwkggpcmeofxokm)
2. Navigate to **Settings → API**
3. Look for **Project API keys** section
4. Copy the **"anon" "public"** key (NOT the service_role key)

**Important:**
- This is a public value (safe to expose in browser)
- It's a JWT token starting with `eyJ`
- It's very long (~200+ characters)
- Do not use the `service_role` key (that's a secret)

---

## Optional Variables

### SUPABASE_SECRET_KEY

**Description:** The service role key for admin operations (server-side only).

**Status:** ❌ Not currently used by this application

**If needed in future:**
- Never expose in browser
- Only use in server-side code
- Set as server-only in Vercel (not available to client)

---

## Setting Variables in Vercel

### During Initial Deployment

When you first deploy to Vercel:

1. On the "Configure Project" screen, scroll to **Environment Variables**
2. Click **"Add"** for each variable
3. Enter the key name exactly as shown (case-sensitive)
4. Paste the value from Supabase Dashboard
5. Select environments: ☑ Production ☑ Preview ☑ Development
6. Click the checkmark to save

**Example:**

```
Key:    NEXT_PUBLIC_SUPABASE_URL
Value:  https://zuosvgwkggpcmeofxokm.supabase.co
Envs:   ☑ Production  ☑ Preview  ☑ Development
```

### After Deployment

To add or update variables after deploying:

1. Go to Vercel Dashboard → Your Project
2. Navigate to **Settings → Environment Variables**
3. Click **"Add New"** or edit existing variable
4. Make your changes
5. Click **"Save"**
6. **Important:** Redeploy for changes to take effect
   - Go to **Deployments** tab
   - Click **"Redeploy"** on the latest deployment

---

## Environment Selection Guide

### When to select each environment:

**Production (☑ Always check)**
- Used for your live production deployment
- Accessed via your main Vercel URL

**Preview (☑ Recommended)**
- Used for pull request previews
- Each PR gets its own preview URL
- Same values as production (usually)

**Development (☑ Recommended)**
- Used when running `vercel dev` locally
- Helpful for testing Vercel-specific features
- Can use same values as production

> **Tip:** For most cases, select all three environments to ensure consistency.

---

## Security Best Practices

### ✅ DO

- Store all environment variables in Vercel dashboard
- Use the publishable key (safe for browser)
- Keep a backup of your keys in a password manager
- Rotate keys if they're ever exposed
- Use different Supabase projects for staging/production

### ❌ DON'T

- Commit environment variables to Git
- Put them in `.env.local` that gets pushed
- Share keys publicly (screenshots, chat, etc.)
- Use the `service_role` key in client-side code
- Hardcode keys in your source code

---

## Variable Naming Conventions

### NEXT_PUBLIC_ Prefix

Variables starting with `NEXT_PUBLIC_` are:
- ✅ Available in the browser (client-side)
- ✅ Bundled in the JavaScript that users download
- ✅ Can be used in Client Components
- ✅ Can be used in Server Components

Example usage in code:
```typescript
// This works in browser and server
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
```

### No Prefix

Variables without `NEXT_PUBLIC_` are:
- ❌ Not available in browser
- ✅ Only available server-side (Server Components, API Routes)
- ✅ Never exposed to users
- ✅ Safer for secrets

Example:
```typescript
// This only works server-side
const secretKey = process.env.SUPABASE_SECRET_KEY;
```

---

## Testing Environment Variables

### Verify in Vercel Dashboard

1. Go to Vercel → Project → Settings → Environment Variables
2. Check that both variables are listed
3. Verify they're set for all desired environments
4. Click "Reveal" to confirm values are correct

### Test in Production

After deployment, test that variables are loaded:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Type:
   ```javascript
   console.log(window.location.origin, 'SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
   ```
4. Should show `true` (not the actual value for security)

### Check Build Logs

If variables aren't loading:

1. Go to Vercel → Deployments
2. Click on a deployment
3. View build logs
4. Look for errors like "Invalid environment variables"

---

## Production-Specific Configuration

### Remove Test OTP Configuration

> **Important:** For production, you must remove or disable test OTP configurations.

In `supabase/config.toml`, ensure test OTP is NOT active:

```toml
# ❌ Remove or comment out for production
# [auth.sms.test_otp]
# "+6512345678" = "123456"
```

This should only exist in your local development environment, not in Supabase production settings.

### Twilio SMS Configuration

Production SMS is configured in Supabase Dashboard (not environment variables):

1. Go to Supabase Dashboard → Authentication → Providers
2. Click **Phone**
3. Ensure Twilio credentials are set:
   - Twilio Account SID
   - Twilio Auth Token
   - Twilio Phone Number

This is already configured for your production instance.

---

## Quick Reference

Copy this checklist when setting up a new deployment:

### Deployment Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://zuosvgwkggpcmeofxokm.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = (from Supabase Dashboard)
- [ ] Both variables set for Production environment
- [ ] Both variables set for Preview environment (optional)
- [ ] Both variables set for Development environment (optional)
- [ ] Test OTP removed from production Supabase config
- [ ] Twilio credentials configured in Supabase Dashboard
- [ ] Deployment successful
- [ ] Can access production URL
- [ ] Login with real phone number works

---

## Troubleshooting

### "Invalid environment variables" Error

**Cause:** Variable names don't match expected schema

**Solution:**
- Ensure exact spelling: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Check for typos, extra spaces, or wrong case
- Verify in `src/shared/config/env.ts` for expected names

### "Cannot read environment variable" Error

**Cause:** Variables not set in Vercel

**Solution:**
1. Check Vercel → Settings → Environment Variables
2. Redeploy after adding variables
3. Clear browser cache and try again

### Build Succeeds but App Can't Connect

**Cause:** Wrong Supabase URL or key

**Solution:**
1. Verify URL matches your project: `zuosvgwkggpcmeofxokm`
2. Verify you copied the **publishable** key, not service_role
3. Check for trailing spaces or newlines in Vercel
4. Redeploy after fixing

---

## Related Documentation

- [Complete Deployment Guide](./DEPLOYMENT.md)
- [Migration Deployment](./MIGRATION-DEPLOYMENT.md)
- [Vercel Setup](./VERCEL-DEPLOYMENT.md)
- [Testing Checklist](./TESTING-CHECKLIST.md)

---

**Last Updated:** December 25, 2025

