-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for categories
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

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
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
CREATE TABLE public.videos (
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
CREATE TABLE public.video_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_id, user_id)
);

-- Video comments table
CREATE TABLE public.video_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.video_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User follows table
CREATE TABLE public.user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

-- Video views table (for analytics)
CREATE TABLE public.video_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_videos_user_id ON public.videos(user_id);
CREATE INDEX idx_videos_main_category ON public.videos(main_category);
CREATE INDEX idx_videos_sub_category ON public.videos(sub_category);
CREATE INDEX idx_videos_created_at ON public.videos(created_at DESC);
CREATE INDEX idx_videos_likes_count ON public.videos(likes_count DESC);
CREATE INDEX idx_videos_views ON public.videos(views DESC);
CREATE INDEX idx_video_likes_user_id ON public.video_likes(user_id);
CREATE INDEX idx_video_likes_video_id ON public.video_likes(video_id);
CREATE INDEX idx_video_comments_video_id ON public.video_comments(video_id);
CREATE INDEX idx_video_comments_parent_id ON public.video_comments(parent_comment_id);
CREATE INDEX idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON public.user_follows(following_id);
CREATE INDEX idx_video_views_video_id ON public.video_views(video_id);
CREATE INDEX idx_users_username ON public.users(username);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_views ENABLE ROW LEVEL SECURITY;

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