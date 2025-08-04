"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Database, Loader2, Copy, ExternalLink } from "lucide-react"
// Add the TopicSync component to the database setup

import { TopicSync } from "./topic-sync"
import { EnvironmentSetup } from "./environment-setup"

const SQL_SCRIPTS = {
  "001-create-tables": `-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    bio TEXT,
    age INTEGER,
    profile_image_url TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    city VARCHAR(100),
    country VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add location columns if they don't exist (for existing installations)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'latitude') THEN
        ALTER TABLE user_profiles ADD COLUMN latitude DECIMAL(10, 8);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'longitude') THEN
        ALTER TABLE user_profiles ADD COLUMN longitude DECIMAL(11, 8);
    END IF;
END $$;

-- Topics table (predefined conversation starters)
CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    image_url TEXT,
    icon VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User topic preferences
CREATE TABLE IF NOT EXISTS user_topic_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    preference VARCHAR(10) NOT NULL CHECK (preference IN ('like', 'dislike')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, topic_id)
);

-- Compatibility scores (cached for performance)
CREATE TABLE IF NOT EXISTS compatibility_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    shared_topics INTEGER DEFAULT 0,
    matched_topics INTEGER DEFAULT 0,
    conflicting_topics INTEGER DEFAULT 0,
    distance_km DECIMAL(10, 2),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- User matches/connections
CREATE TABLE IF NOT EXISTS user_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'rejected')),
    initiated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles (latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_topic_preferences_user_id ON user_topic_preferences (user_id);
CREATE INDEX IF NOT EXISTS idx_user_topic_preferences_topic_id ON user_topic_preferences (topic_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_scores_user1 ON compatibility_scores (user1_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_scores_user2 ON compatibility_scores (user2_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_scores_score ON compatibility_scores (score DESC);
CREATE INDEX IF NOT EXISTS idx_user_matches_user1 ON user_matches (user1_id);
CREATE INDEX IF NOT EXISTS idx_user_matches_user2 ON user_matches (user2_id);
CREATE INDEX IF NOT EXISTS idx_user_matches_status ON user_matches (status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at 
        BEFORE UPDATE ON users 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_profiles_updated_at') THEN
        CREATE TRIGGER update_user_profiles_updated_at 
        BEFORE UPDATE ON user_profiles 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_matches_updated_at') THEN
        CREATE TRIGGER update_user_matches_updated_at 
        BEFORE UPDATE ON user_matches 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;`,

  "002-seed-topics": `-- Insert conversation starter topics
INSERT INTO topics (title, description, category, image_url, icon) VALUES
-- Conversation Starters
('Pineapple belongs on pizza', 'The sweet and savory combination is perfect', 'conversation', '/placeholder.svg?height=600&width=400&text=Pineapple+Pizza', '🍕'),
('Morning people are more successful', 'Early risers have better productivity and focus', 'conversation', '/placeholder.svg?height=600&width=400&text=Morning+Person', '🌅'),
('Dogs are better pets than cats', 'Canine companions are more loyal and interactive', 'conversation', '/placeholder.svg?height=600&width=400&text=Dogs+vs+Cats', '🐕'),
('Summer is the best season', 'Warm weather brings outdoor activities and vacation vibes', 'conversation', '/placeholder.svg?height=600&width=400&text=Summer+Season', '☀️'),
('Coffee is better than tea', 'The caffeine kick and rich flavor are unmatched', 'conversation', '/placeholder.svg?height=600&width=400&text=Coffee+vs+Tea', '☕'),
('Books are better than movies', 'Reading engages imagination more than watching', 'conversation', '/placeholder.svg?height=600&width=400&text=Books+vs+Movies', '📚'),
('Traveling solo is more rewarding', 'Independent exploration leads to personal growth', 'conversation', '/placeholder.svg?height=600&width=400&text=Solo+Travel', '🎒'),
('Cooking at home beats restaurants', 'Homemade meals are healthier and more personal', 'conversation', '/placeholder.svg?height=600&width=400&text=Home+Cooking', '👨‍🍳'),
('Night owls are more creative', 'Late hours inspire artistic and innovative thinking', 'conversation', '/placeholder.svg?height=600&width=400&text=Night+Owl', '🦉'),
('Spontaneous plans are the best plans', 'Unplanned adventures create the most memorable experiences', 'conversation', '/placeholder.svg?height=600&width=400&text=Spontaneous+Adventure', '🎲'),
('Music sounds better on vinyl', 'Analog records have warmth and authenticity', 'conversation', '/placeholder.svg?height=600&width=400&text=Vinyl+Records', '🎵'),
('Texting is better than phone calls', 'Written communication is less intrusive and more thoughtful', 'conversation', '/placeholder.svg?height=600&width=400&text=Texting+vs+Calling', '💬'),
('Childhood cartoons were better', 'Classic animation had more heart and creativity', 'conversation', '/placeholder.svg?height=600&width=400&text=Classic+Cartoons', '📺'),
('Board games beat video games', 'Physical games create better social connections', 'conversation', '/placeholder.svg?height=600&width=400&text=Board+Games', '🎯'),
('Handwritten notes are more meaningful', 'Physical letters show more effort and thoughtfulness', 'conversation', '/placeholder.svg?height=600&width=400&text=Handwritten+Notes', '✍️')
ON CONFLICT DO NOTHING;`,

  "003-create-functions": `-- Function to calculate distance between two points using Haversine formula
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

-- Function to find compatible users with optional location filtering
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
DECLARE
    user_lat DECIMAL;
    user_lon DECIMAL;
BEGIN
    -- Get user's location (optional)
    SELECT latitude, longitude INTO user_lat, user_lon
    FROM user_profiles
    WHERE user_profiles.user_id = p_user_id;

    RETURN QUERY
    WITH nearby_users AS (
        SELECT 
            up.user_id,
            up.name,
            up.age,
            up.bio,
            up.profile_image_url,
            up.city,
            CASE 
                WHEN up.latitude IS NOT NULL AND up.longitude IS NOT NULL 
                     AND user_lat IS NOT NULL AND user_lon IS NOT NULL
                THEN calculate_distance(user_lat, user_lon, up.latitude, up.longitude)
                ELSE NULL
            END as distance_km
        FROM user_profiles up
        WHERE up.user_id != p_user_id
        AND up.is_active = true
        AND (
            -- Include all users if either user doesn't have location
            user_lat IS NULL OR user_lon IS NULL OR
            up.latitude IS NULL OR up.longitude IS NULL OR
            -- Or include users within distance if both have location
            calculate_distance(user_lat, user_lon, up.latitude, up.longitude) <= p_max_distance_km
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
    ),
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
        '[]'::jsonb as matched_topic_details
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
$$ LANGUAGE plpgsql;`,
}

export function DatabaseSetup() {
  const [setupStatus, setSetupStatus] = useState<"idle" | "testing" | "setup-needed" | "complete">("idle")
  const [error, setError] = useState("")
  const [copiedScript, setCopiedScript] = useState<string | null>(null)

  // Check if environment variables are missing
  const envMissing = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (envMissing) {
    return <EnvironmentSetup />
  }

  const testConnection = async () => {
    setSetupStatus("testing")
    setError("")

    try {
      const response = await fetch("/api/test-db")
      const data = await response.json()

      if (response.ok) {
        setSetupStatus("complete")
      } else {
        setSetupStatus("setup-needed")
        setError(data.details || "Database tables not found")
      }
    } catch (error: any) {
      setSetupStatus("setup-needed")
      setError(error.message || "Connection failed")
    }
  }

  const copyToClipboard = async (scriptName: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedScript(scriptName)
      setTimeout(() => setCopiedScript(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const getStatusColor = () => {
    switch (setupStatus) {
      case "complete":
        return "text-green-600"
      case "setup-needed":
        return "text-red-600"
      case "testing":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = () => {
    switch (setupStatus) {
      case "complete":
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case "setup-needed":
        return <AlertCircle className="w-6 h-6 text-red-600" />
      case "testing":
        return <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      default:
        return <Database className="w-6 h-6 text-gray-600" />
    }
  }

  const scripts = Object.entries(SQL_SCRIPTS)

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <CardTitle>Database Setup</CardTitle>
            <CardDescription>Configure your Supabase database for Topic Swipe</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className={`text-center p-4 rounded-lg ${setupStatus === "complete" ? "bg-green-50" : "bg-gray-50"}`}>
          <p className={`font-medium ${getStatusColor()}`}>
            {setupStatus === "idle" && "Click 'Test Connection' to check your database"}
            {setupStatus === "testing" && "Testing database connection..."}
            {setupStatus === "setup-needed" && "Database setup required"}
            {setupStatus === "complete" && "Database is ready!"}
          </p>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>

        {setupStatus === "setup-needed" && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Setup Instructions</h3>
              <ol className="text-sm text-blue-700 list-decimal list-inside space-y-2">
                <li>
                  Open your{" "}
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-900 inline-flex items-center gap-1"
                  >
                    Supabase Dashboard <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>Navigate to the SQL Editor</li>
                <li>Copy and run each script below in order</li>
                <li>Come back and test the connection</li>
              </ol>
            </div>

            <div className="space-y-4">
              {scripts.map(([scriptName, content], index) => (
                <div key={scriptName} className="border rounded-lg">
                  <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                        Step {index + 1}
                      </span>
                      <h4 className="font-medium text-gray-900">{scriptName}</h4>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(scriptName, content)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      {copiedScript === scriptName ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <div className="p-4">
                    <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto max-h-40">
                      <code>{content}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {setupStatus === "complete" && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">🎉 Database Ready!</h3>
              <p className="text-sm text-green-700">
                Your database is properly configured with all tables, indexes, and functions.
              </p>
            </div>

            <TopicSync />
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={testConnection} disabled={setupStatus === "testing"} className="flex-1">
            {setupStatus === "testing" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Connection"
            )}
          </Button>

          {setupStatus === "complete" && (
            <Button onClick={() => window.location.reload()} variant="outline" className="flex-1">
              Continue to App
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
