# Supabase Setup Guide

## Step 1: Create Project ✅
- Go to supabase.com
- Create new project: "exerbet-fitness-platform"
- Save your database password!

## Step 2: Get Project Credentials
1. In your Supabase dashboard, go to **Settings > API**
2. Copy these values:
   - Project URL
   - anon/public key
   - service_role key (click "Reveal" first)

## Step 3: Run Database Migrations
1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste each migration file content:

### Migration 1: Initial Schema
- Copy content from `supabase/migrations/001_initial_schema.sql`
- Paste in SQL editor
- Click **"Run"**
- Wait for success ✅

### Migration 2: Functions & Triggers  
- Copy content from `supabase/migrations/002_functions_and_triggers.sql`
- Paste in new query
- Click **"Run"**
- Wait for success ✅

### Migration 3: Storage Setup
- Copy content from `supabase/migrations/003_storage_setup.sql`
- Paste in new query  
- Click **"Run"**
- Wait for success ✅

## Step 4: Verify Setup
1. Go to **Database > Tables** - you should see:
   - users
   - videos  
   - video_likes
   - video_comments
   - user_follows
   - video_views

2. Go to **Storage** - you should see buckets:
   - videos
   - thumbnails
   - avatars

## Step 5: Configure Environment
- Copy `.env.local.example` to `.env.local`
- Fill in your project credentials
- Restart your Next.js dev server

## Troubleshooting
- If migrations fail, check for typos
- Make sure to run them in order (001, 002, 003)
- If authentication fails, check your environment variables
- Restart dev server after changing .env.local