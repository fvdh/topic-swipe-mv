import bcrypt from "bcryptjs"
import { getAdminClient } from "@/lib/supabase"

interface SignUpData {
  email: string
  password: string
  name: string
  age?: number
  bio?: string
}

interface SignInData {
  email: string
  password: string
}

export async function signUp(data: SignUpData) {
  const supabase = getAdminClient()

  try {
    console.log("Starting user signup process...")

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(data.password, saltRounds)
    console.log("Password hashed successfully")

    // Create user record
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([
        {
          email: data.email,
          password_hash: passwordHash,
        },
      ])
      .select()
      .single()

    if (userError) {
      console.error("Failed to create user:", userError)
      if (userError.code === "23505") {
        throw new Error("An account with this email already exists")
      }
      throw new Error(`Failed to create user: ${userError.message}`)
    }

    console.log("User created successfully:", userData.id)

    // Create user profile
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .insert([
        {
          user_id: userData.id,
          name: data.name,
          age: data.age,
          bio: data.bio,
        },
      ])
      .select()
      .single()

    if (profileError) {
      console.error("Failed to create profile:", profileError)
      // Clean up user if profile creation fails
      await supabase.from("users").delete().eq("id", userData.id)
      throw new Error(`Failed to create profile: ${profileError.message}`)
    }

    console.log("Profile created successfully:", profileData.id)

    return {
      user: userData,
      profile: profileData,
    }
  } catch (error: any) {
    console.error("Signup error:", error)
    throw error
  }
}

export async function signIn(data: SignInData) {
  const supabase = getAdminClient()

  try {
    console.log("Starting user signin process...")

    // Find user by email
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", data.email)
      .single()

    if (userError || !userData) {
      console.error("User not found:", userError)
      throw new Error("Invalid email or password")
    }

    console.log("User found:", userData.id)

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, userData.password_hash)
    if (!isValidPassword) {
      console.error("Invalid password")
      throw new Error("Invalid email or password")
    }

    console.log("Password verified successfully")

    // Get user profile
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userData.id)
      .single()

    if (profileError) {
      console.error("Failed to get profile:", profileError)
      throw new Error("User profile not found")
    }

    console.log("Profile retrieved successfully:", profileData.id)

    return {
      user: {
        id: userData.id,
        email: userData.email,
      },
      profile: profileData,
    }
  } catch (error: any) {
    console.error("Signin error:", error)
    throw error
  }
}
