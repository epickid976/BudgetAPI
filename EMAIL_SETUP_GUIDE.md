# 📧 Free Email Setup Guide (Resend)

## ✅ What's Implemented

Your Budget API now has **complete email functionality** for:
- ✉️ Email verification after registration
- 🔐 Password reset emails
- 🎉 Welcome emails after verification
- 🔄 Resend verification emails

The email service works in two modes:
- **Development**: Logs emails to console (no setup required)
- **Production**: Sends real emails via Resend (free tier: 3,000 emails/month)

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Sign Up for Resend (FREE)

1. Go to [resend.com](https://resend.com)
2. Click **"Sign Up"** (no credit card required!)
3. Verify your email

### Step 2: Get Your API Key

1. In Resend Dashboard, go to **API Keys**
2. Click **"Create API Key"**
3. Name it: `BudgetAPI-Production`
4. Copy the API key (starts with `re_`)

### Step 3: Add Domain (Optional but Recommended)

**For Development/Testing:**
- Use the default `onboarding@resend.dev` sender (included in free tier)
- Skip to Step 4

**For Production with Custom Domain:**
1. In Resend Dashboard, go to **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records to your domain provider
5. Wait for verification (usually < 5 minutes)
6. Use `no-reply@yourdomain.com` as sender

### Step 4: Configure Environment Variables

#### For Local Development (`.env`):

```bash
# Email Configuration (optional - will log to console if not set)
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=onboarding@resend.dev
APP_URL=http://localhost:3001

# Or skip Resend for local dev (emails will log to console):
# RESEND_API_KEY=
# EMAIL_FROM=onboarding@resend.dev
# APP_URL=http://localhost:3001
```

#### For Production (Render):

Add these environment variables in Render Dashboard:

```bash
RESEND_API_KEY=re_your_production_api_key_here
EMAIL_FROM=no-reply@yourdomain.com
APP_URL=https://your-app.onrender.com
```

---

## 📝 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RESEND_API_KEY` | No | - | Your Resend API key. If not set, emails log to console. |
| `EMAIL_FROM` | No | `onboarding@resend.dev` | The "from" email address for all emails. |
| `APP_URL` | No | `http://localhost:3001` | Your app's URL (for generating verification/reset links). |

---

## 🧪 Testing Your Setup

### Test 1: Register a New User

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Result:**
- If `RESEND_API_KEY` is set: Email sent to test@example.com
- If not set: Verification link logged to console

### Test 2: Request Password Reset

```bash
curl -X POST http://localhost:3001/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Expected Result:**
- If `RESEND_API_KEY` is set: Password reset email sent
- If not set: Reset link logged to console

---

## 💰 Resend Free Tier Limits

✅ **What's Included FREE:**
- 3,000 emails per month
- 100 emails per day
- Unlimited API keys
- Unlimited domains
- Email analytics
- Webhook support

📊 **Usage Estimates:**
- ~100 users/month = ~300 emails (registration + resets)
- 3,000 emails = ~1,000 new users/month

**This is MORE than enough for most apps!**

---

## 🎨 Email Templates

Your emails already include beautiful HTML templates:

### Verification Email
- Clean, modern design
- Clear call-to-action button
- Fallback link for email clients that block buttons
- Expiration notice (24 hours)

### Password Reset Email
- Red theme for security actions
- Reset button
- Fallback link
- Expiration notice (1 hour)

### Welcome Email
- Friendly greeting
- Quick start guide
- Bullet points for next steps

You can customize these in `/api/src/services/email.ts`

---

## 🔧 Advanced Configuration

### Custom Email Templates

Edit `/api/src/services/email.ts` to customize:
- Email subject lines
- HTML templates
- Styling and colors
- Add your logo
- Include social media links

### Add More Email Types

Example: Transaction notifications, budget alerts, etc.

```typescript
// In /api/src/services/email.ts
export async function sendBudgetAlertEmail(email: string, category: string, spent: number, budget: number) {
  if (!isEmailEnabled() || !resend) {
    console.log(`Budget alert for ${email}: ${category} - ${spent}/${budget}`);
    return { id: "dev-mode" };
  }
  
  const { data, error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject: `⚠️ Budget Alert: ${category}`,
    html: `
      <p>You've spent ${spent} cents of your ${budget} cent budget for ${category}!</p>
    `,
  });
  
  return data;
}
```

---

## 🐛 Troubleshooting

### Emails Not Sending

**1. Check API Key:**
```bash
# Should print your API key
echo $RESEND_API_KEY
```

**2. Check Logs:**
Look for error messages in your console/Render logs.

**3. Verify Domain:**
In Resend Dashboard, ensure your domain shows "Verified" status.

**4. Check Spam Folder:**
During testing, check your spam/junk folder.

### Using onboarding@resend.dev

**Important:** The default `onboarding@resend.dev` sender:
- ✅ Works for testing
- ✅ Works for development
- ⚠️ May go to spam in production
- ❌ Not recommended for production

**For production:** Add and verify your own domain.

### Domain Verification Fails

1. Double-check DNS records match exactly
2. Wait 5-10 minutes for DNS propagation
3. Try using a subdomain (e.g., `mail.yourdomain.com`)
4. Contact Resend support (they're very responsive!)

---

## 🔐 Security Best Practices

1. **Never commit API keys to Git**
   - API keys are in `.env` (already in `.gitignore`)

2. **Use different keys for dev/prod**
   - Create separate API keys in Resend for each environment

3. **Rotate keys regularly**
   - Resend allows creating/deleting keys easily

4. **Rate limiting**
   - Resend has built-in rate limiting (100 emails/day on free tier)

---

## 📊 Monitoring & Analytics

**In Resend Dashboard:**
- View email delivery status
- Track open rates
- Monitor bounces
- Set up webhooks for delivery events

**In Your App:**
- Check console logs for email events
- Monitor Render logs for errors

---

## 💡 Next Steps

- [ ] Sign up for Resend (free)
- [ ] Get your API key
- [ ] Add to `.env` for local testing
- [ ] Test registration flow
- [ ] Test password reset flow
- [ ] Add domain for production (optional)
- [ ] Configure Render environment variables
- [ ] Test in production

---

## 🆘 Need Help?

- **Resend Docs**: [resend.com/docs](https://resend.com/docs)
- **Resend Support**: support@resend.com
- **Alternative Services**:
  - SendGrid (100 emails/day free)
  - Brevo (300 emails/day free)
  - Amazon SES (62,000 emails/month in first year)

---

## ✨ What Works Now

Your email system is **production-ready**! Here's what happens:

1. **User registers** → Verification email sent
2. **User clicks link** → Email verified → Welcome email sent
3. **User forgets password** → Reset email sent
4. **User needs new link** → Resend verification email

All with beautiful, professional HTML emails! 🎉

