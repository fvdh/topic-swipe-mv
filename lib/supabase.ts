import { createClient } from "@supabase/supabase-js"

// Environment variable validation with better error handling
function validateEnvironment() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceKey,
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    hasServiceKey: !!supabaseServiceKey,
  }
}

// Client-side Supabase client (lazy initialization)
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    const { supabaseUrl, supabaseAnonKey, hasUrl, hasAnonKey } = validateEnvironment()

    if (!hasUrl) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
    }

    if (!hasAnonKey) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
    }

    supabaseClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }

  return supabaseClient
}

// Server-side admin client (lazy initialization)
let adminClient: ReturnType<typeof createClient> | null = null

export function getAdminClient() {
  if (!adminClient) {
    const { supabaseUrl, supabaseServiceKey, hasUrl, hasServiceKey } = validateEnvironment()

    if (!hasUrl) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
    }

    if (!hasServiceKey) {
      throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable")
    }

    adminClient = createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return adminClient
}

// Helper function to check if admin client is available
export function isAdminAvailable(): boolean {
  const { hasUrl, hasServiceKey } = validateEnvironment()
  return hasUrl && hasServiceKey
}

// Safe client getter that doesn't throw
export function getSupabaseClientSafe() {
  try {
    return getSupabaseClient()
  } catch (error) {
    console.error("Failed to create Supabase client:", error)
    return null
  }
}

// Safe admin getter that doesn't throw
export function getAdminClientSafe() {
  try {
    return getAdminClient()
  } catch (error) {
    console.error("Failed to create admin client:", error)
    return null
  }
}

// Legacy exports - only initialize if environment is available
export const supabase = (() => {
  try {
    return getSupabaseClient()
  } catch (error) {
    console.warn("Supabase client not available:", error)
    return null
  }
})()

export const supabaseAdmin = (() => {
  try {
    return getAdminClient()
  } catch (error) {
    console.warn("Supabase admin client not available:", error)
    return null
  }
})()
