import { type NextRequest, NextResponse } from "next/server"
import { findCompatibleUsers } from "@/lib/matching"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const maxDistance = Number.parseInt(searchParams.get("maxDistance") || "50")
    const minCompatibility = Number.parseInt(searchParams.get("minCompatibility") || "40")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    console.log("Matches API called with:", { userId, maxDistance, minCompatibility, limit })

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
    }

    const matches = await findCompatibleUsers(userId, maxDistance, minCompatibility, limit)

    console.log(`Returning ${matches.length} matches`)

    return NextResponse.json({
      matches,
      count: matches.length,
      filters: {
        maxDistance,
        minCompatibility,
        limit,
      },
    })
  } catch (error: any) {
    console.error("Matches API error:", error)

    // Handle specific error types
    if (error.message?.includes("profile not found")) {
      return NextResponse.json(
        {
          error: "User profile not found. Please try signing in again or contact support.",
          code: "PROFILE_NOT_FOUND",
        },
        { status: 404 },
      )
    }

    if (error.message?.includes("no topic preferences")) {
      return NextResponse.json(
        {
          error: "Complete some conversation starters first to find matches.",
          code: "NO_PREFERENCES",
        },
        { status: 200 }, // Not an error, just no data
      )
    }

    return NextResponse.json(
      {
        error: error.message || "Failed to find matches. Please try again.",
        code: "UNKNOWN_ERROR",
      },
      { status: 500 },
    )
  }
}
