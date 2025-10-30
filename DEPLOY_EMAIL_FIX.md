# 🚀 Deploy Email Fix to Production

## ✅ What Was Fixed

The issue was that **the sender email wasn't validated in Brevo**. The code was trying to send from `noreply@ejvapps.online` but Brevo only accepts emails from validated senders.

### Changes Made:
1. ✅ Updated default `EMAIL_FROM` to `onboarding@budgetapi.ejvapps.online` (your validated Brevo sender)
2. ✅ Added comprehensive logging to debug email issues
3. ✅ Improved error messages to show exact Brevo API errors
4. ✅ Created test script to verify email configuration

## 🔧 How to Deploy the Fix

### Option 1: Quick Fix (Just Update Environment Variable)
If you don't want to redeploy code, just update the environment variable on your server:

```bash
# In your server's environment or .env file:
EMAIL_FROM=onboarding@budgetapi.ejvapps.online

# Then restart the application
```

### Option 2: Full Deployment (Recommended)
Deploy the updated code which has better logging and the correct default:

```bash
# 1. Commit the changes
git add .
git commit -m "Fix: Update EMAIL_FROM to validated Brevo sender"
git push origin master

# 2. Deploy via Dokploy or your deployment method
# The new code will automatically use the correct email
```

## 📋 Deployment Checklist

### Before Deploying:
- [ ] Verify `onboarding@budgetapi.ejvapps.online` is validated in Brevo
- [ ] Confirm `BREVO_API_KEY` is set correctly on server
- [ ] Check Brevo account has email credits
- [ ] Ensure transactional email platform is activated in Brevo

### After Deploying:
- [ ] Check application logs for any errors
- [ ] Test registration with a real email
- [ ] Test forgot password flow
- [ ] Verify emails arrive in inbox (not spam)

## 🧪 Testing

### Test 1: Using Test Script (Local)
```bash
# Test with your local credentials
npx tsx scripts/test-brevo-email.ts your-email@example.com
```

Expected output:
```
✅ BREVO_API_KEY is configured
📧 Sender: Budget API <onboarding@budgetapi.ejvapps.online>
📨 Recipient: your-email@example.com
✅ SUCCESS! Email sent to Brevo
📬 Check your-email@example.com for the test email!
```

### Test 2: Using Browser Test Page (Production)
```bash
# Open the test page in browser
open test-email-deploy.html

# Or navigate to: http://localhost:8080/test-email-deploy.html
```

1. Enter a test email address
2. Click "Register & Test Email"
3. Check the email inbox
4. Check server logs for Brevo response

### Test 3: Direct API Test (Production)
```bash
curl -X POST https://budgetapi.ejvapps.online/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "name": "Test User"
  }'
```

## 📊 Monitoring Logs

After deploying, monitor logs to see Brevo responses:

```bash
# Docker logs
docker logs -f <container-name> | grep -E "(Brevo|email|📧)"

# You should see:
# 📧 Attempting to send verification email to: user@example.com
# 🔍 Brevo Request Body: {...}
# 🔍 Brevo Response Status: 201 Created
# 🔍 Brevo Success Response: {"messageId":"..."}
# ✅ Verification email sent successfully via Brevo!
```

### Good Log Example (Success):
```
📧 Attempting to send verification email to: user@example.com from: onboarding@budgetapi.ejvapps.online
🔍 Brevo Response Status: 201 Created
✅ Verification email sent successfully via Brevo! Message ID: <...>
```

### Bad Log Example (Sender Not Valid):
```
❌ Brevo API error: {"code":"invalid_parameter","message":"Sending has been rejected because the sender you used noreply@ejvapps.online is not valid. Validate your sender or authenticate your domain"}
```

## 🔑 Environment Variables on Server

Make sure these are set correctly on your production server:

```bash
# Required for Brevo
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxx
EMAIL_FROM=onboarding@budgetapi.ejvapps.online
EMAIL_FROM_NAME=Budget API

# Required for email links
APP_URL=https://your-frontend-domain.com

# Optional
REQUIRE_EMAIL_VERIFICATION=false  # Set to "true" to require verification before login
```

## 🐛 Troubleshooting

### Problem: Still getting "sender not valid" error
**Solution:**
1. Go to Brevo Dashboard → Senders & IP
2. Verify `onboarding@budgetapi.ejvapps.online` is in the list
3. Status should be "Verified" with a green checkmark
4. If not, click "Add a sender" and verify it

### Problem: Emails going to spam
**Solution:**
1. Set up domain authentication (DKIM, SPF, DMARC)
2. In Brevo Dashboard → Senders & IP → Settings
3. Follow instructions to add DNS records

### Problem: No error but emails not arriving
**Solution:**
1. Check Brevo dashboard → Statistics → see if emails are sent
2. Check email quota/credits in Brevo account
3. Verify transactional email platform is activated
4. Check recipient spam folder

### Problem: "Account suspended" error
**Solution:**
- Contact Brevo support to reactivate account
- Common causes: unusual activity, compromised credentials

## 📚 Additional Resources

- [Brevo API Documentation](https://developers.brevo.com/docs)
- [Brevo Troubleshooting Guide](https://help.brevo.com/hc/en-us/articles/115000188150)
- [Domain Authentication Guide](https://help.brevo.com/hc/en-us/articles/16045394674066)

## 🎯 Next Steps

1. **Deploy the fix** to production
2. **Test registration** with a real email
3. **Monitor logs** for the first few emails
4. **Set up domain authentication** (DKIM/DMARC) to avoid spam
5. **Consider enabling** `REQUIRE_EMAIL_VERIFICATION=true` for security

## 💡 Pro Tips

- Keep test email page handy for quick testing
- Monitor Brevo statistics dashboard regularly
- Set up alerts for bounce rates
- Consider adding more validated senders (support@, noreply@, etc.)
- Always test in production after deployment changes

---

**Need Help?** Check the logs first - the new logging will show you exactly what Brevo is responding with!

