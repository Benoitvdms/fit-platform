-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update video like count
CREATE OR REPLACE FUNCTION public.update_video_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.videos 
    SET likes_count = likes_count + 1
    WHERE id = NEW.video_id;
    
    UPDATE public.users
    SET total_likes = total_likes + 1
    WHERE id = (SELECT user_id FROM public.videos WHERE id = NEW.video_id);
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.videos 
    SET likes_count = likes_count - 1
    WHERE id = OLD.video_id;
    
    UPDATE public.users
    SET total_likes = total_likes - 1
    WHERE id = (SELECT user_id FROM public.videos WHERE id = OLD.video_id);
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for video likes
CREATE OR REPLACE TRIGGER on_video_like_change
  AFTER INSERT OR DELETE ON public.video_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_video_likes_count();

-- Function to update video comments count
CREATE OR REPLACE FUNCTION public.update_video_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.videos 
    SET comments_count = comments_count + 1
    WHERE id = NEW.video_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.videos 
    SET comments_count = comments_count - 1
    WHERE id = OLD.video_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for video comments
CREATE OR REPLACE TRIGGER on_video_comment_change
  AFTER INSERT OR DELETE ON public.video_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_video_comments_count();

-- Function to update user follow counts
CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.users 
    SET following_count = following_count + 1
    WHERE id = NEW.follower_id;
    
    UPDATE public.users 
    SET followers_count = followers_count + 1
    WHERE id = NEW.following_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.users 
    SET following_count = following_count - 1
    WHERE id = OLD.follower_id;
    
    UPDATE public.users 
    SET followers_count = followers_count - 1
    WHERE id = OLD.following_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user follows
CREATE OR REPLACE TRIGGER on_user_follow_change
  AFTER INSERT OR DELETE ON public.user_follows
  FOR EACH ROW EXECUTE FUNCTION public.update_follow_counts();

-- Function to update user video count
CREATE OR REPLACE FUNCTION public.update_user_videos_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.users 
    SET videos_count = videos_count + 1
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.users 
    SET videos_count = videos_count - 1
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user videos
CREATE OR REPLACE TRIGGER on_user_video_change
  AFTER INSERT OR DELETE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.update_user_videos_count();

-- Function to increment video views
CREATE OR REPLACE FUNCTION public.increment_video_views(video_uuid UUID, user_uuid UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  -- Insert view record
  INSERT INTO public.video_views (video_id, user_id, ip_address, user_agent)
  VALUES (video_uuid, user_uuid, inet_client_addr(), current_setting('request.headers')::json->>'user-agent');
  
  -- Increment views count
  UPDATE public.videos 
  SET views = views + 1
  WHERE id = video_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trending videos
CREATE OR REPLACE FUNCTION public.get_trending_videos(time_period INTEGER DEFAULT 7)
RETURNS TABLE(
  id UUID,
  title VARCHAR,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  duration INTEGER,
  main_category main_category,
  sub_category sub_category,
  tags TEXT[],
  views INTEGER,
  likes_count INTEGER,
  comments_count INTEGER,
  user_id UUID,
  username VARCHAR,
  display_name VARCHAR,
  avatar_url TEXT,
  is_public BOOLEAN,
  created_at TIMESTAMPTZ,
  trend_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.title,
    v.description,
    v.thumbnail_url,
    v.video_url,
    v.duration,
    v.main_category,
    v.sub_category,
    v.tags,
    v.views,
    v.likes_count,
    v.comments_count,
    v.user_id,
    u.username,
    u.display_name,
    u.avatar_url,
    v.is_public,
    v.created_at,
    -- Trending algorithm: likes and views weighted by recency
    (v.likes_count * 2 + v.views) * 
    CASE 
      WHEN v.created_at > NOW() - INTERVAL '1 day' THEN 1.0
      WHEN v.created_at > NOW() - INTERVAL '3 days' THEN 0.8
      WHEN v.created_at > NOW() - INTERVAL '7 days' THEN 0.6
      ELSE 0.4
    END AS trend_score
  FROM public.videos v
  JOIN public.users u ON v.user_id = u.id
  WHERE 
    v.is_public = TRUE 
    AND v.created_at > NOW() - (time_period || ' days')::INTERVAL
  ORDER BY trend_score DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user feed (videos from followed users)
CREATE OR REPLACE FUNCTION public.get_user_feed(user_uuid UUID, page_limit INTEGER DEFAULT 20, page_offset INTEGER DEFAULT 0)
RETURNS TABLE(
  id UUID,
  title VARCHAR,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  duration INTEGER,
  main_category main_category,
  sub_category sub_category,
  tags TEXT[],
  views INTEGER,
  likes_count INTEGER,
  comments_count INTEGER,
  user_id UUID,
  username VARCHAR,
  display_name VARCHAR,
  avatar_url TEXT,
  is_public BOOLEAN,
  created_at TIMESTAMPTZ,
  is_liked BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.title,
    v.description,
    v.thumbnail_url,
    v.video_url,
    v.duration,
    v.main_category,
    v.sub_category,
    v.tags,
    v.views,
    v.likes_count,
    v.comments_count,
    v.user_id,
    u.username,
    u.display_name,
    u.avatar_url,
    v.is_public,
    v.created_at,
    EXISTS(SELECT 1 FROM public.video_likes vl WHERE vl.video_id = v.id AND vl.user_id = user_uuid) AS is_liked
  FROM public.videos v
  JOIN public.users u ON v.user_id = u.id
  WHERE 
    v.is_public = TRUE 
    AND v.user_id IN (
      SELECT following_id 
      FROM public.user_follows 
      WHERE follower_id = user_uuid
    )
  ORDER BY v.created_at DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE OR REPLACE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_videos_updated_at 
  BEFORE UPDATE ON public.videos 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();