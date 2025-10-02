# Email Change Setup Guide

This guide explains how to properly set up email change functionality in your Supabase project.

## Prerequisites

1. Supabase project configured with authentication
2. Email templates properly configured
3. Redirect URLs configured

## Step 1: Disable Secure Email Change Setting

**IMPORTANT**: First, you need to disable the "Secure email change" setting to ensure only the new email receives confirmation.

1. Go to your Supabase Dashboard
2. Navigate to Authentication > Providers
3. Find the "Secure email change" setting
4. **Disable/Turn OFF** the "Secure email change" option

This prevents Supabase from sending confirmation emails to both old and new email addresses.

## Step 2: Configure Email Templates in Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to Authentication > Email Templates
3. Find the "Email Change" template
4. Update the template with the following content:

```html
<h2>Confirm Email Change</h2>

<p>You are requesting to update your email address to {{ .NewEmail }}.</p>

<p>Follow this link to confirm the change:</p>
<p>
  <a href="{{ .ConfirmationURL }}"> Confirm Email Change </a>
</p>

<p>If you didn't request this change, please ignore this email.</p>
```

**IMPORTANT**: Use `{{ .ConfirmationURL }}` instead of manually constructing the URL. This ensures Supabase handles the verification properly.

## Step 3: Configure Redirect URLs

1. Go to Authentication > URL Configuration
2. Add the following redirect URLs:
   - `http://localhost:3000/auth/confirm` (for local development)
   - `https://yourdomain.com/auth/confirm` (for production)

## Step 4: Configure Site URL

1. In the same URL Configuration page
2. Set the Site URL to:
   - `http://localhost:3000` (for local development)
   - `https://yourdomain.com` (for production)

## Step 5: Test the Email Change Flow

1. Start your development server: `npm run dev`
2. Navigate to `/settings`
3. Enter a new email address in the email change form
4. Click "Update Email"
5. Check your email for confirmation link
6. Click the link to complete the change

## How It Works

1. **User requests email change** → `supabase.auth.updateUser()` is called
2. **Supabase sends confirmation email** → Uses the configured email template
3. **User clicks email link** → Redirects to Supabase's verification endpoint
4. **Supabase verifies token** → Redirects to your app with session tokens
5. **Your app handles redirect** → `/auth/confirm` page processes the tokens
6. **Session is established** → User is logged in with new email

## Troubleshooting

### Email Not Received

- Check spam/junk folder
- Verify SMTP configuration in Supabase
- Check rate limits in Supabase dashboard
- Ensure email template is properly configured

### Confirmation Link Not Working

- Verify redirect URLs are configured correctly
- Check that the email template uses `{{ .ConfirmationURL }}`
- Ensure the `/auth/confirm` page exists and is accessible
- Check browser console for errors

### Email Change Not Persisting

- Check Supabase logs for errors
- Verify the user is properly authenticated
- Ensure the email change template is configured correctly
- Check that the session is being set properly

### Receiving Emails on Both Old and New Email Addresses

- **Most Common Issue**: The "Secure email change" setting is enabled
- **Solution**: Go to Authentication > Providers and disable "Secure email change"
- This setting requires confirmation from both emails for security reasons
- Disabling it will only send confirmation to the new email address

### Session Not Being Set

- Verify the `/auth/confirm` page is handling tokens correctly
- Check that `supabase.auth.setSession()` is being called
- Ensure the user context is being refreshed

## Code Implementation

The email change functionality is implemented in:

- `app/settings/page.tsx` - Main settings page with email update form
- `app/auth/confirm/page.tsx` - Handles email confirmation redirects and session setting

## Testing Checklist

- [ ] Email change request is sent successfully
- [ ] Confirmation email is received
- [ ] Confirmation link works correctly
- [ ] User is redirected to confirmation page
- [ ] Session is established with new email
- [ ] User can sign in with new email
- [ ] Old email no longer works for sign in

## Common Issues

1. **Template not configured**: Make sure the email_change template is set up in Supabase
2. **Wrong redirect URL**: Ensure the redirect URL matches your domain
3. **Rate limiting**: Check if you've exceeded email sending limits
4. **SMTP issues**: Verify your SMTP configuration in Supabase
5. **Session not persisting**: Check that the `/auth/confirm` page is setting the session correctly
6. **Template using wrong URL**: Make sure to use `{{ .ConfirmationURL }}` not custom URL construction

## Debugging

To debug the email change flow:

1. Check browser console for errors
2. Check Supabase logs in the dashboard
3. Verify all URLs are accessible
4. Check that tokens are being passed correctly
