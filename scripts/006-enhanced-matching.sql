-- Add new columns to user_profiles for enhanced matching
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS max_distance_preference INTEGER DEFAULT 50;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS share_location BOOLEAN DEFAULT true;

-- Add category breakdown to compatibility_scores
ALTER TABLE compatibility_scores ADD COLUMN IF NOT EXISTS category_breakdown JSONB DEFAULT '{}';

-- Enhanced compatibility calculation function that considers all categories
CREATE OR REPLACE FUNCTION recalculate_user_compatibility_enhanced(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    other_user RECORD;
    user_likes UUID[];
    user_dislikes UUID[];
    other_likes UUID[];
    other_dislikes UUID[];
    both_liked INTEGER;
    both_disliked INTEGER;
    conflicts INTEGER;
    total_shared INTEGER;
    score INTEGER;
    user_lat DECIMAL;
    user_lon DECIMAL;
    other_lat DECIMAL;
    other_lon DECIMAL;
    distance_km DECIMAL;
    category_breakdown JSONB;
    user_max_distance INTEGER;
    other_max_distance INTEGER;
BEGIN
    -- Get user's location and preferences
    SELECT latitude, longitude, max_distance_preference INTO user_lat, user_lon, user_max_distance
    FROM user_profiles
    WHERE user_id = p_user_id;

    -- Get user's topic preferences (ALL categories)
    SELECT ARRAY_AGG(topic_id) INTO user_likes
    FROM user_topic_preferences
    WHERE user_id = p_user_id AND preference = 'like';
    
    SELECT ARRAY_AGG(topic_id) INTO user_dislikes
    FROM user_topic_preferences
    WHERE user_id = p_user_id AND preference = 'dislike';
    
    -- Handle null arrays
    user_likes := COALESCE(user_likes, ARRAY[]::UUID[]);
    user_dislikes := COALESCE(user_dislikes, ARRAY[]::UUID[]);
    user_max_distance := COALESCE(user_max_distance, 50);
    
    -- Loop through other users who have preferences
    FOR other_user IN 
        SELECT DISTINCT utp.user_id
        FROM user_topic_preferences utp
        JOIN user_profiles up ON up.user_id = utp.user_id
        WHERE utp.user_id != p_user_id
        AND up.is_active = true
    LOOP
        -- Get other user's preferences and location settings
        SELECT ARRAY_AGG(topic_id) INTO other_likes
        FROM user_topic_preferences
        WHERE user_id = other_user.user_id AND preference = 'like';
        
        SELECT ARRAY_AGG(topic_id) INTO other_dislikes
        FROM user_topic_preferences
        WHERE user_id = other_user.user_id AND preference = 'dislike';
        
        SELECT latitude, longitude, max_distance_preference 
        INTO other_lat, other_lon, other_max_distance
        FROM user_profiles
        WHERE user_id = other_user.user_id;
        
        -- Handle null arrays and defaults
        other_likes := COALESCE(other_likes, ARRAY[]::UUID[]);
        other_dislikes := COALESCE(other_dislikes, ARRAY[]::UUID[]);
        other_max_distance := COALESCE(other_max_distance, 50);
        
        -- Calculate distance and check if users are within each other's preferred range
        distance_km := NULL;
        IF user_lat IS NOT NULL AND user_lon IS NOT NULL AND 
           other_lat IS NOT NULL AND other_lon IS NOT NULL THEN
            
            -- Handle "infinite" location users (999999 coordinates)
            IF user_lat = 999999 OR other_lat = 999999 THEN
                -- One or both users don't share location
                -- Only match if both have infinite distance preference
                IF user_max_distance >= 999999 AND other_max_distance >= 999999 THEN
                    distance_km := 999999; -- Special value for infinite distance
                ELSE
                    CONTINUE; -- Skip this user - distance preferences don't allow matching
                END IF;
            ELSE
                -- Both users share location, calculate actual distance
                distance_km := calculate_distance(user_lat, user_lon, other_lat, other_lon);
                
                -- Check if within both users' distance preferences
                IF distance_km > user_max_distance OR distance_km > other_max_distance THEN
                    CONTINUE; -- Skip this user - outside distance preference
                END IF;
            END IF;
        ELSE
            -- Handle cases where location data is missing
            CONTINUE;
        END IF;
        
        -- Calculate matches and conflicts using array operations
        SELECT COUNT(*) INTO both_liked
        FROM unnest(user_likes) AS ul(topic_id)
        WHERE ul.topic_id = ANY(other_likes);
        
        SELECT COUNT(*) INTO both_disliked
        FROM unnest(user_dislikes) AS ud(topic_id)
        WHERE ud.topic_id = ANY(other_dislikes);
        
        SELECT COUNT(*) INTO conflicts
        FROM (
            SELECT topic_id FROM unnest(user_likes) AS ul(topic_id)
            WHERE ul.topic_id = ANY(other_dislikes)
            UNION ALL
            SELECT topic_id FROM unnest(user_dislikes) AS ud(topic_id)
            WHERE ud.topic_id = ANY(other_likes)
        ) AS conflict_topics;
        
        total_shared := both_liked + both_disliked + conflicts;
        
        -- Calculate category breakdown and enhanced compatibility score
        SELECT calculate_enhanced_compatibility_score(
            p_user_id, 
            other_user.user_id, 
            both_liked, 
            both_disliked, 
            conflicts, 
            total_shared
        ) INTO score, category_breakdown;
        
        -- Insert or update compatibility score with category breakdown
        INSERT INTO compatibility_scores (
            user1_id, user2_id, score, shared_topics, matched_topics, 
            conflicting_topics, distance_km, category_breakdown
        )
        VALUES (
            p_user_id, other_user.user_id, score, total_shared, 
            both_liked + both_disliked, conflicts, distance_km, category_breakdown
        )
        ON CONFLICT (user1_id, user2_id) 
        DO UPDATE SET
            score = EXCLUDED.score,
            shared_topics = EXCLUDED.shared_topics,
            matched_topics = EXCLUDED.matched_topics,
            conflicting_topics = EXCLUDED.conflicting_topics,
            distance_km = EXCLUDED.distance_km,
            category_breakdown = EXCLUDED.category_breakdown,
            calculated_at = NOW();
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate enhanced compatibility score with category weighting
CREATE OR REPLACE FUNCTION calculate_enhanced_compatibility_score(
    p_user1_id UUID,
    p_user2_id UUID,
    p_both_liked INTEGER,
    p_both_disliked INTEGER,
    p_conflicts INTEGER,
    p_total_shared INTEGER
) RETURNS TABLE(score INTEGER, category_breakdown JSONB) AS $$
DECLARE
    base_score DECIMAL := 0;
    category_bonus DECIMAL := 0;
    final_score INTEGER := 0;
    breakdown JSONB := '{}';
    category_record RECORD;
    category_weight DECIMAL;
BEGIN
    -- Base compatibility score
    IF p_total_shared > 0 THEN
        base_score := ((p_both_liked + p_both_disliked) * 100.0 / p_total_shared);
        base_score := base_score + (p_both_liked * 3); -- Bonus for mutual likes
        base_score := base_score + LEAST(p_total_shared * 2, 20); -- Shared topics bonus
    END IF;
    
    -- Calculate category-specific bonuses
    FOR category_record IN
        SELECT 
            t.category,
            COUNT(*) as matches
        FROM user_topic_preferences utp1
        JOIN user_topic_preferences utp2 ON utp1.topic_id = utp2.topic_id
        JOIN topics t ON t.id = utp1.topic_id
        WHERE utp1.user_id = p_user1_id 
        AND utp2.user_id = p_user2_id
        AND (
            (utp1.preference = 'like' AND utp2.preference = 'like') OR
            (utp1.preference = 'dislike' AND utp2.preference = 'dislike')
        )
        GROUP BY t.category
    LOOP
        -- Category weights
        category_weight := CASE category_record.category
            WHEN 'conversation' THEN 1.5
            WHEN 'lifestyle' THEN 1.2
            WHEN 'health' THEN 1.1
            WHEN 'technology' THEN 1.0
            WHEN 'nature' THEN 1.0
            ELSE 1.0
        END;
        
        category_bonus := category_bonus + (category_record.matches * category_weight * 2);
        
        -- Build category breakdown
        breakdown := jsonb_set(
            breakdown, 
            ARRAY[category_record.category], 
            to_jsonb(category_record.matches)
        );
    END LOOP;
    
    -- Diversity bonus for multiple categories
    IF jsonb_object_keys(breakdown) IS NOT NULL THEN
        IF array_length(ARRAY(SELECT jsonb_object_keys(breakdown)), 1) >= 3 THEN
            category_bonus := category_bonus + 10;
        ELSIF array_length(ARRAY(SELECT jsonb_object_keys(breakdown)), 1) >= 2 THEN
            category_bonus := category_bonus + 5;
        END IF;
    END IF;
    
    -- Cap category bonus and calculate final score
    category_bonus := LEAST(category_bonus, 25);
    final_score := LEAST(ROUND(base_score + category_bonus), 100);
    
    RETURN QUERY SELECT final_score, breakdown;
END;
$$ LANGUAGE plpgsql;

-- Enhanced function to find compatible users with all categories and location preferences
CREATE OR REPLACE FUNCTION find_compatible_users_enhanced(
    p_user_id UUID,
    p_max_distance_km DECIMAL DEFAULT 50,
    p_min_compatibility INTEGER DEFAULT 40,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    user_id UUID,
    profile JSONB,
    compatibility_score INTEGER,
    shared_topics INTEGER,
    matched_topics INTEGER,
    conflicting_topics INTEGER,
    category_breakdown JSONB,
    matched_topic_details JSONB
) AS $$
DECLARE
    user_lat DECIMAL;
    user_lon DECIMAL;
    user_max_distance INTEGER;
    user_share_location BOOLEAN;
BEGIN
    -- Get user's location and preferences
    SELECT latitude, longitude, max_distance_preference, share_location 
    INTO user_lat, user_lon, user_max_distance, user_share_location
    FROM user_profiles
    WHERE user_profiles.user_id = p_user_id;
    
    -- Use user's preferred max distance if available
    p_max_distance_km := COALESCE(user_max_distance, p_max_distance_km);

    RETURN QUERY
    WITH nearby_users AS (
        SELECT 
            up.user_id,
            up.name,
            up.age,
            up.bio,
            up.profile_image_url,
            up.city,
            up.max_distance_preference,
            up.share_location,
            CASE 
                -- Handle infinite location users
                WHEN (up.latitude = 999999 OR user_lat = 999999) THEN
                    CASE 
                        WHEN p_max_distance_km >= 999999 AND up.max_distance_preference >= 999999 THEN 999999
                        ELSE NULL -- Exclude if distance preferences don't allow infinite matching
                    END
                -- Both users share location
                WHEN up.latitude IS NOT NULL AND up.longitude IS NOT NULL 
                     AND user_lat IS NOT NULL AND user_lon IS NOT NULL
                     AND up.latitude != 999999 AND user_lat != 999999
                THEN calculate_distance(user_lat, user_lon, up.latitude, up.longitude)
                ELSE NULL
            END as distance_km
        FROM user_profiles up
        WHERE up.user_id != p_user_id
        AND up.is_active = true
    ),
    filtered_users AS (
        SELECT *
        FROM nearby_users nu
        WHERE nu.distance_km IS NOT NULL
        AND (
            nu.distance_km = 999999 OR -- Infinite distance users
            (nu.distance_km <= p_max_distance_km AND nu.distance_km <= nu.max_distance_preference)
        )
    ),
    compatibility_data AS (
        SELECT 
            fu.user_id,
            fu.name,
            fu.age,
            fu.bio,
            fu.profile_image_url,
            fu.city,
            CASE WHEN fu.distance_km = 999999 THEN NULL ELSE fu.distance_km END as distance_km,
            COALESCE(cs.score, 0) as compatibility_score,
            COALESCE(cs.shared_topics, 0) as shared_topics,
            COALESCE(cs.matched_topics, 0) as matched_topics,
            COALESCE(cs.conflicting_topics, 0) as conflicting_topics,
            COALESCE(cs.category_breakdown, '{}') as category_breakdown
        FROM filtered_users fu
        LEFT JOIN compatibility_scores cs ON (
            (cs.user1_id = p_user_id AND cs.user2_id = fu.user_id) OR
            (cs.user1_id = fu.user_id AND cs.user2_id = p_user_id)
        )
        WHERE COALESCE(cs.score, 0) >= p_min_compatibility
    )
    SELECT 
        cd.user_id,
        jsonb_build_object(
            'name', cd.name,
            'age', cd.age,
            'bio', cd.bio,
            'profile_image_url', cd.profile_image_url,
            'city', cd.city,
            'distance_km', cd.distance_km
        ) as profile,
        cd.compatibility_score,
        cd.shared_topics,
        cd.matched_topics,
        cd.conflicting_topics,
        cd.category_breakdown,
        '[]'::jsonb as matched_topic_details -- Can be enhanced later
    FROM compatibility_data cd
    ORDER BY cd.compatibility_score DESC, COALESCE(cd.distance_km, 999999) ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_user_profiles_distance_pref ON user_profiles (max_distance_preference);
CREATE INDEX IF NOT EXISTS idx_user_profiles_share_location ON user_profiles (share_location);
CREATE INDEX IF NOT EXISTS idx_compatibility_scores_category ON compatibility_scores USING GIN (category_breakdown);
