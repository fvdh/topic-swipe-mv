import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("Starting database test...")

    // Check if environment variables are present
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log("Environment check:", {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      hasServiceKey: !!supabaseServiceKey,
    })

    if (!supabaseUrl) {
      return NextResponse.json(
        {
          error: "Missing NEXT_PUBLIC_SUPABASE_URL environment variable",
          details: "Please add your Supabase project URL to your environment variables",
          ready: false,
          envMissing: true,
        },
        { status: 500 },
      )
    }

    if (!supabaseAnonKey) {
      return NextResponse.json(
        {
          error: "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable",
          details: "Please add your Supabase anonymous key to your environment variables",
          ready: false,
          envMissing: true,
        },
        { status: 500 },
      )
    }

    if (!supabaseServiceKey) {
      return NextResponse.json(
        {
          error: "Missing SUPABASE_SERVICE_ROLE_KEY environment variable",
          details: "Please add your Supabase service role key to your environment variables",
          ready: false,
          envMissing: true,
        },
        { status: 500 },
      )
    }

    console.log("All environment variables present, creating admin client...")

    // Import and initialize supabase client
    const { createClient } = await import("@supabase/supabase-js")

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("Admin client created successfully")

    // Test if users table exists and is accessible
    console.log("Testing users table...")
    const { count: usersCount, error: usersError } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true })

    if (usersError) {
      console.error("Users table error:", usersError)
      return NextResponse.json(
        {
          error: "Users table not accessible",
          details: usersError.message,
          code: usersError.code,
          hint: usersError.hint,
          suggestion: "Please create the database tables by running the SQL scripts in your Supabase dashboard",
          ready: false,
        },
        { status: 500 },
      )
    }

    console.log("Users table accessible, count:", usersCount)

    // Test if user_profiles table exists and check for required columns
    console.log("Testing user_profiles table...")
    const { data: profilesTest, error: profilesError } = await supabaseAdmin
      .from("user_profiles")
      .select("user_id, name")
      .limit(1)

    if (profilesError) {
      console.error("Profiles table error:", profilesError)
      return NextResponse.json(
        {
          error: "User profiles table not accessible",
          details: profilesError.message,
          code: profilesError.code,
          hint: profilesError.hint,
          suggestion: "Please create the database tables by running the SQL scripts in your Supabase dashboard",
          ready: false,
        },
        { status: 500 },
      )
    }

    console.log("User profiles table accessible")

    // Test if topics table exists
    console.log("Testing topics table...")
    const { count: topicsCount, error: topicsError } = await supabaseAdmin
      .from("topics")
      .select("*", { count: "exact", head: true })

    if (topicsError) {
      console.error("Topics table error:", topicsError)
      return NextResponse.json(
        {
          error: "Topics table not accessible",
          details: topicsError.message,
          code: topicsError.code,
          hint: topicsError.hint,
          suggestion: "Please create the database tables by running the SQL scripts in your Supabase dashboard",
          ready: false,
        },
        { status: 500 },
      )
    }

    console.log("Topics table accessible, count:", topicsCount)

    // Check if location columns exist (optional)
    console.log("Testing location columns...")
    let hasLocationColumns = false
    try {
      const { error: locationTest } = await supabaseAdmin.from("user_profiles").select("latitude, longitude").limit(1)

      hasLocationColumns = !locationTest
      console.log("Location columns test result:", hasLocationColumns ? "present" : "missing")
    } catch (error) {
      console.log("Location columns not found, but that's okay")
    }

    console.log("All database tests passed!")

    return NextResponse.json({
      message: "Database connection successful",
      ready: true,
      tables_checked: ["users", "user_profiles", "topics"],
      location_columns: hasLocationColumns,
      counts: {
        users: usersCount || 0,
        topics: topicsCount || 0,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Database test error:", error)

    // More specific error handling
    if (error.message?.includes("Invalid API key")) {
      return NextResponse.json(
        {
          error: "Invalid Supabase API key",
          details: "Please check your SUPABASE_SERVICE_ROLE_KEY is correct",
          ready: false,
          envMissing: true,
        },
        { status: 500 },
      )
    }

    if (error.message?.includes("Invalid URL")) {
      return NextResponse.json(
        {
          error: "Invalid Supabase URL",
          details: "Please check your NEXT_PUBLIC_SUPABASE_URL is correct",
          ready: false,
          envMissing: true,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        error: "Database test failed",
        details: error.message || "Unknown error occurred",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        ready: false,
      },
      { status: 500 },
    )
  }
}
