-- Seed script for dummy users and preferences

-- First, ensure we have some test user profiles
-- Add unique constraint if it doesn't exist
ALTER TABLE user_profiles ADD CONSTRAINT IF NOT EXISTS unique_user_profiles_user_id UNIQUE (user_id);

INSERT INTO user_profiles (user_id, name, age, bio, city, country, latitude, longitude, max_distance_preference, share_location, last_active)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440201', 'Alex Johnson', 25, 'Love traveling and coffee!', 'Amsterdam', 'Netherlands', 52.3676, 4.9041, 50, true, NOW()),
  ('550e8400-e29b-41d4-a716-446655440202', 'Sam Wilson', 28, 'Tech enthusiast and gamer', 'Utrecht', 'Netherlands', 52.0907, 5.1214, 100, true, NOW()),
  ('550e8400-e29b-41d4-a716-446655440203', 'Jordan Taylor', 24, 'Environmentalist and yoga lover', 'The Hague', 'Netherlands', 52.0705, 4.3007, 75, true, NOW()),
  ('550e8400-e29b-41d4-a716-446655440204', 'Casey Brown', 30, 'Foodie and book lover', 'Rotterdam', 'Netherlands', 51.9244, 4.4777, 50, true, NOW()),
  ('550e8400-e29b-41d4-a716-446655440205', 'Riley Davis', 26, 'Artist and music producer', 'Eindhoven', 'Netherlands', 51.4416, 5.4697, 80, true, NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Add some topic preferences for these users
-- User 1: Alex - likes most conversation topics
INSERT INTO user_topic_preferences (user_id, topic_id, preference)
SELECT '550e8400-e29b-41d4-a716-446655440201', id, 'like'
FROM topics 
WHERE category = 'Conversation' 
AND title IN (
  'Pineapple belongs on pizza',
  'Coffee is better than tea',
  'Dogs are better pets than cats',
  'Summer is the best season',
  'Morning people are more successful'
)
ON CONFLICT (user_id, topic_id) DO NOTHING;

-- User 2: Sam - tech-focused with some conversation topics
INSERT INTO user_topic_preferences (user_id, topic_id, preference)
SELECT '550e8400-e29b-41d4-a716-446655440202', id, 'like'
FROM topics 
WHERE (category = 'Technology' AND title IN (
  'AI will replace human jobs',
  'Cryptocurrency is the future of money',
  'Space exploration should be prioritized'
)) OR (category = 'Conversation' AND title IN (
  'PC gaming beats console gaming',
  'iOS is better than Android'
))
ON CONFLICT (user_id, topic_id) DO NOTHING;

-- User 3: Jordan - environment-focused
INSERT INTO user_topic_preferences (user_id, topic_id, preference)
SELECT '550e8400-e29b-41d4-a716-446655440203', id, 'like'
FROM topics 
WHERE (category = 'Nature' AND title IN (
  'Climate change needs urgent action',
  'Plant-based diets are better',
  'Renewable energy can power the world'
)) OR (category = 'Health' AND title IN (
  'Mental health is as important as physical health',
  'Exercise should be mandatory in schools'
))
ON CONFLICT (user_id, topic_id) DO NOTHING;

-- User 4: Casey - lifestyle and conversation mix
INSERT INTO user_topic_preferences (user_id, topic_id, preference)
SELECT '550e8400-e29b-41d4-a716-446655440204', id, 'like'
FROM topics 
WHERE (category = 'Lifestyle' AND title IN (
  'Remote work is the future',
  'Working 4 days a week is ideal'
)) OR (category = 'Conversation' AND title IN (
  'Books are better than movies',
  'Cooking at home beats restaurants',
  'Coffee is better than tea'
))
ON CONFLICT (user_id, topic_id) DO NOTHING;

-- User 5: Riley - creative and mixed interests
INSERT INTO user_topic_preferences (user_id, topic_id, preference)
SELECT '550e8400-e29b-41d4-a716-446655440205', id, 'like'
FROM topics 
WHERE title IN (
  'Music sounds better on vinyl',
  'Night owls are more creative',
  'Animated movies are for all ages',
  'Streaming killed the music industry'
)
ON CONFLICT (user_id, topic_id) DO NOTHING;
