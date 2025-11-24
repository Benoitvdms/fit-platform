-- Sample data for development
-- This file can be used to populate your database with test data

-- Insert sample users (these will be created automatically when users sign up)
-- But we can insert some sample data for testing

-- Sample videos data
INSERT INTO public.videos (
  title, description, video_url, thumbnail_url, duration, 
  main_category, sub_category, tags, views, likes_count, 
  user_id, is_public
) VALUES 
  (
    'Full Body HIIT Workout - 20 Minutes',
    'High-intensity interval training workout targeting all major muscle groups. Perfect for burning calories and building strength.',
    'https://example.com/videos/hiit-workout.mp4',
    'https://example.com/thumbnails/hiit-workout.jpg',
    1215, -- 20:15 in seconds
    'cardio',
    'hiit',
    ARRAY['hiit', 'full-body', 'beginner', 'no-equipment'],
    12500,
    485,
    '00000000-0000-0000-0000-000000000001', -- Sample user ID
    true
  ),
  (
    'Morning Yoga Flow for Beginners',
    'Gentle yoga sequence to start your day with mindfulness and flexibility.',
    'https://example.com/videos/morning-yoga.mp4',
    'https://example.com/thumbnails/morning-yoga.jpg',
    932, -- 15:32 in seconds
    'yoga_pilates',
    'hatha_yoga',
    ARRAY['yoga', 'morning', 'beginner', 'flexibility'],
    8900,
    312,
    '00000000-0000-0000-0000-000000000002',
    true
  ),
  (
    'Muay Thai Basic Combinations',
    'Learn fundamental Muay Thai striking combinations and defensive techniques.',
    'https://example.com/videos/muay-thai-basics.mp4',
    'https://example.com/thumbnails/muay-thai-basics.jpg',
    1548, -- 25:48 in seconds
    'combat_sports',
    'muay_thai',
    ARRAY['muay-thai', 'martial-arts', 'striking', 'technique'],
    15600,
    672,
    '00000000-0000-0000-0000-000000000003',
    true
  ),
  (
    'Zumba Dance Fitness Party',
    'High-energy dance workout mixing Latin rhythms with easy-to-follow moves.',
    'https://example.com/videos/zumba-party.mp4',
    'https://example.com/thumbnails/zumba-party.jpg',
    1812, -- 30:12 in seconds
    'dance_fitness',
    'zumba',
    ARRAY['zumba', 'dance', 'cardio', 'fun', 'latin'],
    22100,
    891,
    '00000000-0000-0000-0000-000000000004',
    true
  ),
  (
    'Rock Climbing Training: Core and Grip Strength',
    'Specific exercises to improve climbing performance focusing on core stability and grip strength.',
    'https://example.com/videos/climbing-training.mp4',
    'https://example.com/thumbnails/climbing-training.jpg',
    1125, -- 18:45 in seconds
    'outdoor_sports',
    'rock_climbing',
    ARRAY['climbing', 'core', 'grip-strength', 'training'],
    9800,
    423,
    '00000000-0000-0000-0000-000000000005',
    true
  );

-- Note: In a real application, user IDs would come from actual authenticated users
-- This is just sample data for development purposes