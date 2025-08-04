import { type NextRequest, NextResponse } from "next/server"
import { getAdminClientSafe } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    console.log("Starting database test...")

    // Get admin client
    const supabase = getAdminClientSafe()
    if (!supabase) {
      console.error("Admin client not available")
      return NextResponse.json(
        {
          ready: false,
          error: "Admin client not available",
          details: "Missing environment variables or failed to create Supabase admin client",
          envMissing: true,
        },
        { status: 500 },
      )
    }

    console.log("Admin client created successfully")

    // Test basic connection by checking if we can access our tables
    try {
      // Try to access one of our known tables to test the connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from("topics")
        .select("count", { count: 'exact', head: true })

      if (connectionError) {
        console.error("Connection test failed:", connectionError)
        return NextResponse.json(
          {
            ready: false,
            error: "Database connection failed",
            details: connectionError.message,
          },
          { status: 500 },
        )
      }

      console.log("Basic connection test passed")
    } catch (connError: any) {
      console.error("Connection test exception:", connError)
      return NextResponse.json(
        {
          ready: false,
          error: "Database connection exception",
          details: connError.message,
        },
        { status: 500 },
      )
    }

    // Check required tables
    const requiredTables = ["users", "user_profiles", "topics", "user_topic_preferences", "compatibility_scores"]
    const tablesChecked: string[] = []
    const missingTables: string[] = []

    for (const tableName of requiredTables) {
      try {
        console.log(`Checking table: ${tableName}`)

        const { data, error } = await supabase.from(tableName).select("*").limit(1)

        if (error) {
          console.error(`Table ${tableName} check failed:`, error)
          missingTables.push(tableName)
        } else {
          console.log(`Table ${tableName} exists and is accessible`)
          tablesChecked.push(tableName)
        }
      } catch (tableError: any) {
        console.error(`Exception checking table ${tableName}:`, tableError)
        missingTables.push(tableName)
      }
    }

    // If any tables are missing, return setup required
    if (missingTables.length > 0) {
      console.log("Missing tables:", missingTables)
      return NextResponse.json(
        {
          ready: false,
          error: "Database tables missing",
          details: `Missing tables: ${missingTables.join(", ")}. Please run the SQL setup scripts.`,
          tables_checked: tablesChecked,
          missing_tables: missingTables,
        },
        { status: 200 },
      )
    }

    // Check for location columns in user_profiles
    let locationColumns = false
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("latitude, longitude")
        .limit(1)

      if (!profileError) {
        locationColumns = true
        console.log("Location columns found in user_profiles")
      } else {
        console.log("Location columns not found in user_profiles:", profileError.message)
      }
    } catch (locError) {
      console.log("Location columns check failed:", locError)
    }

    // Check for database functions
    let databaseFunctions = false
    try {
      const { data: functionData, error: functionError } = await supabase.rpc("calculate_distance", {
        lat1: 0,
        lon1: 0,
        lat2: 1,
        lon2: 1,
      })

      if (!functionError && functionData !== null) {
        databaseFunctions = true
        console.log("Database functions are working")
      } else {
        console.log("Database functions not working:", functionError?.message)
      }
    } catch (funcError) {
      console.log("Database functions check failed:", funcError)
    }

    // Get table counts
    const counts = {
      users: 0,
      profiles: 0,
      topics: 0,
      preferences: 0,
    }

    try {
      // Count users
      const { count: userCount } = await supabase.from("users").select("*", { count: "exact", head: true })
      counts.users = userCount || 0

      // Count profiles
      const { count: profileCount } = await supabase.from("user_profiles").select("*", { count: "exact", head: true })
      counts.profiles = profileCount || 0

      // Count topics
      const { count: topicCount } = await supabase.from("topics").select("*", { count: "exact", head: true })
      counts.topics = topicCount || 0

      // Count preferences
      const { count: prefCount } = await supabase
        .from("user_topic_preferences")
        .select("*", { count: "exact", head: true })
      counts.preferences = prefCount || 0

      console.log("Table counts:", counts)
    } catch (countError) {
      console.error("Failed to get table counts:", countError)
    }

    // Database is ready
    console.log("Database test completed successfully")
    return NextResponse.json(
      {
        ready: true,
        message: "Database is properly configured",
        tables_checked: tablesChecked,
        location_columns: locationColumns,
        database_functions: databaseFunctions,
        counts,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Database test failed with exception:", error)
    return NextResponse.json(
      {
        ready: false,
        error: "Database test failed",
        details: error.message || "Unknown error occurred during database testing",
      },
      { status: 500 },
    )
  }
}
