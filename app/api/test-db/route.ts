import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Check if environment variables are present
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
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

    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
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

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
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

    console.log("Testing database connection...")

    // Import supabase after env check
    const { supabaseAdmin } = await import("@/lib/supabase")

    // Test if users table exists and is accessible
    const { data: usersTest, error: usersError } = await supabaseAdmin.from("users").select("count").limit(1)

    if (usersError) {
      console.error("Users table error:", usersError)
      return NextResponse.json(
        {
          error: "Users table not accessible",
          details: usersError.message,
          suggestion: "Please create the database tables by running the SQL scripts in your Supabase dashboard",
          ready: false,
        },
        { status: 500 },
      )
    }

    // Test if user_profiles table exists and check for required columns
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
          suggestion: "Please create the database tables by running the SQL scripts in your Supabase dashboard",
          ready: false,
        },
        { status: 500 },
      )
    }

    // Test if topics table exists
    const { data: topicsTest, error: topicsError } = await supabaseAdmin.from("topics").select("count").limit(1)

    if (topicsError) {
      console.error("Topics table error:", topicsError)
      return NextResponse.json(
        {
          error: "Topics table not accessible",
          details: topicsError.message,
          suggestion: "Please create the database tables by running the SQL scripts in your Supabase dashboard",
          ready: false,
        },
        { status: 500 },
      )
    }

    // Check if location columns exist (optional)
    let hasLocationColumns = false
    try {
      const { error: locationTest } = await supabaseAdmin.from("user_profiles").select("latitude, longitude").limit(1)

      hasLocationColumns = !locationTest
    } catch (error) {
      console.log("Location columns not found, but that's okay")
    }

    console.log("Database tables accessible, location columns:", hasLocationColumns ? "present" : "missing")

    return NextResponse.json({
      message: "Database connection successful",
      ready: true,
      tables_checked: ["users", "user_profiles", "topics"],
      location_columns: hasLocationColumns,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Database test error:", error)

    // Check if it's an environment variable error
    if (error.message?.includes("supabaseKey is required") || error.message?.includes("supabaseUrl is required")) {
      return NextResponse.json(
        {
          error: "Supabase configuration error",
          details: "Missing or invalid Supabase environment variables",
          ready: false,
          envMissing: true,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        error: "Database test failed",
        details: error.message,
        ready: false,
      },
      { status: 500 },
    )
  }
}
