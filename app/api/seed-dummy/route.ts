import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting dummy user seeding...');

    // First, get all topics to use for preferences
    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select('id, title, category');

    if (topicsError) {
      throw new Error(`Failed to fetch topics: ${topicsError.message}`);
    }

    if (!topics || topics.length === 0) {
      throw new Error('No topics found. Please sync topics first.');
    }

    // Define dummy users
    const dummyUsers = [
      {
        user_id: '550e8400-e29b-41d4-a716-446655440201',
        name: 'Alex Johnson',
        age: 25,
        bio: 'Love traveling and coffee!',
        city: 'Amsterdam',
        country: 'Netherlands',
        latitude: 52.3676,
        longitude: 4.9041,
        max_distance_preference: 50,
        share_location: true,
        preferences: ['Pineapple belongs on pizza', 'Coffee is better than tea', 'Dogs are better pets than cats']
      },
      {
        user_id: '550e8400-e29b-41d4-a716-446655440202',
        name: 'Sam Wilson',
        age: 28,
        bio: 'Tech enthusiast and gamer',
        city: 'Utrecht',
        country: 'Netherlands',
        latitude: 52.0907,
        longitude: 5.1214,
        max_distance_preference: 100,
        share_location: true,
        preferences: ['AI will replace human jobs', 'PC gaming beats console gaming', 'iOS is better than Android']
      },
      {
        user_id: '550e8400-e29b-41d4-a716-446655440203',
        name: 'Jordan Taylor',
        age: 24,
        bio: 'Environmentalist and yoga lover',
        city: 'The Hague',
        country: 'Netherlands',
        latitude: 52.0705,
        longitude: 4.3007,
        max_distance_preference: 75,
        share_location: true,
        preferences: ['Climate change needs urgent action', 'Plant-based diets are better', 'Mental health is as important as physical health']
      },
      {
        user_id: '550e8400-e29b-41d4-a716-446655440204',
        name: 'Casey Brown',
        age: 30,
        bio: 'Foodie and book lover',
        city: 'Rotterdam',
        country: 'Netherlands',
        latitude: 51.9244,
        longitude: 4.4777,
        max_distance_preference: 50,
        share_location: true,
        preferences: ['Books are better than movies', 'Cooking at home beats restaurants', 'Coffee is better than tea']
      },
      {
        user_id: '550e8400-e29b-41d4-a716-446655440205',
        name: 'Riley Davis',
        age: 26,
        bio: 'Artist and music producer',
        city: 'Eindhoven',
        country: 'Netherlands',
        latitude: 51.4416,
        longitude: 5.4697,
        max_distance_preference: 80,
        share_location: true,
        preferences: ['Music sounds better on vinyl', 'Night owls are more creative', 'Animated movies are for all ages']
      }
    ];

    const results = [];

    // Insert user profiles
    for (const user of dummyUsers) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.user_id,
          name: user.name,
          age: user.age,
          bio: user.bio,
          city: user.city,
          country: user.country,
          latitude: user.latitude,
          longitude: user.longitude,
          max_distance_preference: user.max_distance_preference,
          share_location: user.share_location,
          last_active: new Date().toISOString()
        })
        .select();

      if (profileError) {
        results.push({ 
          user: user.name, 
          profile: false, 
          error: profileError.message 
        });
        continue;
      }

      // Add topic preferences for this user
      const userPreferences = [];
      for (const preferenceTitle of user.preferences) {
        const topic = topics.find(t => t.title === preferenceTitle);
        if (topic) {
          userPreferences.push({
            user_id: user.user_id,
            topic_id: topic.id,
            preference: 'like'
          });
        }
      }

      if (userPreferences.length > 0) {
        const { error: prefsError } = await supabase
          .from('user_topic_preferences')
          .upsert(userPreferences, { onConflict: 'user_id,topic_id' });

        results.push({
          user: user.name,
          profile: true,
          preferences: userPreferences.length,
          prefsError: prefsError?.message
        });
      } else {
        results.push({
          user: user.name,
          profile: true,
          preferences: 0,
          warning: 'No matching topics found for preferences'
        });
      }
    }

    // Verify final state
    const { data: finalProfiles, error: finalProfilesError } = await supabase
      .from('user_profiles')
      .select('user_id, name')
      .limit(10);

    const { data: finalPreferences, error: finalPrefsError } = await supabase
      .from('user_topic_preferences')
      .select('user_id, topic_id, preference')
      .limit(50);

    console.log('Seeding completed');

    return NextResponse.json({
      success: true,
      message: 'Dummy users seeded successfully',
      topicsAvailable: topics.length,
      results,
      verification: {
        profiles: finalProfiles?.length || 0,
        preferences: finalPreferences?.length || 0,
        profilesError: finalProfilesError?.message,
        prefsError: finalPrefsError?.message
      }
    });

  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
