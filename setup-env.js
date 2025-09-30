#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const envContent = `# Supabase Configuration (for authentication only)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Turso Database Configuration (for data storage)
# Set these to your actual Turso credentials when ready
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
`;

const envPath = path.join(__dirname, ".env.local");

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log("✅ Created .env.local file with default values");
  console.log(
    "📝 Please update the environment variables with your actual credentials",
  );
} else {
  console.log("⚠️  .env.local already exists");
}
