# Supabase Setup Guide

This guide will help you set up Supabase for the Stataku application.

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or sign in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `stataku-auth` (or your preferred name)
   - Database Password: Generate a strong password
   - Region: Choose the closest region to your users
6. Click "Create new project"

## 2. Get Project Credentials

1. Go to your project dashboard
2. Navigate to Settings > API
3. Copy the following values:
   - Project URL
   - Anon (public) key

## 3. Set Up Environment Variables

1. Copy `example.env` to `.env.local`
2. Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 4. Create Database Schema

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Allow public to check username availability (for signup flow)
CREATE POLICY "Public can check username availability" ON user_profiles
  FOR SELECT USING (true);
```

## 5. Configure OAuth Providers

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client ID
5. Configure OAuth consent screen
6. Set authorized redirect URIs:
   - `https://your-project-id.supabase.co/auth/v1/callback`
7. Copy Client ID and Client Secret
8. In Supabase Dashboard > Authentication > Providers > Google:
   - Enable Google provider
   - Add Client ID and Client Secret
   - Set redirect URL to: `https://your-project-id.supabase.co/auth/v1/callback`

### Discord OAuth

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 > General
4. Add redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret
6. In Supabase Dashboard > Authentication > Providers > Discord:
   - Enable Discord provider
   - Add Client ID and Client Secret
   - Set redirect URL to: `https://your-project-id.supabase.co/auth/v1/callback`

## 6. Configure Site URL

1. In Supabase Dashboard > Authentication > URL Configuration
2. Set Site URL to your production domain (e.g., `https://app.oceanflo.xyz`)
3. Add redirect URLs:
   - `http://localhost:3000/create-username` (for development)
   - `https://app.oceanflo.xyz/create-username` (for production)
   - `https://your-vercel-app.vercel.app/create-username` (if using Vercel)

## 7. Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to `/signup`
3. Create a new account
4. You should be redirected to `/create-username`
5. Create a username
6. You should be redirected to `/dashboard`

## 8. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your Vercel app URL)
4. Deploy!

## Troubleshooting

### Common Issues

1. **"Invalid API key"**: Check your environment variables
2. **"User not found"**: Make sure RLS policies are set up correctly
3. **OAuth redirect errors**: Verify redirect URLs in both Supabase and OAuth providers
4. **Database connection issues**: Check your project URL and ensure the project is active

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
