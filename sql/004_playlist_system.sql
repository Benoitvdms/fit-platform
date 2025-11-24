-- Playlist System Database Schema
-- This creates the tables and functions needed for playlist functionality

-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  video_count INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0 -- in seconds
);

-- Create playlist_videos table (junction table)
CREATE TABLE IF NOT EXISTS playlist_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(playlist_id, video_id), -- Prevent duplicate videos in same playlist
  UNIQUE(playlist_id, position) -- Ensure unique position within playlist
);

-- Create playlist_follows table (for following playlists)
CREATE TABLE IF NOT EXISTS playlist_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, playlist_id)
);

-- Update user_stats table to include playlist counts
ALTER TABLE user_stats 
ADD COLUMN IF NOT EXISTS playlists_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS playlist_followers_count INTEGER DEFAULT 0;

-- Add playlist counts to playlists table
ALTER TABLE playlists 
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlists_is_public ON playlists(is_public);
CREATE INDEX IF NOT EXISTS idx_playlists_created_at ON playlists(created_at);
CREATE INDEX IF NOT EXISTS idx_playlist_videos_playlist_id ON playlist_videos(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_videos_video_id ON playlist_videos(video_id);
CREATE INDEX IF NOT EXISTS idx_playlist_videos_position ON playlist_videos(playlist_id, position);
CREATE INDEX IF NOT EXISTS idx_playlist_follows_user_id ON playlist_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_playlist_follows_playlist_id ON playlist_follows(playlist_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_follows ENABLE ROW LEVEL SECURITY;

-- Playlists policies
CREATE POLICY "Users can view public playlists" ON playlists
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can view their own playlists" ON playlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own playlists" ON playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" ON playlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" ON playlists
  FOR DELETE USING (auth.uid() = user_id);

-- Playlist videos policies
CREATE POLICY "Users can view playlist videos for accessible playlists" ON playlist_videos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE playlists.id = playlist_videos.playlist_id 
      AND (playlists.is_public = true OR playlists.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage videos in their own playlists" ON playlist_videos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE playlists.id = playlist_videos.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

-- Playlist follows policies
CREATE POLICY "Users can view all playlist follows" ON playlist_follows
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own playlist follows" ON playlist_follows
  FOR ALL USING (auth.uid() = user_id);

-- Functions for automatic count updates

-- Function to update playlist video count and total duration
CREATE OR REPLACE FUNCTION update_playlist_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update playlist video count and total duration
    UPDATE playlists 
    SET 
      video_count = video_count + 1,
      total_duration = total_duration + COALESCE((
        SELECT duration_seconds FROM videos WHERE id = NEW.video_id
      ), 0),
      updated_at = now()
    WHERE id = NEW.playlist_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update playlist video count and total duration
    UPDATE playlists 
    SET 
      video_count = GREATEST(video_count - 1, 0),
      total_duration = GREATEST(total_duration - COALESCE((
        SELECT duration_seconds FROM videos WHERE id = OLD.video_id
      ), 0), 0),
      updated_at = now()
    WHERE id = OLD.playlist_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update user playlist counts
CREATE OR REPLACE FUNCTION update_user_playlist_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment user's playlist count
    INSERT INTO user_stats (user_id, playlists_count)
    VALUES (NEW.user_id, 1)
    ON CONFLICT (user_id)
    DO UPDATE SET playlists_count = user_stats.playlists_count + 1;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement user's playlist count
    UPDATE user_stats 
    SET playlists_count = GREATEST(playlists_count - 1, 0)
    WHERE user_id = OLD.user_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update playlist follower counts
CREATE OR REPLACE FUNCTION update_playlist_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment playlist follower count
    UPDATE playlists 
    SET followers_count = followers_count + 1
    WHERE id = NEW.playlist_id;
    
    -- Increment user's playlist followers count
    UPDATE user_stats 
    SET playlist_followers_count = playlist_followers_count + 1
    WHERE user_id = (SELECT user_id FROM playlists WHERE id = NEW.playlist_id);
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement playlist follower count
    UPDATE playlists 
    SET followers_count = GREATEST(followers_count - 1, 0)
    WHERE id = OLD.playlist_id;
    
    -- Decrement user's playlist followers count
    UPDATE user_stats 
    SET playlist_followers_count = GREATEST(playlist_followers_count - 1, 0)
    WHERE user_id = (SELECT user_id FROM playlists WHERE id = OLD.playlist_id);
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE OR REPLACE TRIGGER trigger_update_playlist_stats
  AFTER INSERT OR DELETE ON playlist_videos
  FOR EACH ROW EXECUTE FUNCTION update_playlist_stats();

CREATE OR REPLACE TRIGGER trigger_update_user_playlist_counts
  AFTER INSERT OR DELETE ON playlists
  FOR EACH ROW EXECUTE FUNCTION update_user_playlist_counts();

CREATE OR REPLACE TRIGGER trigger_update_playlist_follower_counts
  AFTER INSERT OR DELETE ON playlist_follows
  FOR EACH ROW EXECUTE FUNCTION update_playlist_follower_counts();

-- Function to get playlist with videos
CREATE OR REPLACE FUNCTION get_playlist_with_videos(playlist_uuid UUID)
RETURNS TABLE (
  playlist_id UUID,
  playlist_title VARCHAR,
  playlist_description TEXT,
  playlist_is_public BOOLEAN,
  playlist_thumbnail_url TEXT,
  playlist_created_at TIMESTAMP WITH TIME ZONE,
  playlist_updated_at TIMESTAMP WITH TIME ZONE,
  playlist_video_count INTEGER,
  playlist_total_duration INTEGER,
  playlist_followers_count INTEGER,
  video_id UUID,
  video_title VARCHAR,
  video_description TEXT,
  video_thumbnail_url TEXT,
  video_duration VARCHAR,
  video_views INTEGER,
  video_position INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.is_public,
    p.thumbnail_url,
    p.created_at,
    p.updated_at,
    p.video_count,
    p.total_duration,
    p.followers_count,
    v.id,
    v.title,
    v.description,
    v.thumbnail_url,
    v.duration,
    v.views,
    pv.position
  FROM playlists p
  LEFT JOIN playlist_videos pv ON p.id = pv.playlist_id
  LEFT JOIN videos v ON pv.video_id = v.id
  WHERE p.id = playlist_uuid
  ORDER BY pv.position ASC;
END;
$$ LANGUAGE plpgsql;

-- Initialize playlist counts for existing users
INSERT INTO user_stats (user_id, playlists_count)
SELECT user_id, COUNT(*) as playlist_count
FROM playlists 
WHERE user_id IS NOT NULL
GROUP BY user_id
ON CONFLICT (user_id) 
DO UPDATE SET playlists_count = EXCLUDED.playlists_count;

-- Update existing playlist video counts
UPDATE playlists 
SET 
  video_count = (
    SELECT COUNT(*) 
    FROM playlist_videos 
    WHERE playlist_videos.playlist_id = playlists.id
  ),
  total_duration = COALESCE((
    SELECT SUM(v.duration_seconds) 
    FROM playlist_videos pv
    JOIN videos v ON pv.video_id = v.id
    WHERE pv.playlist_id = playlists.id
  ), 0);

-- Update existing playlist follower counts
UPDATE playlists 
SET followers_count = (
  SELECT COUNT(*) 
  FROM playlist_follows 
  WHERE playlist_follows.playlist_id = playlists.id
);

COMMENT ON TABLE playlists IS 'User-created playlists containing collections of videos';
COMMENT ON TABLE playlist_videos IS 'Junction table linking playlists to videos with ordering';
COMMENT ON TABLE playlist_follows IS 'Users following specific playlists';
COMMENT ON FUNCTION get_playlist_with_videos(UUID) IS 'Returns playlist details with all associated videos in order';