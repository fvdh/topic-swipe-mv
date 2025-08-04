import { createClient } from "@supabase/supabase-js"

// Environment variable validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

// Create the main Supabase client (client-side)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Create admin client (server-side only) - gracefully handle missing service key
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

// Helper function to check if admin client is available
export function isAdminAvailable(): boolean {
  return supabaseAdmin !== null
}

// Helper function to get admin client with error handling
export function getAdminClient() {
  if (!supabaseAdmin) {
    throw new Error("Admin client not available. Please set SUPABASE_SERVICE_ROLE_KEY environment variable.")
  }
  return supabaseAdmin
}
