# Turso Database Setup Guide

This guide will help you set up Turso database for username storage in the Stataku application.

## 1. Create Turso Account and Database

1. Go to [turso.tech](https://turso.tech)
2. Sign up or sign in to your account
3. Create a new database:
   - Click "Create Database"
   - Enter database name: `stataku-db` (or your preferred name)
   - Choose a region closest to your users
   - Click "Create"

## 2. Get Database Credentials

1. In your Turso dashboard, select your database
2. Go to the "Connect" tab
3. Copy the following values:
   - Database URL (starts with `libsql://`)
   - Auth Token

## 3. Set Up Environment Variables

1. Copy `example.env` to `.env.local`
2. Fill in your Turso credentials:

```env
# Turso Database Configuration
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# Supabase Configuration (for authentication only)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 4. Database Schema

The application will automatically create the required schema when it starts. The schema includes:

```sql
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
```

## 5. How It Works

### Authentication Flow

- **Supabase**: Handles user authentication (sign up, sign in, OAuth)
- **Turso**: Stores user profiles and usernames

### Username Checking

- Real-time username availability checking against Turso database
- Every keystroke triggers a database query
- Instant feedback with green/red borders

### Data Storage

- User profiles are stored in Turso database
- Usernames are checked for uniqueness in real-time
- All data operations use libsql client

## 6. Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to `/signup`
3. Create a new account
4. You should be redirected to `/create-username`
5. Try typing a username - you should see real-time availability checking
6. Create a username and you should be redirected to `/dashboard`

## 7. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your Vercel app URL)
4. Deploy!

## 8. Database Management

### Viewing Data

You can view your database data in the Turso dashboard or use the Turso CLI:

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login to Turso
turso auth login

# Connect to your database
turso db shell your-database-name

# Run SQL queries
SELECT * FROM user_profiles;
```

### Backup

Turso automatically handles backups, but you can also export your data:

```bash
turso db dump your-database-name > backup.sql
```

## 9. Performance Optimization

### Indexes

The schema includes indexes for optimal performance:

- `idx_user_profiles_username`: Fast username lookups
- `idx_user_profiles_user_id`: Fast user profile lookups

### Connection Pooling

Turso handles connection pooling automatically, so you don't need to worry about managing connections.

## 10. Troubleshooting

### Common Issues

1. **"Invalid database URL"**: Check your `TURSO_DATABASE_URL` environment variable
2. **"Authentication failed"**: Verify your `TURSO_AUTH_TOKEN`
3. **"Table doesn't exist"**: The schema should be created automatically on first run
4. **Slow queries**: Check if your database region is close to your users

### Getting Help

- [Turso Documentation](https://docs.turso.tech/)
- [libsql Documentation](https://libsql.org/docs/)
- [Turso Discord](https://discord.gg/turso)

## 11. Security Considerations

- Keep your `TURSO_AUTH_TOKEN` secure and never commit it to version control
- Use environment variables for all sensitive data
- The database uses SQLite, which is secure and reliable
- Turso provides built-in security features

## 12. Scaling

Turso automatically scales with your usage:

- No need to manage database instances
- Automatic replication across regions
- Built-in caching for better performance
- Pay only for what you use

Your Stataku application is now ready to use Turso for data storage while keeping Supabase for authentication! 🎉
