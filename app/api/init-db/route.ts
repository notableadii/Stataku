import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

// Initialize Turso client on server side
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function POST() {
  try {
    // Create profiles table as specified in requirements
    // id references auth.users(id) from Supabase
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if slug column exists, if not add it (without UNIQUE constraint first)
    try {
      await turso.execute(`SELECT slug FROM profiles LIMIT 1`);
      console.log("Slug column already exists");
    } catch (error) {
      console.log("Adding slug column to profiles table");
      await turso.execute(`
        ALTER TABLE profiles ADD COLUMN slug TEXT
      `);
    }

    // Check if display_name column exists, if not add it
    try {
      await turso.execute(`SELECT display_name FROM profiles LIMIT 1`);
      console.log("Display_name column already exists");
    } catch (error) {
      console.log("Adding display_name column to profiles table");
      await turso.execute(`
        ALTER TABLE profiles ADD COLUMN display_name TEXT
      `);
    }

    // Check if bio column exists, if not add it
    try {
      await turso.execute(`SELECT bio FROM profiles LIMIT 1`);
      console.log("Bio column already exists");
    } catch (error) {
      console.log("Adding bio column to profiles table");
      await turso.execute(`
        ALTER TABLE profiles ADD COLUMN bio TEXT
      `);
    }

    // Check if avatar_url column exists, if not add it
    try {
      await turso.execute(`SELECT avatar_url FROM profiles LIMIT 1`);
      console.log("Avatar_url column already exists");
    } catch (error) {
      console.log("Adding avatar_url column to profiles table");
      await turso.execute(`
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT
      `);
    }

    // Update existing profiles to have slug values (migration)
    try {
      await turso.execute(`
        UPDATE profiles 
        SET slug = username 
        WHERE slug IS NULL OR slug = ''
      `);
      console.log("Updated existing profiles with slug values");
    } catch (error) {
      console.log("No existing profiles to update or error updating:", error);
    }

    // Create index for username lookups (optimized for availability checks)
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username)
    `);

    // Create unique index for slug lookups (optimized for profile page access)
    await turso.execute(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_slug_unique ON profiles(slug)
    `);

    // Drop old user_profiles table if it exists (migration)
    try {
      await turso.execute(`DROP TABLE IF EXISTS user_profiles`);
      console.log("Dropped old user_profiles table");
    } catch (error) {
      console.log("No old user_profiles table to drop");
    }

    return NextResponse.json({
      success: true,
      message: "Database schema initialized successfully with profiles table",
    });
  } catch (error) {
    console.error("Error initializing database schema:", error);
    return NextResponse.json(
      { error: "Failed to initialize database schema" },
      { status: 500 },
    );
  }
}
