import { supabaseAdmin } from "./supabase"
import bcrypt from "bcryptjs"

export interface SignUpData {
  email: string
  password: string
  name: string
  age?: number
  bio?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface UserProfile {
  id: string
  user_id: string
  name: string
  bio?: string
  age?: number
  profile_image_url?: string
  city?: string
  country?: string
  location?: {
    latitude: number
    longitude: number
  }
  is_active: boolean
  last_active: string
}

export async function signUp(data: SignUpData) {
  try {
    console.log("Starting signup process for:", data.email)

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(data.password, saltRounds)
    console.log("Password hashed successfully")

    // Check if tables exist first
    const { error: tableCheckError } = await supabaseAdmin.from("users").select("id").limit(1)

    if (tableCheckError) {
      console.error("Database tables not found:", tableCheckError)
      throw new Error("Database not properly configured. Please run the setup scripts first.")
    }

    // Create user with proper error handling
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .insert({
        email: data.email,
        password_hash: passwordHash,
      })
      .select()
      .single()

    if (userError) {
      console.error("User creation error:", userError)

      if (userError.code === "23505" || userError.message?.includes("duplicate")) {
        throw new Error("An account with this email already exists")
      }

      throw new Error(`Failed to create user: ${userError.message || "Unknown database error"}`)
    }

    if (!userData) {
      throw new Error("User creation failed - no data returned")
    }

    console.log("User created successfully:", userData.id)

    // Create user profile with explicit user_id
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .insert({
        user_id: userData.id, // Ensure this matches the user ID
        name: data.name,
        age: data.age || null,
        bio: data.bio || null,
        is_active: true,
        last_active: new Date().toISOString(),
      })
      .select()
      .single()

    if (profileError) {
      console.error("Profile creation error:", profileError)
      // Clean up user if profile creation fails
      await supabaseAdmin.from("users").delete().eq("id", userData.id)
      throw new Error(`Failed to create profile: ${profileError.message || "Unknown database error"}`)
    }

    if (!profileData) {
      // Clean up user if profile creation failed
      await supabaseAdmin.from("users").delete().eq("id", userData.id)
      throw new Error("Profile creation failed - no data returned")
    }

    console.log("Profile created successfully:", profileData.id, "for user:", profileData.user_id)

    // Verify the profile was created correctly
    const { data: verifyProfile, error: verifyError } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("user_id", userData.id)
      .single()

    if (verifyError || !verifyProfile) {
      console.error("Profile verification failed:", verifyError)
      // Clean up
      await supabaseAdmin.from("users").delete().eq("id", userData.id)
      throw new Error("Profile verification failed")
    }

    console.log("Profile verified successfully")

    return { user: userData, profile: profileData }
  } catch (error: any) {
    console.error("Sign up error details:", error)
    throw error
  }
}

export async function signIn(data: SignInData) {
  try {
    console.log("Starting signin process for:", data.email)

    // Check if tables exist first
    const { error: tableCheckError } = await supabaseAdmin.from("users").select("id").limit(1)

    if (tableCheckError) {
      console.error("Database tables not found:", tableCheckError)
      throw new Error("Database not properly configured. Please run the setup scripts first.")
    }

    // Get user by email
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", data.email)
      .single()

    if (userError || !userData) {
      console.error("User lookup error:", userError)
      throw new Error("Invalid email or password")
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, userData.password_hash)
    if (!isValidPassword) {
      throw new Error("Invalid email or password")
    }

    console.log("Password verified successfully")

    // Get user profile
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("user_id", userData.id)
      .single()

    if (profileError || !profileData) {
      console.error("Profile lookup error:", profileError)

      // If profile doesn't exist, create it
      if (profileError?.code === "PGRST116") {
        console.log("Profile not found, creating new profile...")

        const { data: newProfile, error: createError } = await supabaseAdmin
          .from("user_profiles")
          .insert({
            user_id: userData.id,
            name: userData.email.split("@")[0], // Use email prefix as default name
            is_active: true,
            last_active: new Date().toISOString(),
          })
          .select()
          .single()

        if (createError || !newProfile) {
          console.error("Failed to create missing profile:", createError)
          throw new Error("Profile not found and could not be created. Please contact support.")
        }

        console.log("New profile created successfully")

        // Update last active
        await supabaseAdmin
          .from("user_profiles")
          .update({ last_active: new Date().toISOString() })
          .eq("user_id", userData.id)

        return { user: userData, profile: newProfile }
      }

      throw new Error("Profile not found. Please contact support.")
    }

    // Update last active
    await supabaseAdmin
      .from("user_profiles")
      .update({ last_active: new Date().toISOString() })
      .eq("user_id", userData.id)

    console.log("Signin successful for user:", userData.id)

    return { user: userData, profile: profileData }
  } catch (error: any) {
    console.error("Sign in error details:", error)
    throw error
  }
}

export async function updateProfile(userId: string, updates: Partial<UserProfile>) {
  try {
    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      console.error("Profile update error:", error)
      throw new Error(`Failed to update profile: ${error.message}`)
    }

    return data
  } catch (error: any) {
    console.error("Update profile error details:", error)
    throw error
  }
}
