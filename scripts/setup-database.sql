-- Complete database setup for Formly
-- Run this entire script in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for categories
DO $$ BEGIN
  CREATE TYPE main_category AS ENUM (
    'strength_training',
    'cardio', 
    'combat_sports',
    'yoga_pilates',
    'dance_fitness',
    'team_sports',
    'outdoor_sports',
    'flexibility_mobility',
    'specialized_training'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE sub_category AS ENUM (
    -- Strength Training
    'powerlifting', 'bodybuilding', 'crossfit', 'functional_training', 'calisthenics', 'olympic_weightlifting',
    -- Cardio
    'running', 'cycling', 'rowing', 'swimming', 'hiit', 'circuit_training', 'jump_rope',
    -- Combat Sports
    'boxing', 'kickboxing', 'muay_thai', 'taekwondo', 'karate', 'jiu_jitsu', 'mma', 'kung_fu', 'judo', 'krav_maga',
    -- Yoga & Pilates
    'hatha_yoga', 'vinyasa_yoga', 'ashtanga_yoga', 'bikram_yoga', 'yin_yoga', 'power_yoga', 'pilates_mat', 'pilates_reformer',
    -- Dance & Fitness
    'zumba', 'hip_hop', 'ballet_fitness', 'salsa', 'bollywood', 'contemporary', 'latin_dance', 'aerobics',
    -- Team Sports
    'basketball', 'football', 'soccer', 'volleyball', 'baseball', 'hockey', 'rugby', 'tennis', 'badminton', 'table_tennis',
    -- Outdoor Sports
    'hiking', 'rock_climbing', 'surfing', 'skiing', 'snowboarding', 'mountain_biking', 'trail_running', 'kayaking', 'paddleboarding',
    -- Flexibility & Mobility
    'stretching', 'foam_rolling', 'mobility_drills', 'recovery_sessions', 'meditation', 'breathing_exercises',
    -- Specialized Training
    'rehabilitation', 'senior_fitness', 'prenatal_fitness', 'youth_training', 'athlete_training', 'injury_prevention'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  videos_count INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos table
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in seconds
  main_category main_category NOT NULL,
  sub_category sub_category NOT NULL,
  tags TEXT[], -- array of tags
  views INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video likes table
CREATE TABLE IF NOT EXISTS public.video_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_id, user_id)
);

-- Video comments table
CREATE TABLE IF NOT EXISTS public.video_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User follows table
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

-- Video views table (for analytics)
CREATE TABLE IF NOT EXISTS public.video_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playlists table
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playlist videos table
CREATE TABLE IF NOT EXISTS public.playlist_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playlist_id, video_id)
);

-- Create indexes for better performance (only if they don't exist)
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_videos_user_id ON public.videos(user_id);
  CREATE INDEX IF NOT EXISTS idx_videos_main_category ON public.videos(main_category);
  CREATE INDEX IF NOT EXISTS idx_videos_sub_category ON public.videos(sub_category);
  CREATE INDEX IF NOT EXISTS idx_videos_created_at ON public.videos(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_videos_likes_count ON public.videos(likes_count DESC);
  CREATE INDEX IF NOT EXISTS idx_videos_views ON public.videos(views DESC);
  CREATE INDEX IF NOT EXISTS idx_video_likes_user_id ON public.video_likes(user_id);
  CREATE INDEX IF NOT EXISTS idx_video_likes_video_id ON public.video_likes(video_id);
  CREATE INDEX IF NOT EXISTS idx_video_comments_video_id ON public.video_comments(video_id);
  CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows(follower_id);
  CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows(following_id);
  CREATE INDEX IF NOT EXISTS idx_video_views_video_id ON public.video_views(video_id);
  CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
  CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON public.playlists(user_id);
  CREATE INDEX IF NOT EXISTS idx_playlist_videos_playlist_id ON public.playlist_videos(playlist_id);
END $$;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_videos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can view public videos" ON public.videos;
DROP POLICY IF EXISTS "Users can view their own videos" ON public.videos;
DROP POLICY IF EXISTS "Users can insert their own videos" ON public.videos;
DROP POLICY IF EXISTS "Users can update their own videos" ON public.videos;
DROP POLICY IF EXISTS "Users can delete their own videos" ON public.videos;
DROP POLICY IF EXISTS "Anyone can view likes" ON public.video_likes;
DROP POLICY IF EXISTS "Users can insert their own likes" ON public.video_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.video_likes;
DROP POLICY IF EXISTS "Anyone can view comments" ON public.video_comments;
DROP POLICY IF EXISTS "Users can insert their own comments" ON public.video_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.video_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.video_comments;
DROP POLICY IF EXISTS "Anyone can view follows" ON public.user_follows;
DROP POLICY IF EXISTS "Users can manage their own follows" ON public.user_follows;
DROP POLICY IF EXISTS "Users can unfollow" ON public.user_follows;
DROP POLICY IF EXISTS "Anyone can insert views" ON public.video_views;
DROP POLICY IF EXISTS "Users can view their own video views" ON public.video_views;

-- RLS Policies for users table
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for videos table
CREATE POLICY "Anyone can view public videos" ON public.videos
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can view their own videos" ON public.videos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own videos" ON public.videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos" ON public.videos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos" ON public.videos
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for video_likes table
CREATE POLICY "Anyone can view likes" ON public.video_likes
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their own likes" ON public.video_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON public.video_likes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for video_comments table
CREATE POLICY "Anyone can view comments" ON public.video_comments
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their own comments" ON public.video_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.video_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.video_comments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_follows table
CREATE POLICY "Anyone can view follows" ON public.user_follows
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can manage their own follows" ON public.user_follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" ON public.user_follows
  FOR DELETE USING (auth.uid() = follower_id);

-- RLS Policies for video_views table
CREATE POLICY "Anyone can insert views" ON public.video_views
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can view their own video views" ON public.video_views
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT user_id FROM public.videos WHERE id = video_id)
  );

-- RLS Policies for playlists table
CREATE POLICY "Anyone can view public playlists" ON public.playlists
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can view their own playlists" ON public.playlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own playlists" ON public.playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" ON public.playlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" ON public.playlists
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for playlist_videos table
CREATE POLICY "Users can view playlist videos for public playlists" ON public.playlist_videos
  FOR SELECT USING (
    playlist_id IN (SELECT id FROM public.playlists WHERE is_public = TRUE)
    OR playlist_id IN (SELECT id FROM public.playlists WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage their own playlist videos" ON public.playlist_videos
  FOR ALL USING (
    playlist_id IN (SELECT id FROM public.playlists WHERE user_id = auth.uid())
  );

-- Functions and triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update counters
CREATE OR REPLACE FUNCTION public.update_video_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.videos 
    SET likes_count = likes_count + 1,
        updated_at = NOW()
    WHERE id = NEW.video_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.videos 
    SET likes_count = likes_count - 1,
        updated_at = NOW()
    WHERE id = OLD.video_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_video_like_change ON public.video_likes;
CREATE TRIGGER on_video_like_change
  AFTER INSERT OR DELETE ON public.video_likes
  FOR EACH ROW EXECUTE PROCEDURE public.update_video_likes_count();

-- Function to update user stats
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update follower/following counts
    UPDATE public.users 
    SET followers_count = followers_count + 1
    WHERE id = NEW.following_id;
    
    UPDATE public.users 
    SET following_count = following_count + 1
    WHERE id = NEW.follower_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.users 
    SET followers_count = followers_count - 1
    WHERE id = OLD.following_id;
    
    UPDATE public.users 
    SET following_count = following_count - 1
    WHERE id = OLD.follower_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_follow_change ON public.user_follows;
CREATE TRIGGER on_user_follow_change
  AFTER INSERT OR DELETE ON public.user_follows
  FOR EACH ROW EXECUTE PROCEDURE public.update_user_stats();