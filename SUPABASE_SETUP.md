# Supabase Database Setup for Formly

## Overview
This document explains how to set up your Supabase database for the Formly fitness video platform.

## Database Schema

### Tables
1. **users** - Extended user profiles (links to auth.users)
2. **videos** - Video content with comprehensive categorization
3. **video_likes** - User likes on videos
4. **video_comments** - Comments and replies on videos
5. **user_follows** - User following relationships
6. **video_views** - Analytics for video views

### Sports Categories
The database supports 9 main categories with 60+ subcategories:

- **Strength Training**: Powerlifting, Bodybuilding, CrossFit, Calisthenics, etc.
- **Cardio**: Running, Cycling, HIIT, Swimming, etc.
- **Combat Sports**: Boxing, Muay Thai, Karate, Jiu-Jitsu, MMA, etc.
- **Yoga & Pilates**: Hatha, Vinyasa, Ashtanga, Power Yoga, etc.
- **Dance & Fitness**: Zumba, Hip Hop, Ballet Fitness, Salsa, etc.
- **Team Sports**: Basketball, Soccer, Tennis, Volleyball, etc.
- **Outdoor Sports**: Hiking, Rock Climbing, Surfing, Skiing, etc.
- **Flexibility & Mobility**: Stretching, Foam Rolling, Recovery, etc.
- **Specialized Training**: Rehabilitation, Senior Fitness, Prenatal, etc.

## Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for initialization to complete

### 2. Run Database Migrations
In your Supabase SQL editor, run these files in order:

1. **001_initial_schema.sql** - Creates tables, types, indexes, and RLS policies
2. **002_functions_and_triggers.sql** - Creates database functions and triggers
3. **003_storage_setup.sql** - Sets up file storage buckets and policies
4. **seed.sql** (optional) - Adds sample data for testing

### 3. Configure Environment Variables
1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### 4. Storage Setup
Three storage buckets are created:
- **videos** - For video files
- **thumbnails** - For video thumbnail images  
- **avatars** - For user profile pictures

All buckets have proper RLS policies for security.

## Key Features

### Authentication Integration
- Automatic user profile creation on signup
- Row Level Security (RLS) on all tables
- Proper user permissions and data isolation

### Real-time Counters
- Automatic like/unlike counting
- Comment count updates
- Follower/following count maintenance
- Video view tracking

### Advanced Queries
- **Trending algorithm** - Weights recent videos by engagement
- **User feed** - Shows videos from followed users
- **Category filtering** - Easy browsing by sport type
- **Search capabilities** - Full-text search on titles and descriptions

### Analytics
- Video view tracking with IP and user agent
- Engagement metrics (likes, comments, views)
- User growth and retention data

## Security
- Row Level Security enabled on all tables
- Users can only modify their own data
- Public content visible to everyone
- Private videos only visible to owners
- Secure file upload policies

## Performance
- Optimized indexes for common queries
- Efficient pagination support
- Cached counters to avoid expensive aggregations
- Database functions for complex operations

## Next Steps
After running the migrations:
1. Test authentication signup/signin
2. Upload sample videos to test storage
3. Verify RLS policies work correctly
4. Add any custom business logic as needed