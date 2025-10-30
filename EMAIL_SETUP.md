# Email Configuration Guide

You have **TWO options** for handling emails in your BudgetAPI:

---

## Option 1: Disable Email Verification (Quick Solution) ⚡

**For development or if you don't need email verification**

In Dokploy, set this environment variable:
```env
REQUIRE_EMAIL_VERIFICATION=false
```

✅ **Benefits:**
- No email service needed
- Users can register and login immediately
- Perfect for testing/development
- Completely free

⚠️ **Note:** Users won't need to verify their email, so anyone can register with any email address.

---

## Option 2: Use Free Email Service (Production Solution) 📧

### Recommended: Brevo (formerly Sendinblue)

**Why Brevo?**
- ✅ 300 emails/day FREE forever
- ✅ Easy setup (5 minutes)
- ✅ Good deliverability
- ✅ Simple API

**Setup Steps:**

1. **Sign up at https://www.brevo.com**
   - Create free account
   - Verify your email

2. **Get API Key:**
   - Go to Settings → API Keys
   - Create new API key
   - Copy it (starts with `xkeysib-...`)

3. **Add Domain (Optional but recommended):**
   - Go to Senders & IP → Domains
   - Add your domain `ejvapps.online`
   - Add the DNS records to your domain registrar
   - Wait for verification (~10 minutes)

4. **Configure in Dokploy:**
   ```env
   # Brevo Configuration
   BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   EMAIL_FROM=noreply@ejvapps.online
   APP_URL=https://your-frontend-url.com
   REQUIRE_EMAIL_VERIFICATION=true
   ```

5. **Update Code to Use Brevo:**
   Install Brevo SDK:
   ```bash
   npm install @getbrevo/brevo
   ```

   Update `api/src/services/email.ts` to use Brevo instead of Resend.

---

### Alternative: SendGrid (100 emails/day free)

1. Sign up at https://sendgrid.com
2. Get API key from Settings → API Keys
3. Verify sender email or domain
4. Configure:
   ```env
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   EMAIL_FROM=noreply@ejvapps.online
   APP_URL=https://your-frontend-url.com
   REQUIRE_EMAIL_VERIFICATION=true
   ```

---

### Alternative: Nodemailer + Gmail (Simple & Free)

**For small projects - uses your Gmail account**

1. **Enable 2FA on your Gmail account**
   - Go to Google Account → Security
   - Enable 2-Step Verification

2. **Generate App Password:**
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Copy the 16-character password

3. **Configure in Dokploy:**
   ```env
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
   EMAIL_FROM=your-email@gmail.com
   APP_URL=https://your-frontend-url.com
   REQUIRE_EMAIL_VERIFICATION=true
   ```

4. **Update Code:**
   Install Nodemailer:
   ```bash
   npm install nodemailer
   npm install -D @types/nodemailer
   ```

   Update email service to use Gmail SMTP.

---

## Quick Comparison

| Service | Free Tier | Setup Time | Best For |
|---------|-----------|------------|----------|
| **No Verification** | Unlimited | 1 min | Development/Testing |
| **Brevo** | 300/day | 5 min | Production (recommended) |
| **SendGrid** | 100/day | 5 min | Production |
| **Gmail SMTP** | ~500/day | 10 min | Small projects |
| **Amazon SES** | 62k/month | 15 min | High volume (requires AWS) |

---

## My Recommendation 💡

**For Now (Quick Start):**
```env
REQUIRE_EMAIL_VERIFICATION=false
```

**For Production (Later):**
1. Sign up for **Brevo** (free 300 emails/day)
2. Get API key
3. Set `REQUIRE_EMAIL_VERIFICATION=true`
4. Update email service to use Brevo

This way you can launch now and add proper email later! 🚀

---

## Need Help?

If you want to implement any of these solutions, I can:
1. Update the email service code to use Brevo/SendGrid/Gmail
2. Test the email sending
3. Help with DNS configuration for custom domain

Just let me know which option you prefer!

