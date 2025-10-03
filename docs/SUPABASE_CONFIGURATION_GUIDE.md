# Supabase Email Confirmation Configuration Guide

This guide explains how to configure Supabase to redirect users to the new email confirmation page after they confirm their email.

## 🎯 What We've Built

1. **Email Confirmation Page** (`/auth/email-confirmation`)

   - Shows success message when email is confirmed
   - Shows error message when confirmation fails
   - Handles different confirmation types (signup, email change, password recovery)
   - Beautiful UI with animations and proper error handling

2. **Updated Auth Confirm Route** (`/auth/confirm`)
   - Handles all email confirmation types
   - Redirects to appropriate confirmation page with status
   - Proper error handling and user feedback

## 🔧 Supabase Configuration Steps

### Step 1: Configure Redirect URLs

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Add the following URLs to your **Redirect URLs** allow list:

```
http://localhost:3000/auth/confirm
https://yourdomain.com/auth/confirm
```

**For Development:**

- Add: `http://localhost:3000/auth/confirm`
- Add: `http://localhost:3000/**` (wildcard for all localhost paths)

**For Production:**

- Add: `https://yourdomain.com/auth/confirm`
- Add: `https://yourdomain.com/**` (wildcard for all production paths)

### Step 2: Update Email Templates

1. Go to **Authentication** → **Email Templates**
2. Update the following templates to use the new redirect URL:

#### Signup Confirmation Template

**Subject:** `Confirm Your Signup`

**Content:**

```html
<h2>Confirm Your Signup</h2>
<p>Follow this link to confirm your user:</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup"
    >Confirm your email</a
  >
</p>
```

#### Email Change Template

**Subject:** `Confirm Email Change`

**Content:**

```html
<h2>Confirm Email Change</h2>
<p>Follow this link to confirm the update of your email:</p>
<p>
  <a
    href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change"
    >Change email</a
  >
</p>
```

#### Password Recovery Template

**Subject:** `Reset Your Password`

**Content:**

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p>
  <a
    href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery"
    >Reset Password</a
  >
</p>
```

#### Magic Link Template

**Subject:** `Your Magic Link`

**Content:**

```html
<h2>Magic Link</h2>
<p>Follow this link to login:</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email"
    >Log In</a
  >
</p>
```

### Step 3: Update Site URL

1. In **Authentication** → **URL Configuration**
2. Set your **Site URL** to:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

## 🔄 How It Works

### Email Confirmation Flow

1. **User requests email confirmation** (signup, email change, password reset)
2. **Supabase sends email** with confirmation link
3. **User clicks link** → redirected to `/auth/confirm?token_hash=...&type=...`
4. **Auth confirm route** verifies the token with Supabase
5. **Success**: Redirects to `/auth/email-confirmation?confirmed=true&type=...`
6. **Error**: Redirects to `/auth/email-confirmation?confirmed=false&error=...`
7. **Confirmation page** shows appropriate message to user

### Confirmation Types Handled

- **`signup`**: New user email confirmation
- **`email_change`**: Email address change confirmation
- **`recovery`**: Password reset confirmation
- **`email`**: Magic link login

## 🎨 Features of the Confirmation Page

### Success States

- ✅ **Signup Confirmation**: "Your email has been confirmed successfully!"
- ✅ **Email Change**: "Your email address has been updated successfully!"
- ✅ **Password Recovery**: "Your password has been reset successfully!"
- ✅ **Magic Link**: "You have been logged in successfully!"

### Error States

- ❌ **Invalid Link**: "Invalid confirmation link. Please check your email for the correct confirmation link."
- ❌ **Verification Failed**: "Unable to confirm your email. This could be due to an expired or invalid confirmation link."
- ❌ **Expired Token**: "This confirmation link has expired. Please request a new one."

### UI Features

- 🎭 **Smooth Animations**: Framer Motion animations for better UX
- 🎨 **Beautiful Design**: Modern UI with proper success/error states
- 📱 **Responsive**: Works on all device sizes
- 🔄 **Loading States**: Shows loading spinner while verifying
- 🎯 **Clear Actions**: "Go to Settings", "Try Again", "Go Home" buttons

## 🧪 Testing the Configuration

### Test Email Confirmation

1. **Sign up a new user** with an email address
2. **Check email** for confirmation link
3. **Click the link** - should redirect to confirmation page
4. **Verify success message** appears

### Test Email Change

1. **Go to Settings** page
2. **Change email address**
3. **Check new email** for confirmation link
4. **Click the link** - should show email change success

### Test Password Recovery

1. **Go to sign-in page**
2. **Click "Forgot Password"**
3. **Enter email** and request reset
4. **Check email** for reset link
5. **Click the link** - should show password reset success

## 🚨 Troubleshooting

### Common Issues

1. **"Redirect URL not allowed"**

   - Add your domain to the redirect URLs allow list
   - Make sure the URL exactly matches (including http/https)

2. **"Invalid confirmation link"**

   - Check that email templates use the correct URL format
   - Verify token_hash and type parameters are included

3. **"Token has expired"**

   - Tokens expire after a certain time (usually 24 hours)
   - User needs to request a new confirmation email

4. **Page not loading**
   - Check that the `/auth/email-confirmation` page exists
   - Verify the route is properly configured

### Debug Steps

1. **Check Supabase logs** in the dashboard
2. **Verify redirect URLs** are correctly configured
3. **Test with different email providers** (Gmail, Outlook, etc.)
4. **Check browser console** for any JavaScript errors

## 📝 Environment Variables

Make sure these are set in your environment:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🎉 Benefits

- **Better UX**: Users get clear feedback on confirmation status
- **Professional Look**: Beautiful, branded confirmation page
- **Error Handling**: Proper error messages and recovery options
- **Unified Experience**: Single page handles all confirmation types
- **Mobile Friendly**: Responsive design works on all devices

## 🔗 Related Files

- `app/auth/email-confirmation/page.tsx` - Main confirmation page
- `app/auth/confirm/route.ts` - Auth confirmation handler
- `app/settings/page.tsx` - Updated to use new redirect URL

This configuration ensures a smooth, professional email confirmation experience for your users!

