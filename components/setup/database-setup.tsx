"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Database, Copy, Loader2, RefreshCw, Settings } from "lucide-react"
import { EnvironmentSetup } from "./environment-setup"
import { TopicSync } from "./topic-sync"

interface DatabaseStatus {
  ready: boolean
  error?: string
  details?: string
  envMissing?: boolean
  tables_checked?: string[]
  location_columns?: boolean
  database_functions?: boolean
  counts?: {
    users: number
    profiles: number
    topics: number
    preferences: number
  }
}

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
('Handwritten notes are more meaningful', 'Physical letters show more effort and thoughtfulness', 'conversation', '/placeholder.svg?height=600&width=400&text=Handwritten+Notes', '✍️'),

-- Technology & Innovation
('AI will replace human jobs', 'Automation threatens traditional employment', 'technology', '/placeholder.svg?height=600&width=400&text=Artificial+Intelligence', '🤖'),
('Social media harms mental health', 'Digital platforms increase anxiety and depression', 'technology', '/placeholder.svg?height=600&width=400&text=Social+Media', '📱'),
('Cryptocurrency is the future of money', 'Digital currencies will replace traditional banking', 'technology', '/placeholder.svg?height=600&width=400&text=Cryptocurrency', '₿'),
('Space exploration should be prioritized', 'Investing in space technology drives innovation', 'technology', '/placeholder.svg?height=600&width=400&text=Space+Exploration', '🚀'),
('Privacy matters more than security', 'Personal data protection is a fundamental right', 'technology', '/placeholder.svg?height=600&width=400&text=Privacy+vs+Security', '🔒'),

-- Lifestyle & Society
('Remote work is the future', 'Working from home increases productivity', 'lifestyle', '/placeholder.svg?height=600&width=400&text=Remote+Work', '💻'),
('Working 4 days a week is ideal', 'Shorter work weeks improve work-life balance', 'lifestyle', '/placeholder.svg?height=600&width=400&text=4+Day+Work+Week', '📅'),
('Universal basic income is necessary', 'UBI provides economic security for all citizens', 'lifestyle', '/placeholder.svg?height=600&width=400&text=Universal+Basic+Income', '💰'),
('Traditional education is outdated', 'Current school systems don''t prepare students for modern challenges', 'lifestyle', '/placeholder.svg?height=600&width=400&text=Education+System', '🎓'),
('Video games improve cognitive skills', 'Gaming enhances problem-solving and reaction time', 'lifestyle', '/placeholder.svg?height=600&width=400&text=Video+Games', '🎮'),

-- Health & Wellness
('Mental health is as important as physical health', 'Psychological wellbeing deserves equal attention and resources', 'health', '/placeholder.svg?height=600&width=400&text=Mental+Health', '🧠'),
('Exercise should be mandatory in schools', 'Physical activity is essential for child development', 'health', '/placeholder.svg?height=600&width=400&text=School+Exercise', '🏃'),
('Sugar should be regulated like tobacco', 'Excessive sugar consumption causes serious health issues', 'health', '/placeholder.svg?height=600&width=400&text=Sugar+Regulation', '🍭'),
('Alternative medicine has real benefits', 'Traditional healing methods complement modern medicine', 'health', '/placeholder.svg?height=600&width=400&text=Alternative+Medicine', '🌿'),
('Sleep is more important than diet', 'Quality rest is the foundation of good health', 'health', '/placeholder.svg?height=600&width=400&text=Sleep+Health', '😴'),

-- Nature & Environment
('Climate change needs urgent action', 'Rising global temperatures require immediate intervention', 'nature', '/placeholder.svg?height=600&width=400&text=Climate+Change', '🌍'),
('Renewable energy can power the world', 'Solar and wind energy are sustainable solutions', 'nature', '/placeholder.svg?height=600&width=400&text=Renewable+Energy', '⚡'),
('Plant-based diets are better', 'Vegetarian diets benefit health and environment', 'nature', '/placeholder.svg?height=600&width=400&text=Plant+Based+Diet', '🌱'),
('Electric cars are the solution', 'EVs will reduce carbon emissions significantly', 'nature', '/placeholder.svg?height=600&width=400&text=Electric+Cars', '🔋'),
('Plastic should be completely banned', 'Single-use plastics harm our ecosystems', 'nature', '/placeholder.svg?height=600&width=400&text=Plastic+Ban', '🌊')

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
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("environment")
  const [copiedScript, setCopiedScript] = useState<string | null>(null)

  const checkDatabase = async () => {
    setLoading(true)
    try {
      console.log("Checking database connection...")
      const response = await fetch("/api/test-db", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Database check failed with status:", response.status)
        console.error("Error response:", errorText)

        // Try to parse as JSON, but handle cases where it's not valid JSON
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch (parseError) {
          console.error("Failed to parse error response as JSON:", parseError)
          errorData = {
            error: "Invalid response from server",
            details: `Server returned status ${response.status}: ${errorText.substring(0, 200)}${errorText.length > 200 ? "..." : ""}`,
            ready: false,
          }
        }

        setStatus(errorData)
        return
      }

      const responseText = await response.text()
      console.log("Raw response:", responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse successful response as JSON:", parseError)
        setStatus({
          error: "Invalid JSON response",
          details: `Server returned invalid JSON: ${responseText.substring(0, 200)}${responseText.length > 200 ? "..." : ""}`,
          ready: false,
        })
        return
      }

      console.log("Database check response:", data)
      setStatus(data)

      // If database is ready, move to topics tab
      if (data.ready) {
        setActiveTab("topics")
      }
    } catch (error: any) {
      console.error("Database check failed:", error)
      setStatus({
        ready: false,
        error: "Connection failed",
        details: `Unable to connect to the database API: ${error.message}`,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Always try to check the database
    checkDatabase()
  }, [])

  const copyToClipboard = async (scriptName: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedScript(scriptName)
      setTimeout(() => setCopiedScript(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const sqlScripts = [
    {
      name: "Create Tables",
      key: "001-create-tables",
      description: "Creates the basic database structure (users, profiles, topics, etc.)",
    },
    {
      name: "Seed Topics",
      key: "002-seed-topics",
      description: "Adds 35 default topics across 5 categories for swiping",
    },
    {
      name: "Create Functions",
      key: "003-create-functions",
      description: "Creates database functions for matching and compatibility calculations",
    },
  ]

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
          <span className="text-lg">Checking database connection...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle>Database Setup</CardTitle>
              <CardDescription>Configure your Supabase database and environment</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="environment" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Environment
            {status?.envMissing && (
              <Badge variant="destructive" className="ml-1 h-5 text-xs">
                !
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Database
            {status?.ready === false && !status?.envMissing && (
              <Badge variant="destructive" className="ml-1 h-5 text-xs">
                !
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="topics" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Topics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="environment" className="space-y-4">
          {status?.envMissing ? (
            <EnvironmentSetup />
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800">Environment Configured</h3>
                    <p className="text-sm text-green-600">Your Supabase environment variables are set up correctly</p>
                  </div>
                </div>
                <Button onClick={() => setActiveTab("database")} className="w-full">
                  Continue to Database Setup
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Database Status
                    {status?.ready ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                  </CardTitle>
                  <CardDescription>{status?.ready ? "Database is ready" : "Database setup required"}</CardDescription>
                </div>
                <Button onClick={checkDatabase} variant="outline" size="sm" disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Check Again
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {status?.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{status.error}</strong>
                    {status.details && (
                      <>
                        <br />
                        <span className="text-sm font-mono bg-red-50 px-2 py-1 rounded mt-2 block">
                          {status.details}
                        </span>
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {!status?.ready && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Setup Instructions</h4>
                    <ol className="text-sm text-blue-700 list-decimal list-inside space-y-2">
                      <li>Open your Supabase Dashboard → SQL Editor</li>
                      <li>Copy and run each SQL script below in order</li>
                      <li>Wait for each script to complete before running the next</li>
                      <li>Click "Check Again" to verify the setup</li>
                    </ol>
                  </div>

                  <div className="space-y-4">
                    {sqlScripts.map((script, index) => (
                      <div key={script.key} className="border rounded-lg">
                        <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="font-medium">{script.name}</span>
                          </div>
                          <Button
                            onClick={() =>
                              copyToClipboard(script.key, SQL_SCRIPTS[script.key as keyof typeof SQL_SCRIPTS])
                            }
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            {copiedScript === script.key ? "Copied!" : "Copy"}
                          </Button>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-gray-600 mb-3">{script.description}</p>
                          <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto max-h-60">
                            <code>{SQL_SCRIPTS[script.key as keyof typeof SQL_SCRIPTS]}</code>
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {status?.ready && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">✅ Database Ready</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <p>Tables: {status.tables_checked?.join(", ")}</p>
                      <p>Users: {status.counts?.users || 0}</p>
                      <p>Profiles: {status.counts?.profiles || 0}</p>
                      <p>Topics: {status.counts?.topics || 0}</p>
                      <p>Preferences: {status.counts?.preferences || 0}</p>
                      <p>Location columns: {status.location_columns ? "✅" : "❌"}</p>
                      <p>Database functions: {status.database_functions ? "✅" : "❌"}</p>
                    </div>
                  </div>
                  <Button onClick={() => setActiveTab("topics")} className="w-full">
                    Continue to Topic Setup
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          <TopicSync />
        </TabsContent>
      </Tabs>
    </div>
  )
}
