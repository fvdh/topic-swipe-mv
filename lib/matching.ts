import { supabase } from "./supabase"

export interface TopicPreference {
  topic_id: string
  preference: "like" | "dislike"
  topic: {
    id: string
    title: string
    category: string
    icon?: string
  }
}

export interface CompatibilityResult {
  user_id: string
  profile: {
    name: string
    age?: number
    bio?: string
    profile_image_url?: string
    city?: string
    distance_km?: number
  }
  compatibility_score: number
  shared_topics: number
  matched_topics: number
  conflicting_topics: number
  category_breakdown: Record<string, number>
  matched_topic_details: Array<{
    topic_id: string
    title: string
    category: string
    icon?: string
    both_liked: boolean
  }>
}

export async function saveTopicPreferences(
  userId: string,
  preferences: Array<{
    topic_id: string
    preference: "like" | "dislike"
  }>,
) {
  try {
    console.log("Saving preferences for user:", userId)
    console.log("Preferences to save:", preferences)

    // First, let's verify that all topics exist in the database
    const topicIds = preferences.map((p) => p.topic_id)
    console.log("Checking if these topic IDs exist in database:", topicIds)

    const { data: existingTopics, error: topicCheckError } = await supabase
      .from("topics")
      .select("id")
      .in("id", topicIds)

    if (topicCheckError) {
      console.error("Topic check error:", topicCheckError)
      throw new Error(`Failed to verify topics: ${topicCheckError.message}`)
    }

    const existingTopicIds = existingTopics?.map((t) => t.id) || []
    console.log("Found existing topics in database:", existingTopicIds)

    // Filter out preferences for topics that don't exist
    const validPreferences = preferences.filter((pref) => {
      const exists = existingTopicIds.includes(pref.topic_id)
      if (!exists) {
        console.warn(`Topic ${pref.topic_id} not found in database, skipping preference`)
      }
      return exists
    })

    if (validPreferences.length === 0) {
      console.warn("No valid preferences to save - all topics missing from database")
      throw new Error("No valid topics found in database. Please ensure topics are properly seeded.")
    }

    console.log("Valid preferences to save:", validPreferences)

    // Delete existing preferences for this user
    const { error: deleteError } = await supabase.from("user_topic_preferences").delete().eq("user_id", userId)

    if (deleteError) {
      console.error("Delete preferences error:", deleteError)
      throw deleteError
    }

    // Insert new preferences
    const { error: insertError } = await supabase.from("user_topic_preferences").insert(
      validPreferences.map((pref) => ({
        user_id: userId,
        topic_id: pref.topic_id,
        preference: pref.preference,
      })),
    )

    if (insertError) {
      console.error("Insert preferences error:", insertError)
      throw insertError
    }

    console.log(`Successfully saved ${validPreferences.length} preferences`)

    // Trigger compatibility recalculation for all categories
    await recalculateCompatibilityScores(userId)

    return true
  } catch (error) {
    console.error("Save preferences error:", error)
    throw error
  }
}

export async function getUserTopicPreferences(userId: string): Promise<TopicPreference[]> {
  try {
    const { data, error } = await supabase
      .from("user_topic_preferences")
      .select(`
        topic_id,
        preference,
        topic:topics (
          id,
          title,
          category,
          icon
        )
      `)
      .eq("user_id", userId)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Get preferences error:", error)
    throw error
  }
}

export async function findCompatibleUsers(
  userId: string,
  maxDistance = 50,
  minCompatibility = 40,
  limit = 20,
): Promise<CompatibilityResult[]> {
  try {
    console.log("Finding compatible users for:", userId)

    // First, verify the user exists and get their profile
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("user_id, name, city, latitude, longitude, max_distance_preference")
      .eq("user_id", userId)
      .single()

    if (profileError) {
      console.error("Profile lookup error:", profileError)

      if (profileError.code === "PGRST116") {
        throw new Error("User profile not found. Please contact support or try signing in again.")
      }

      throw new Error(`Profile lookup failed: ${profileError.message}`)
    }

    if (!userProfile) {
      throw new Error("User profile not found. Please contact support or try signing in again.")
    }

    console.log("User profile found:", userProfile.name)

    // Check if user has any topic preferences (from ALL categories)
    const { data: userPreferences, error: preferencesError } = await supabase
      .from("user_topic_preferences")
      .select("topic_id, preference")
      .eq("user_id", userId)
      .limit(1)

    if (preferencesError) {
      console.error("Preferences check error:", preferencesError)
      throw new Error(`Failed to check user preferences: ${preferencesError.message}`)
    }

    if (!userPreferences || userPreferences.length === 0) {
      console.log("User has no topic preferences yet")
      return []
    }

    console.log("User has preferences, finding matches...")

    // Use the user's distance preference, defaulting to maxDistance parameter
    const userMaxDistance = userProfile.max_distance_preference || maxDistance

    // Try to find compatible users using the enhanced database function
    let data: any[] = []
    try {
      const result = await supabase.rpc("find_compatible_users_enhanced", {
        p_user_id: userId,
        p_max_distance_km: userMaxDistance,
        p_min_compatibility: minCompatibility,
        p_limit: limit,
      })

      if (result.error) {
        if (result.error.message?.includes("function") || result.error.message?.includes("does not exist")) {
          console.log("Enhanced database functions not set up yet, using fallback")
          // Fallback to basic function
          const fallbackResult = await supabase.rpc("find_compatible_users", {
            p_user_id: userId,
            p_max_distance_km: userMaxDistance,
            p_min_compatibility: minCompatibility,
            p_limit: limit,
          })
          data = fallbackResult.data || []
        } else {
          throw new Error(`Database query failed: ${result.error.message}`)
        }
      } else {
        data = result.data || []
      }
    } catch (rpcError: any) {
      if (rpcError.message?.includes("function") || rpcError.message?.includes("does not exist")) {
        console.log("Database functions not set up yet, returning empty results")
        return []
      }
      throw rpcError
    }

    console.log(`Found ${data?.length || 0} compatible users`)
    return data || []
  } catch (error) {
    console.error("Find compatible users error:", error)
    throw error
  }
}

async function recalculateCompatibilityScores(userId: string) {
  try {
    // Use enhanced compatibility calculation if available
    const result = await supabase.rpc("recalculate_user_compatibility_enhanced", {
      p_user_id: userId,
    })

    if (result.error && result.error.message?.includes("does not exist")) {
      // Fallback to basic function
      await supabase.rpc("recalculate_user_compatibility", {
        p_user_id: userId,
      })
    }
  } catch (error) {
    console.error("Recalculate compatibility error:", error)
  }
}

// New function to save user location and distance preferences
export async function saveLocationPreferences(
  userId: string,
  preferences: {
    latitude?: number
    longitude?: number
    city?: string
    country?: string
    maxDistance: number
    shareLocation: boolean
  },
) {
  try {
    console.log("Saving location preferences for user:", userId, preferences)

    const updateData: any = {
      max_distance_preference: preferences.maxDistance,
      share_location: preferences.shareLocation,
      last_active: new Date().toISOString(),
    }

    if (preferences.shareLocation) {
      updateData.latitude = preferences.latitude
      updateData.longitude = preferences.longitude
      updateData.city = preferences.city
      updateData.country = preferences.country
    } else {
      // Set location to "infinite" values for users who don't share location
      updateData.latitude = 999999
      updateData.longitude = 999999
      updateData.city = "Location not shared"
      updateData.country = null
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .update(updateData)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      console.error("Location preferences update error:", error)
      throw new Error(`Failed to update location preferences: ${error.message}`)
    }

    console.log("Location preferences updated successfully")
    return data
  } catch (error) {
    console.error("Save location preferences error:", error)
    throw error
  }
}
