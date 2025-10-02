# 📧 Email Setup Guide for Stataku

## 🚨 **Issue**: Welcome Email Not Being Sent

The welcome email system is properly implemented but requires SMTP configuration to work. Here's how to set it up:

## 🔧 **Step 1: Configure SMTP in `.env.local`**

Add these variables to your `.env.local` file:

```bash
# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# SMTP Authentication (use your email credentials)
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Email Settings
FROM_EMAIL=noreply@stataku.com
FROM_NAME=Stataku Team
```

## 📋 **Step 2: Choose Your SMTP Provider**

### **Option A: Gmail (Recommended for Testing)**

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password (not your regular password)

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-character-app-password
```

### **Option B: Outlook/Hotmail**

```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

### **Option C: SendGrid (Production)**

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### **Option D: Mailgun (Production)**

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-smtp-user
SMTP_PASSWORD=your-mailgun-smtp-password
```

## 🧪 **Step 3: Test Email Configuration**

### **Method 1: Use the Dashboard Test Button**

1. **Go to your dashboard** (should show "Profile Missing" debug screen)
2. **Click "Test Email" button**
3. **Check the result**:
   - ✅ Success: "Email test successful! Check your inbox"
   - ❌ Failure: Shows specific error message

### **Method 2: Direct API Test**

```bash
# Test SMTP configuration
curl -X GET http://localhost:3000/api/test-email \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Send test email
curl -X POST http://localhost:3000/api/test-email \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## 🔍 **Step 4: Debug Email Issues**

### **Check Console Logs**

Look for these messages in your browser console:

```javascript
// Success messages:
"📧 Attempting to send welcome email...";
"✅ Welcome email sent successfully: {success: true}";

// Error messages:
"❌ Welcome email failed: {error: 'SMTP connection failed'}";
"💡 To fix email issues, check your SMTP configuration in .env.local";
```

### **Common Error Messages**

| Error                              | Solution                                            |
| ---------------------------------- | --------------------------------------------------- |
| `SMTP authentication failed`       | Check username/password, use app password for Gmail |
| `Failed to connect to SMTP server` | Check SMTP_HOST and SMTP_PORT                       |
| `Connection timed out`             | Check firewall/network settings                     |
| `SMTP configuration is missing`    | Add all required env variables                      |

## 🎯 **Step 5: Verify Welcome Email Flow**

### **Complete Flow Test**

1. **Configure SMTP** in `.env.local`
2. **Restart your development server**: `npm run dev`
3. **Sign out** and **sign in again**
4. **Check console logs** for email sending
5. **Check your email inbox** for welcome email

### **Expected Welcome Email**

The welcome email includes:

- **Subject**: "🎌 Welcome to Stataku - Complete Your Profile"
- **Beautiful HTML design** with black background
- **Stataku logo** at the top
- **Personalized greeting** with your username
- **Profile completion link** to `/settings/profile`
- **Instructions** for customizing your profile

## 🚀 **Step 6: Production Email Setup**

### **For Production Deployment**

1. **Use a professional email service** (SendGrid, Mailgun, AWS SES)
2. **Set up proper domain** for FROM_EMAIL
3. **Configure SPF/DKIM records** for better deliverability
4. **Monitor email delivery** and bounce rates

### **Environment Variables for Production**

```bash
# Production SMTP (example with SendGrid)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.your-sendgrid-api-key

# Professional sender
FROM_EMAIL=welcome@stataku.com
FROM_NAME=Stataku Team
```

## 🔧 **Troubleshooting**

### **Email Not Sending?**

1. **Check `.env.local`** has all SMTP variables
2. **Restart development server** after adding env vars
3. **Use "Test Email" button** to diagnose issues
4. **Check console logs** for specific error messages
5. **Verify SMTP credentials** are correct

### **Gmail Specific Issues**

- **Use App Password**: Not your regular Gmail password
- **Enable 2FA**: Required for app passwords
- **Check Security**: Allow less secure apps (if needed)

### **Firewall/Network Issues**

- **Port 587**: Ensure it's not blocked
- **Corporate networks**: May block SMTP
- **VPN**: Try disabling if having issues

## 📊 **Email Status Tracking**

The system tracks email status in the database:

```sql
-- Check email status for users
SELECT id, username, email_sent, last_edit FROM profiles;

-- email_sent values:
-- 'No' = Welcome email not sent yet
-- 'Yes' = Welcome email sent successfully
```

## 🎉 **Success Indicators**

You'll know email is working when:

1. **Console shows**: "✅ Welcome email sent successfully"
2. **Database shows**: `email_sent = 'Yes'`
3. **You receive**: Beautiful welcome email in your inbox
4. **Test button shows**: "✅ Email test successful!"

---

## 🚨 **Quick Fix for Current User**

Since you already have a profile, you can manually trigger the welcome email:

1. **Configure SMTP** in `.env.local`
2. **Restart server**: `npm run dev`
3. **Go to dashboard** and click **"Test Email"**
4. **If successful**, the welcome email will be sent automatically on next profile creation

The email system is **fully implemented and ready** - it just needs SMTP configuration to work! 🎌✨
