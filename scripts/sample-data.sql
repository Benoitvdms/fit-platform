-- Sample data for Formly
-- Run this after setting up database and storage

-- Sample users (these will be created automatically when users sign up)
-- The user profiles will be created by the trigger when auth.users are created

-- Sample videos (placeholder video URLs - replace with real content)
INSERT INTO public.videos (
  title, description, video_url, duration, main_category, sub_category, 
  tags, user_id, views, likes_count, thumbnail_url
) VALUES 
-- Strength Training Videos
('Perfect Squat Form Tutorial', 'Learn the fundamentals of proper squat technique with step-by-step guidance. Avoid common mistakes and maximize your gains.', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 180, 'strength_training', 'powerlifting', ARRAY['squat', 'form', 'tutorial', 'beginner'], '00000000-0000-0000-0000-000000000001', 1250, 89, 'https://via.placeholder.com/640x360/1f2937/ffffff?text=Squat+Tutorial'),

('Deadlift Progression for Beginners', 'Master the deadlift with this comprehensive progression guide. From basic movement patterns to advanced techniques.', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4', 420, 'strength_training', 'powerlifting', ARRAY['deadlift', 'beginner', 'progression', 'safety'], '00000000-0000-0000-0000-000000000002', 980, 156, 'https://via.placeholder.com/640x360/374151/ffffff?text=Deadlift+Guide'),

('Advanced Bench Press Techniques', 'Take your bench press to the next level with advanced programming and technique refinements.', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4', 310, 'strength_training', 'powerlifting', ARRAY['bench press', 'advanced', 'technique'], '00000000-0000-0000-0000-000000000001', 756, 203, 'https://via.placeholder.com/640x360/4b5563/ffffff?text=Bench+Press'),

-- Cardio Videos
('HIIT Workout for Fat Loss', 'High-intensity interval training designed to maximize fat burning in just 20 minutes.', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 1200, 'cardio', 'hiit', ARRAY['hiit', 'fat loss', 'cardio', 'bodyweight'], '00000000-0000-0000-0000-000000000003', 2340, 312, 'https://via.placeholder.com/640x360/dc2626/ffffff?text=HIIT+Workout'),

('Running Form Analysis', 'Improve your running efficiency and reduce injury risk with proper form techniques.', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4', 480, 'cardio', 'running', ARRAY['running', 'form', 'efficiency', 'injury prevention'], '00000000-0000-0000-0000-000000000004', 1180, 94, 'https://via.placeholder.com/640x360/ea580c/ffffff?text=Running+Form'),

-- Yoga Videos
('Morning Vinyasa Flow', 'Energizing 30-minute vinyasa sequence perfect for starting your day with mindfulness and movement.', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4', 1800, 'yoga_pilates', 'vinyasa_yoga', ARRAY['yoga', 'morning', 'vinyasa', 'flow'], '00000000-0000-0000-0000-000000000005', 1890, 267, 'https://via.placeholder.com/640x360/059669/ffffff?text=Yoga+Flow'),

('Restorative Yoga for Recovery', 'Gentle restorative poses designed to help your body and mind recover from intense training.', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 2700, 'yoga_pilates', 'yin_yoga', ARRAY['yoga', 'restorative', 'recovery', 'relaxation'], '00000000-0000-0000-0000-000000000005', 1456, 189, 'https://via.placeholder.com/640x360/10b981/ffffff?text=Restorative+Yoga'),

-- Combat Sports Videos  
('Boxing Fundamentals', 'Learn the basic punches, footwork, and defensive techniques that form the foundation of boxing.', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4', 900, 'combat_sports', 'boxing', ARRAY['boxing', 'fundamentals', 'punches', 'footwork'], '00000000-0000-0000-0000-000000000006', 1670, 278, 'https://via.placeholder.com/640x360/7c3aed/ffffff?text=Boxing+Basics'),

('Muay Thai Clinch Work', 'Advanced clinch techniques and knee strikes for intermediate Muay Thai practitioners.', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4', 720, 'combat_sports', 'muay_thai', ARRAY['muay thai', 'clinch', 'knees', 'intermediate'], '00000000-0000-0000-0000-000000000006', 890, 134, 'https://via.placeholder.com/640x360/8b5cf6/ffffff?text=Muay+Thai'),

-- Dance Fitness Videos
('Hip Hop Dance Cardio', 'Fun and energetic hip hop choreography that doubles as an amazing cardio workout.', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 1500, 'dance_fitness', 'hip_hop', ARRAY['dance', 'hip hop', 'cardio', 'choreography'], '00000000-0000-0000-0000-000000000007', 3200, 445, 'https://via.placeholder.com/640x360/ec4899/ffffff?text=Hip+Hop+Dance'),

('Zumba Beginner Routine', 'Easy-to-follow Zumba routine perfect for beginners looking to have fun while getting fit.', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4', 1200, 'dance_fitness', 'zumba', ARRAY['zumba', 'beginner', 'latin', 'fun'], '00000000-0000-0000-0000-000000000007', 2780, 356, 'https://via.placeholder.com/640x360/f97316/ffffff?text=Zumba+Routine');

-- Note: The user_id values above are placeholders. In a real setup, you would:
-- 1. First create actual user accounts through the auth system
-- 2. Then use their real UUIDs in the video inserts
-- 3. Or create this data through the application interface

-- Sample playlist data
INSERT INTO public.playlists (title, description, user_id, is_public) VALUES
('Strength Training Fundamentals', 'Essential exercises for building a strong foundation in strength training', '00000000-0000-0000-0000-000000000001', true),
('Morning Routine', 'Perfect workouts to start your day with energy', '00000000-0000-0000-0000-000000000005', true),
('Combat Sports Basics', 'Fundamental techniques across different martial arts', '00000000-0000-0000-0000-000000000006', true);

-- Add videos to playlists (using video IDs that would be generated)
-- This would need to be done after the videos are inserted and you have their actual IDs