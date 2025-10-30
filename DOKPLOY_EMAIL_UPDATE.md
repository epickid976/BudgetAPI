# 🚀 Dokploy: Update Email Configuration

## Quick Fix (2 Minutes)

### Step 1: Update Environment Variable in Dokploy

1. Log into your Dokploy dashboard
2. Navigate to your **BudgetAPI** application
3. Go to **Environment Variables** section
4. Find or add this variable:
   ```
   EMAIL_FROM=onboarding@budgetapi.ejvapps.online
   ```
5. **Save** the changes

### Step 2: Redeploy

1. Click **Deploy** or **Rebuild** button
2. Wait for deployment to complete (usually 1-2 minutes)

### Step 3: Test

Test registration at: `https://budgetapi.ejvapps.online/api/auth/register`

Or use the test HTML page provided.

---

## Full Environment Variables for Dokploy

Here are ALL the email-related environment variables you should have set:

```bash
# Brevo Configuration (REQUIRED)
BREVO_API_KEY=xkeysib-your-actual-api-key-here
EMAIL_FROM=onboarding@budgetapi.ejvapps.online
EMAIL_FROM_NAME=Budget API

# Application URL (REQUIRED for email links)
APP_URL=https://your-frontend-url.com

# Optional Settings
REQUIRE_EMAIL_VERIFICATION=false
```

### Where to Find These Values:

- **BREVO_API_KEY**: 
  - Go to [Brevo Dashboard](https://app.brevo.com)
  - Settings → SMTP & API → API Keys
  - Copy your v3 API key

- **EMAIL_FROM**: 
  - Must be `onboarding@budgetapi.ejvapps.online`
  - This is the validated sender in your Brevo account

- **APP_URL**: 
  - Your frontend application URL
  - Example: `https://budget.ejvapps.online`
  - Used for verification and password reset links in emails

---

## Alternative: Deploy New Code

If you want the improved logging and better defaults:

### Option A: Git Push (if Dokploy watches your repo)
```bash
git add .
git commit -m "Fix: Update email sender to validated Brevo address"
git push origin master
```

Dokploy will auto-deploy if connected to Git.

### Option B: Manual Redeploy
1. In Dokploy, go to your BudgetAPI app
2. Click **Rebuild** or **Redeploy**
3. Wait for completion

---

## Verification Checklist

After updating and redeploying, verify:

- [ ] Application is running (check health endpoint)
- [ ] Environment variable is set correctly
- [ ] Test user registration → email should arrive
- [ ] Test forgot password → email should arrive
- [ ] Check logs for "✅ Verification email sent successfully via Brevo!"

---

## Quick Test Command

Test your live API:

```bash
curl -X POST https://budgetapi.ejvapps.online/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yourtest@email.com",
    "password": "TestPass123!",
    "name": "Test User"
  }'
```

Expected response (success):
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": {
    "id": "...",
    "email": "yourtest@email.com",
    "name": "Test User",
    "emailVerified": false,
    "createdAt": "..."
  }
}
```

Then check your email inbox for the verification email!

---

## Common Dokploy Issues

### Issue: Environment variables not updating
**Fix:** After changing env vars, you MUST redeploy/rebuild the application

### Issue: Old container still running
**Fix:** 
```bash
# SSH into your server
docker ps  # Find the container
docker stop <container-id>
docker rm <container-id>
# Then redeploy from Dokploy
```

### Issue: Can't see logs in Dokploy
**Fix:** 
```bash
# SSH into server and check docker logs directly
docker logs -f $(docker ps | grep budgetapi | awk '{print $1}')
```

---

## 🎉 That's It!

After following these steps:
1. ✅ Emails will be sent from validated sender
2. ✅ Brevo will accept the emails
3. ✅ Users will receive verification and reset emails
4. ✅ Better logging will help debug any future issues

**Time to complete:** ~2-5 minutes

Need help? Check the logs - they now show exactly what's happening!

