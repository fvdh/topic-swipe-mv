-- Clean up any existing topics and ensure proper UUIDs
-- This script ensures topics match the frontend exactly

-- First, clear existing data to avoid conflicts
DELETE FROM user_topic_preferences;
DELETE FROM topics;

-- Insert all topics with exact UUIDs from frontend
INSERT INTO topics (id, title, description, category, image_url, icon, is_active) VALUES
-- Nature & Environment
('550e8400-e29b-41d4-a716-446655440001', 'Climate change needs urgent action', 'Rising global temperatures require immediate intervention', 'nature', '/placeholder.svg?height=600&width=400&text=Climate+Change', '🌍', true),
('550e8400-e29b-41d4-a716-446655440002', 'Renewable energy can power the world', 'Solar and wind energy are sustainable solutions', 'nature', '/placeholder.svg?height=600&width=400&text=Renewable+Energy', '⚡', true),
('550e8400-e29b-41d4-a716-446655440003', 'Plant-based diets are better', 'Vegetarian diets benefit health and environment', 'nature', '/placeholder.svg?height=600&width=400&text=Plant+Based+Diet', '🌱', true),
('550e8400-e29b-41d4-a716-446655440004', 'Electric cars are the solution', 'EVs will reduce carbon emissions significantly', 'nature', '/placeholder.svg?height=600&width=400&text=Electric+Cars', '🔋', true),
('550e8400-e29b-41d4-a716-446655440005', 'Plastic should be completely banned', 'Single-use plastics harm our ecosystems', 'nature', '/placeholder.svg?height=600&width=400&text=Plastic+Ban', '🌊', true),

-- Technology & Innovation
('550e8400-e29b-41d4-a716-446655440006', 'AI will replace human jobs', 'Automation threatens traditional employment', 'technology', '/placeholder.svg?height=600&width=400&text=Artificial+Intelligence', '🤖', true),
('550e8400-e29b-41d4-a716-446655440007', 'Social media harms mental health', 'Digital platforms increase anxiety and depression', 'technology', '/placeholder.svg?height=600&width=400&text=Social+Media', '📱', true),
('550e8400-e29b-41d4-a716-446655440008', 'Cryptocurrency is the future of money', 'Digital currencies will replace traditional banking', 'technology', '/placeholder.svg?height=600&width=400&text=Cryptocurrency', '₿', true),
('550e8400-e29b-41d4-a716-446655440009', 'Space exploration should be prioritized', 'Investing in space technology drives innovation', 'technology', '/placeholder.svg?height=600&width=400&text=Space+Exploration', '🚀', true),
('550e8400-e29b-41d4-a716-446655440010', 'Privacy matters more than security', 'Personal data protection is a fundamental right', 'technology', '/placeholder.svg?height=600&width=400&text=Privacy+vs+Security', '🔒', true),

-- Lifestyle & Society
('550e8400-e29b-41d4-a716-446655440011', 'Remote work is the future', 'Working from home increases productivity', 'lifestyle', '/placeholder.svg?height=600&width=400&text=Remote+Work', '💻', true),
('550e8400-e29b-41d4-a716-446655440012', 'Working 4 days a week is ideal', 'Shorter work weeks improve work-life balance', 'lifestyle', '/placeholder.svg?height=600&width=400&text=4+Day+Work+Week', '📅', true),
('550e8400-e29b-41d4-a716-446655440013', 'Universal basic income is necessary', 'UBI provides economic security for all citizens', 'lifestyle', '/placeholder.svg?height=600&width=400&text=Universal+Basic+Income', '💰', true),
('550e8400-e29b-41d4-a716-446655440014', 'Traditional education is outdated', 'Current school systems don''t prepare students for modern challenges', 'lifestyle', '/placeholder.svg?height=600&width=400&text=Education+System', '🎓', true),
('550e8400-e29b-41d4-a716-446655440015', 'Video games improve cognitive skills', 'Gaming enhances problem-solving and reaction time', 'lifestyle', '/placeholder.svg?height=600&width=400&text=Video+Games', '🎮', true),

-- Health & Wellness
('550e8400-e29b-41d4-a716-446655440016', 'Mental health is as important as physical health', 'Psychological wellbeing deserves equal attention and resources', 'health', '/placeholder.svg?height=600&width=400&text=Mental+Health', '🧠', true),
('550e8400-e29b-41d4-a716-446655440017', 'Exercise should be mandatory in schools', 'Physical activity is essential for child development', 'health', '/placeholder.svg?height=600&width=400&text=School+Exercise', '🏃', true),
('550e8400-e29b-41d4-a716-446655440018', 'Sugar should be regulated like tobacco', 'Excessive sugar consumption causes serious health issues', 'health', '/placeholder.svg?height=600&width=400&text=Sugar+Regulation', '🍭', true),
('550e8400-e29b-41d4-a716-446655440019', 'Alternative medicine has real benefits', 'Traditional healing methods complement modern medicine', 'health', '/placeholder.svg?height=600&width=400&text=Alternative+Medicine', '🌿', true),
('550e8400-e29b-41d4-a716-446655440020', 'Sleep is more important than diet', 'Quality rest is the foundation of good health', 'health', '/placeholder.svg?height=600&width=400&text=Sleep+Health', '😴', true),

-- Conversation Starters
('550e8400-e29b-41d4-a716-446655440021', 'Pineapple belongs on pizza', 'The sweet and savory combination is perfect', 'conversation', '/placeholder.svg?height=600&width=400&text=Pineapple+Pizza', '🍕', true),
('550e8400-e29b-41d4-a716-446655440022', 'Morning people are more successful', 'Early risers have better productivity and focus', 'conversation', '/placeholder.svg?height=600&width=400&text=Morning+Person', '🌅', true),
('550e8400-e29b-41d4-a716-446655440023', 'Dogs are better pets than cats', 'Canine companions are more loyal and interactive', 'conversation', '/placeholder.svg?height=600&width=400&text=Dogs+vs+Cats', '🐕', true),
('550e8400-e29b-41d4-a716-446655440024', 'Summer is the best season', 'Warm weather brings outdoor activities and vacation vibes', 'conversation', '/placeholder.svg?height=600&width=400&text=Summer+Season', '☀️', true),
('550e8400-e29b-41d4-a716-446655440025', 'Coffee is better than tea', 'The caffeine kick and rich flavor are unmatched', 'conversation', '/placeholder.svg?height=600&width=400&text=Coffee+vs+Tea', '☕', true),
('550e8400-e29b-41d4-a716-446655440026', 'Books are better than movies', 'Reading engages imagination more than watching', 'conversation', '/placeholder.svg?height=600&width=400&text=Books+vs+Movies', '📚', true),
('550e8400-e29b-41d4-a716-446655440027', 'Traveling solo is more rewarding', 'Independent exploration leads to personal growth', 'conversation', '/placeholder.svg?height=600&width=400&text=Solo+Travel', '🎒', true),
('550e8400-e29b-41d4-a716-446655440028', 'Cooking at home beats restaurants', 'Homemade meals are healthier and more personal', 'conversation', '/placeholder.svg?height=600&width=400&text=Home+Cooking', '👨‍🍳', true),
('550e8400-e29b-41d4-a716-446655440029', 'Night owls are more creative', 'Late hours inspire artistic and innovative thinking', 'conversation', '/placeholder.svg?height=600&width=400&text=Night+Owl', '🦉', true),
('550e8400-e29b-41d4-a716-446655440030', 'Spontaneous plans are the best plans', 'Unplanned adventures create the most memorable experiences', 'conversation', '/placeholder.svg?height=600&width=400&text=Spontaneous+Adventure', '🎲', true),
('550e8400-e29b-41d4-a716-446655440031', 'Music sounds better on vinyl', 'Analog records have warmth and authenticity', 'conversation', '/placeholder.svg?height=600&width=400&text=Vinyl+Records', '🎵', true),
('550e8400-e29b-41d4-a716-446655440032', 'Texting is better than phone calls', 'Written communication is less intrusive and more thoughtful', 'conversation', '/placeholder.svg?height=600&width=400&text=Texting+vs+Calling', '💬', true),
('550e8400-e29b-41d4-a716-446655440033', 'Childhood cartoons were better', 'Classic animation had more heart and creativity', 'conversation', '/placeholder.svg?height=600&width=400&text=Classic+Cartoons', '📺', true),
('550e8400-e29b-41d4-a716-446655440034', 'Board games beat video games', 'Physical games create better social connections', 'conversation', '/placeholder.svg?height=600&width=400&text=Board+Games', '🎯', true),
('550e8400-e29b-41d4-a716-446655440035', 'Handwritten notes are more meaningful', 'Physical letters show more effort and thoughtfulness', 'conversation', '/placeholder.svg?height=600&width=400&text=Handwritten+Notes', '✍️', true);

-- Verify the insert worked
SELECT COUNT(*) as total_topics FROM topics;
SELECT category, COUNT(*) as count FROM topics GROUP BY category ORDER BY category;
