-- Clean up any existing topics and ensure proper UUIDs
-- This script ensures topics match the frontend exactly
-- Ensure we're not in a read-only transaction
BEGIN;

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
('550e8400-e29b-41d4-a716-446655440035', 'Handwritten notes are more meaningful', 'Physical letters show more effort and thoughtfulness', 'conversation', '/placeholder.svg?height=600&width=400&text=Handwritten+Notes', '✍️', true),

-- More Nature & Environment
('550e8400-e29b-41d4-a716-446655440036', 'Nuclear energy is essential for climate goals', 'Clean nuclear power is necessary to reduce emissions', 'nature', '/placeholder.svg?height=600&width=400&text=Nuclear+Energy', '⚛️', true),
('550e8400-e29b-41d4-a716-446655440037', 'Ocean cleanup should be a global priority', 'Marine pollution threatens entire ecosystems', 'nature', '/placeholder.svg?height=600&width=400&text=Ocean+Cleanup', '🌊', true),
('550e8400-e29b-41d4-a716-446655440038', 'Vertical farming will revolutionize agriculture', 'Indoor farming uses less water and land', 'nature', '/placeholder.svg?height=600&width=400&text=Vertical+Farming', '🌾', true),
('550e8400-e29b-41d4-a716-446655440039', 'Meat alternatives taste just as good', 'Plant-based proteins can replace traditional meat', 'nature', '/placeholder.svg?height=600&width=400&text=Meat+Alternatives', '🥩', true),
('550e8400-e29b-41d4-a716-446655440040', 'National parks should be expanded', 'Protected areas preserve biodiversity', 'nature', '/placeholder.svg?height=600&width=400&text=National+Parks', '🏞️', true),
('550e8400-e29b-41d4-a716-446655440041', 'Urban beekeeping helps pollinators', 'City bees support local ecosystems', 'nature', '/placeholder.svg?height=600&width=400&text=Urban+Beekeeping', '🐝', true),
('550e8400-e29b-41d4-a716-446655440042', 'Reforestation can reverse climate change', 'Planting trees captures carbon effectively', 'nature', '/placeholder.svg?height=600&width=400&text=Reforestation', '🌳', true),

-- More Technology & Innovation
('550e8400-e29b-41d4-a716-446655440043', 'Quantum computing will change everything', 'Quantum computers will solve impossible problems', 'technology', '/placeholder.svg?height=600&width=400&text=Quantum+Computing', '🔬', true),
('550e8400-e29b-41d4-a716-446655440044', 'Self-driving cars are safer than humans', 'Autonomous vehicles reduce traffic accidents', 'technology', '/placeholder.svg?height=600&width=400&text=Self+Driving+Cars', '🚗', true),
('550e8400-e29b-41d4-a716-446655440045', 'VR will replace traditional entertainment', 'Virtual reality offers immersive experiences', 'technology', '/placeholder.svg?height=600&width=400&text=Virtual+Reality', '🥽', true),
('550e8400-e29b-41d4-a716-446655440046', '5G networks are essential infrastructure', 'Fast connectivity enables innovation', 'technology', '/placeholder.svg?height=600&width=400&text=5G+Networks', '📶', true),
('550e8400-e29b-41d4-a716-446655440047', 'Robots will be household companions', 'AI assistants will help with daily tasks', 'technology', '/placeholder.svg?height=600&width=400&text=Household+Robots', '🤖', true),
('550e8400-e29b-41d4-a716-446655440048', 'Blockchain beyond cryptocurrency matters', 'Distributed ledgers have many applications', 'technology', '/placeholder.svg?height=600&width=400&text=Blockchain', '⛓️', true),
('550e8400-e29b-41d4-a716-446655440049', 'Gene editing will cure diseases', 'CRISPR technology offers medical breakthroughs', 'technology', '/placeholder.svg?height=600&width=400&text=Gene+Editing', '🧬', true),
('550e8400-e29b-41d4-a716-446655440050', '3D printing will revolutionize manufacturing', 'Additive manufacturing enables customization', 'technology', '/placeholder.svg?height=600&width=400&text=3D+Printing', '🖨️', true),

-- More Lifestyle & Society
('550e8400-e29b-41d4-a716-446655440051', 'Minimalism leads to happiness', 'Owning less creates more freedom', 'lifestyle', '/placeholder.svg?height=600&width=400&text=Minimalism', '✨', true),
('550e8400-e29b-41d4-a716-446655440052', 'Tiny houses are the future of living', 'Small homes reduce environmental impact', 'lifestyle', '/placeholder.svg?height=600&width=400&text=Tiny+Houses', '🏠', true),
('550e8400-e29b-41d4-a716-446655440053', 'Public transportation beats private cars', 'Mass transit is more efficient and sustainable', 'lifestyle', '/placeholder.svg?height=600&width=400&text=Public+Transport', '🚇', true),
('550e8400-e29b-41d4-a716-446655440054', 'Digital nomadism is overrated', 'Constant travel lacks stability and community', 'lifestyle', '/placeholder.svg?height=600&width=400&text=Digital+Nomad', '💻', true),
('550e8400-e29b-41d4-a716-446655440055', 'Fashion should prioritize sustainability', 'Fast fashion harms workers and environment', 'lifestyle', '/placeholder.svg?height=600&width=400&text=Sustainable+Fashion', '👗', true),
('550e8400-e29b-41d4-a716-446655440056', 'Urban gardens improve communities', 'Community gardens build social connections', 'lifestyle', '/placeholder.svg?height=600&width=400&text=Urban+Gardens', '🌻', true),
('550e8400-e29b-41d4-a716-446655440057', 'Subscription services are wasteful', 'Too many subscriptions create unnecessary spending', 'lifestyle', '/placeholder.svg?height=600&width=400&text=Subscriptions', '💳', true),

-- More Health & Wellness
('550e8400-e29b-41d4-a716-446655440058', 'Cold showers boost immunity', 'Regular cold exposure strengthens the body', 'health', '/placeholder.svg?height=600&width=400&text=Cold+Showers', '🚿', true),
('550e8400-e29b-41d4-a716-446655440059', 'Meditation should be taught in schools', 'Mindfulness improves focus and emotional regulation', 'health', '/placeholder.svg?height=600&width=400&text=School+Meditation', '🧘', true),
('550e8400-e29b-41d4-a716-446655440060', 'Intermittent fasting is beneficial', 'Time-restricted eating improves metabolism', 'health', '/placeholder.svg?height=600&width=400&text=Intermittent+Fasting', '⏰', true),
('550e8400-e29b-41d4-a716-446655440061', 'Vitamin supplements are unnecessary', 'Whole foods provide better nutrition', 'health', '/placeholder.svg?height=600&width=400&text=Vitamin+Supplements', '💊', true),
('550e8400-e29b-41d4-a716-446655440062', 'Walking is the best exercise', 'Simple walking provides excellent health benefits', 'health', '/placeholder.svg?height=600&width=400&text=Walking+Exercise', '🚶', true),
('550e8400-e29b-41d4-a716-446655440063', 'Therapy should be normalized', 'Mental health support should be routine care', 'health', '/placeholder.svg?height=600&width=400&text=Therapy+Normal', '💭', true),
('550e8400-e29b-41d4-a716-446655440064', 'Dental health affects overall health', 'Oral hygiene impacts whole-body wellness', 'health', '/placeholder.svg?height=600&width=400&text=Dental+Health', '🦷', true),

-- Food & Culinary
('550e8400-e29b-41d4-a716-446655440065', 'Spicy food improves health', 'Hot peppers boost metabolism and immunity', 'food', '/placeholder.svg?height=600&width=400&text=Spicy+Food', '🌶️', true),
('550e8400-e29b-41d4-a716-446655440066', 'Fermented foods are superfoods', 'Pickled vegetables support gut health', 'food', '/placeholder.svg?height=600&width=400&text=Fermented+Foods', '🥒', true),
('550e8400-e29b-41d4-a716-446655440067', 'Food trucks serve better food than restaurants', 'Street food offers authentic flavors', 'food', '/placeholder.svg?height=600&width=400&text=Food+Trucks', '🚚', true),
('550e8400-e29b-41d4-a716-446655440068', 'Cooking with cast iron is superior', 'Iron cookware improves food taste and nutrition', 'food', '/placeholder.svg?height=600&width=400&text=Cast+Iron', '🍳', true),
('550e8400-e29b-41d4-a716-446655440069', 'Local farmers markets are essential', 'Direct-from-farm produce supports communities', 'food', '/placeholder.svg?height=600&width=400&text=Farmers+Market', '🥕', true),
('550e8400-e29b-41d4-a716-446655440070', 'Meal prep saves time and money', 'Planning meals ahead reduces waste', 'food', '/placeholder.svg?height=600&width=400&text=Meal+Prep', '📦', true),
('550e8400-e29b-41d4-a716-446655440071', 'Sourdough bread is worth the effort', 'Naturally fermented bread tastes better', 'food', '/placeholder.svg?height=600&width=400&text=Sourdough+Bread', '🍞', true),
('550e8400-e29b-41d4-a716-446655440072', 'Organic food is worth the cost', 'Pesticide-free produce is healthier', 'food', '/placeholder.svg?height=600&width=400&text=Organic+Food', '🥬', true),

-- Entertainment & Arts
('550e8400-e29b-41d4-a716-446655440073', 'Live music beats recorded music', 'Concert experiences are irreplaceable', 'entertainment', '/placeholder.svg?height=600&width=400&text=Live+Music', '🎤', true),
('550e8400-e29b-41d4-a716-446655440074', 'Indie films are better than blockbusters', 'Independent cinema offers more creativity', 'entertainment', '/placeholder.svg?height=600&width=400&text=Indie+Films', '🎬', true),
('550e8400-e29b-41d4-a716-446655440075', 'Podcasts are the new radio', 'On-demand audio content is more engaging', 'entertainment', '/placeholder.svg?height=600&width=400&text=Podcasts', '🎧', true),
('550e8400-e29b-41d4-a716-446655440076', 'Theater should be more accessible', 'Live performances need broader audiences', 'entertainment', '/placeholder.svg?height=600&width=400&text=Theater+Access', '🎭', true),
('550e8400-e29b-41d4-a716-446655440077', 'Museums should be free for everyone', 'Art and culture should be publicly accessible', 'entertainment', '/placeholder.svg?height=600&width=400&text=Free+Museums', '🏛️', true),
('550e8400-e29b-41d4-a716-446655440078', 'Stand-up comedy is therapeutic', 'Laughter provides mental health benefits', 'entertainment', '/placeholder.svg?height=600&width=400&text=Stand+Up+Comedy', '😂', true),
('550e8400-e29b-41d4-a716-446655440079', 'Art therapy should be mainstream', 'Creative expression helps heal trauma', 'entertainment', '/placeholder.svg?height=600&width=400&text=Art+Therapy', '🎨', true),
('550e8400-e29b-41d4-a716-446655440080', 'Street art is legitimate art', 'Graffiti and murals deserve recognition', 'entertainment', '/placeholder.svg?height=600&width=400&text=Street+Art', '🎨', true),

-- Politics & Society
('550e8400-e29b-41d4-a716-446655440081', 'Voting should be mandatory', 'Civic participation strengthens democracy', 'politics', '/placeholder.svg?height=600&width=400&text=Mandatory+Voting', '🗳️', true),
('550e8400-e29b-41d4-a716-446655440082', 'Term limits improve government', 'Fresh perspectives prevent stagnation', 'politics', '/placeholder.svg?height=600&width=400&text=Term+Limits', '⏳', true),
('550e8400-e29b-41d4-a716-446655440083', 'Local politics matter more than national', 'Community decisions affect daily life', 'politics', '/placeholder.svg?height=600&width=400&text=Local+Politics', '🏘️', true),
('550e8400-e29b-41d4-a716-446655440084', 'News media should be publicly funded', 'Independent journalism serves democracy', 'politics', '/placeholder.svg?height=600&width=400&text=Public+Media', '📰', true),
('550e8400-e29b-41d4-a716-446655440085', 'Wealth inequality threatens society', 'Income gaps undermine social stability', 'politics', '/placeholder.svg?height=600&width=400&text=Wealth+Inequality', '⚖️', true),
('550e8400-e29b-41d4-a716-446655440086', 'Immigration strengthens countries', 'Diverse populations drive innovation', 'politics', '/placeholder.svg?height=600&width=400&text=Immigration', '🌍', true),

-- Travel & Adventure
('550e8400-e29b-41d4-a716-446655440087', 'Backpacking builds character', 'Budget travel teaches resourcefulness', 'travel', '/placeholder.svg?height=600&width=400&text=Backpacking', '🎒', true),
('550e8400-e29b-41d4-a716-446655440088', 'Local experiences beat tourist attractions', 'Authentic culture is more rewarding', 'travel', '/placeholder.svg?height=600&width=400&text=Local+Experiences', '🗺️', true),
('550e8400-e29b-41d4-a716-446655440089', 'Slow travel is more meaningful', 'Staying longer creates deeper connections', 'travel', '/placeholder.svg?height=600&width=400&text=Slow+Travel', '🐌', true),
('550e8400-e29b-41d4-a716-446655440090', 'Adventure sports are worth the risk', 'Extreme activities provide life lessons', 'travel', '/placeholder.svg?height=600&width=400&text=Adventure+Sports', '🏔️', true),
('550e8400-e29b-41d4-a716-446655440091', 'Camping is better than hotels', 'Outdoor sleeping connects you with nature', 'travel', '/placeholder.svg?height=600&width=400&text=Camping', '⛺', true),
('550e8400-e29b-41d4-a716-446655440092', 'Group travel is more fun than solo', 'Shared experiences create lasting memories', 'travel', '/placeholder.svg?height=600&width=400&text=Group+Travel', '👥', true),
('550e8400-e29b-41d4-a716-446655440093', 'Road trips beat flying', 'Driving allows spontaneous discoveries', 'travel', '/placeholder.svg?height=600&width=400&text=Road+Trips', '🚗', true),

-- Science & Philosophy
('550e8400-e29b-41d4-a716-446655440094', 'We are not alone in the universe', 'Statistical probability suggests alien life exists', 'science', '/placeholder.svg?height=600&width=400&text=Alien+Life', '👽', true),
('550e8400-e29b-41d4-a716-446655440095', 'Time travel will be possible', 'Physics suggests temporal manipulation is feasible', 'science', '/placeholder.svg?height=600&width=400&text=Time+Travel', '⏰', true),
('550e8400-e29b-41d4-a716-446655440096', 'Free will is an illusion', 'Our choices are determined by prior causes', 'science', '/placeholder.svg?height=600&width=400&text=Free+Will', '🎭', true),
('550e8400-e29b-41d4-a716-446655440097', 'Consciousness can be uploaded', 'Digital minds will achieve immortality', 'science', '/placeholder.svg?height=600&width=400&text=Digital+Consciousness', '🧠', true),
('550e8400-e29b-41d4-a716-446655440098', 'Mathematics is discovered not invented', 'Mathematical truths exist independently', 'science', '/placeholder.svg?height=600&width=400&text=Mathematics', '🔢', true),
('550e8400-e29b-41d4-a716-446655440099', 'Dreams have deeper meaning', 'Sleep visions reveal subconscious truths', 'science', '/placeholder.svg?height=600&width=400&text=Dream+Meaning', '💭', true),

-- Sports & Fitness
('550e8400-e29b-41d4-a716-446655440100', 'Team sports build better character', 'Collaboration teaches valuable life skills', 'sports', '/placeholder.svg?height=600&width=400&text=Team+Sports', '⚽', true),
('550e8400-e29b-41d4-a716-446655440101', 'Swimming is the perfect exercise', 'Full-body workout with low injury risk', 'sports', '/placeholder.svg?height=600&width=400&text=Swimming', '🏊', true),
('550e8400-e29b-41d4-a716-446655440102', 'Yoga improves everything', 'Mind-body practice enhances all aspects of life', 'sports', '/placeholder.svg?height=600&width=400&text=Yoga', '🧘‍♀️', true),
('550e8400-e29b-41d4-a716-446655440103', 'Professional athletes are overpaid', 'Sports salaries are disproportionate to value', 'sports', '/placeholder.svg?height=600&width=400&text=Athlete+Salaries', '💰', true),
('550e8400-e29b-41d4-a716-446655440104', 'Esports are real sports', 'Competitive gaming requires skill and training', 'sports', '/placeholder.svg?height=600&width=400&text=Esports', '🎮', true),
('550e8400-e29b-41d4-a716-446655440105', 'Running barefoot is better', 'Natural foot movement prevents injuries', 'sports', '/placeholder.svg?height=600&width=400&text=Barefoot+Running', '🦶', true),

-- More Conversation Starters
('550e8400-e29b-41d4-a716-446655440106', 'Cereal is acceptable for dinner', 'Simple meals can be satisfying any time', 'conversation', '/placeholder.svg?height=600&width=400&text=Cereal+Dinner', '🥣', true),
('550e8400-e29b-41d4-a716-446655440107', 'Socks with sandals are practical', 'Comfort should override fashion rules', 'conversation', '/placeholder.svg?height=600&width=400&text=Socks+Sandals', '🧦', true),
('550e8400-e29b-41d4-a716-446655440108', 'Puns are the highest form of humor', 'Wordplay demonstrates linguistic creativity', 'conversation', '/placeholder.svg?height=600&width=400&text=Puns', '😄', true),
('550e8400-e29b-41d4-a716-446655440109', 'Pluto should still be a planet', 'Size shouldn''t determine planetary status', 'conversation', '/placeholder.svg?height=600&width=400&text=Pluto+Planet', '🪐', true),
('550e8400-e29b-41d4-a716-446655440110', 'Toilet paper should hang over', 'The correct orientation is front-facing', 'conversation', '/placeholder.svg?height=600&width=400&text=Toilet+Paper', '🧻', true),
('550e8400-e29b-41d4-a716-446655440111', 'Left-handed people are more creative', 'Right-brain dominance enhances imagination', 'conversation', '/placeholder.svg?height=600&width=400&text=Left+Handed', '✋', true),
('550e8400-e29b-41d4-a716-446655440112', 'Odd numbers are more interesting', 'Even numbers lack mathematical personality', 'conversation', '/placeholder.svg?height=600&width=400&text=Odd+Numbers', '1️⃣', true),
('550e8400-e29b-41d4-a716-446655440113', 'Crunchy peanut butter is superior', 'Texture adds to the eating experience', 'conversation', '/placeholder.svg?height=600&width=400&text=Crunchy+Peanut+Butter', '🥜', true),
('550e8400-e29b-41d4-a716-446655440114', 'Winter holidays are too commercialized', 'Authentic celebration gets lost in marketing', 'conversation', '/placeholder.svg?height=600&width=400&text=Holiday+Commercial', '🎄', true),
('550e8400-e29b-41d4-a716-446655440115', 'Parallel parking should be optional', 'Modern cars should eliminate this requirement', 'conversation', '/placeholder.svg?height=600&width=400&text=Parallel+Parking', '🚗', true);

-- Commit the transaction
COMMIT;

-- Verify the insert worked
SELECT COUNT(*) as total_topics FROM topics;
SELECT category, COUNT(*) as count FROM topics GROUP BY category ORDER BY category;
