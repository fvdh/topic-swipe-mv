-- Add missing columns to existing user_profiles table if they don't exist
DO $$
BEGIN
    -- Add latitude column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'latitude') THEN
        ALTER TABLE user_profiles ADD COLUMN latitude DECIMAL(10, 8);
        RAISE NOTICE 'Added latitude column to user_profiles';
    END IF;
    
    -- Add longitude column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'longitude') THEN
        ALTER TABLE user_profiles ADD COLUMN longitude DECIMAL(11, 8);
        RAISE NOTICE 'Added longitude column to user_profiles';
    END IF;
    
    -- Add city column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'city') THEN
        ALTER TABLE user_profiles ADD COLUMN city VARCHAR(100);
        RAISE NOTICE 'Added city column to user_profiles';
    END IF;
    
    -- Add country column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'country') THEN
        ALTER TABLE user_profiles ADD COLUMN country VARCHAR(100);
        RAISE NOTICE 'Added country column to user_profiles';
    END IF;
END $$;

-- Create location index if columns exist and index doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_profiles' AND column_name = 'latitude') 
       AND EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'longitude') THEN
        
        -- Create index if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_profiles_location') THEN
            CREATE INDEX idx_user_profiles_location ON user_profiles (latitude, longitude) 
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
            RAISE NOTICE 'Created location index on user_profiles';
        END IF;
    END IF;
END $$;
