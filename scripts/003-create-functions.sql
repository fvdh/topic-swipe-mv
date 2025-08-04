-- Function to calculate distance between two points using Haversine formula
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL, lon1 DECIMAL, lat2 DECIMAL, lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    R DECIMAL := 6371; -- Earth's radius in kilometers
    dLat DECIMAL;
    dLon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    dLat := RADIANS(lat2 - lat1);
    dLon := RADIANS(lon2 - lon1);
    
    a := SIN(dLat/2) * SIN(dLat/2) + 
         COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * 
         SIN(dLon/2) * SIN(dLon/2);
    
    c := 2 * ATAN2(SQRT(a), SQRT(1-a));
    
    RETURN R * c;
END;
$$ LANGUAGE plpgsql;

-- Function to find compatible users with location filtering
CREATE OR REPLACE FUNCTION find_compatible_users(
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
    matched_topic_details JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH user_location AS (
        SELECT latitude, longitude
        FROM user_profiles
        WHERE user_profiles.user_id = p_user_id
    ),
    nearby_users AS (
        SELECT 
            up.user_id,
            up.name,
            up.age,
            up.bio,
            up.profile_image_url,
            up.city,
            CASE 
                WHEN up.latitude IS NOT NULL AND up.longitude IS NOT NULL 
                     AND ul.latitude IS NOT NULL AND ul.longitude IS NOT NULL
                THEN calculate_distance(ul.latitude, ul.longitude, up.latitude, up.longitude)
                ELSE NULL
            END as distance_km
        FROM user_profiles up
        CROSS JOIN user_location ul
        WHERE up.user_id != p_user_id
        AND up.is_active = true
        AND (
            up.latitude IS NULL OR up.longitude IS NULL OR 
            ul.latitude IS NULL OR ul.longitude IS NULL OR
            calculate_distance(ul.latitude, ul.longitude, up.latitude, up.longitude) <= p_max_distance_km
        )
    ),
    compatibility_data AS (
        SELECT 
            nu.user_id,
            nu.name,
            nu.age,
            nu.bio,
            nu.profile_image_url,
            nu.city,
            nu.distance_km,
            COALESCE(cs.score, 0) as compatibility_score,
            COALESCE(cs.shared_topics, 0) as shared_topics,
            COALESCE(cs.matched_topics, 0) as matched_topics,
            COALESCE(cs.conflicting_topics, 0) as conflicting_topics
        FROM nearby_users nu
        LEFT JOIN compatibility_scores cs ON (
            (cs.user1_id = p_user_id AND cs.user2_id = nu.user_id) OR
            (cs.user1_id = nu.user_id AND cs.user2_id = p_user_id)
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
        '[]'::jsonb as matched_topic_details -- Simplified for now
    FROM compatibility_data cd
    ORDER BY cd.compatibility_score DESC, COALESCE(cd.distance_km, 999999) ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate compatibility scores for a user
CREATE OR REPLACE FUNCTION recalculate_user_compatibility(p_user_id UUID)
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
BEGIN
    -- Get user's location
    SELECT latitude, longitude INTO user_lat, user_lon
    FROM user_profiles
    WHERE user_id = p_user_id;

    -- Get user's preferences
    SELECT ARRAY_AGG(topic_id) INTO user_likes
    FROM user_topic_preferences
    WHERE user_id = p_user_id AND preference = 'like';
    
    SELECT ARRAY_AGG(topic_id) INTO user_dislikes
    FROM user_topic_preferences
    WHERE user_id = p_user_id AND preference = 'dislike';
    
    -- Handle null arrays
    user_likes := COALESCE(user_likes, ARRAY[]::UUID[]);
    user_dislikes := COALESCE(user_dislikes, ARRAY[]::UUID[]);
    
    -- Loop through other users who have preferences
    FOR other_user IN 
        SELECT DISTINCT utp.user_id
        FROM user_topic_preferences utp
        JOIN user_profiles up ON up.user_id = utp.user_id
        WHERE utp.user_id != p_user_id
        AND up.is_active = true
    LOOP
        -- Get other user's preferences
        SELECT ARRAY_AGG(topic_id) INTO other_likes
        FROM user_topic_preferences
        WHERE user_id = other_user.user_id AND preference = 'like';
        
        SELECT ARRAY_AGG(topic_id) INTO other_dislikes
        FROM user_topic_preferences
        WHERE user_id = other_user.user_id AND preference = 'dislike';
        
        -- Handle null arrays
        other_likes := COALESCE(other_likes, ARRAY[]::UUID[]);
        other_dislikes := COALESCE(other_dislikes, ARRAY[]::UUID[]);
        
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
        
        -- Calculate compatibility score
        IF total_shared > 0 THEN
            score := ((both_liked + both_disliked) * 100 / total_shared) + 
                    (both_liked * 3) + 
                    LEAST(total_shared * 2, 20);
            score := LEAST(score, 100);
        ELSE
            score := 0;
        END IF;
        
        -- Get other user's location and calculate distance
        SELECT latitude, longitude INTO other_lat, other_lon
        FROM user_profiles
        WHERE user_id = other_user.user_id;
        
        IF user_lat IS NOT NULL AND user_lon IS NOT NULL AND 
           other_lat IS NOT NULL AND other_lon IS NOT NULL THEN
            distance_km := calculate_distance(user_lat, user_lon, other_lat, other_lon);
        ELSE
            distance_km := NULL;
        END IF;
        
        -- Insert or update compatibility score
        INSERT INTO compatibility_scores (
            user1_id, user2_id, score, shared_topics, matched_topics, 
            conflicting_topics, distance_km
        )
        VALUES (
            p_user_id, other_user.user_id, score, total_shared, 
            both_liked + both_disliked, conflicts, distance_km
        )
        ON CONFLICT (user1_id, user2_id) 
        DO UPDATE SET
            score = EXCLUDED.score,
            shared_topics = EXCLUDED.shared_topics,
            matched_topics = EXCLUDED.matched_topics,
            conflicting_topics = EXCLUDED.conflicting_topics,
            distance_km = EXCLUDED.distance_km,
            calculated_at = NOW();
    END LOOP;
END;
$$ LANGUAGE plpgsql;
