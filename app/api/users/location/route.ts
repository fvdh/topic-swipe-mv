import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, latitude, longitude, city, country } = body

    console.log("Location update request:", { userId, latitude, longitude, city, country })

    if (!userId || !latitude || !longitude) {
      return NextResponse.json({ error: "User ID, latitude, and longitude are required" }, { status: 400 })
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90) {
      return NextResponse.json({ error: "Invalid latitude. Must be between -90 and 90" }, { status: 400 })
    }

    if (longitude < -180 || longitude > 180) {
      return NextResponse.json({ error: "Invalid longitude. Must be between -180 and 180" }, { status: 400 })
    }

    // Update user location using latitude/longitude columns
    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .update({
        latitude: Number.parseFloat(latitude),
        longitude: Number.parseFloat(longitude),
        city: city || null,
        country: country || null,
        last_active: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      console.error("Location update error:", error)
      throw new Error(`Failed to update location: ${error.message}`)
    }

    if (!data) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    console.log("Location updated successfully for user:", userId)

    return NextResponse.json({
      message: "Location updated successfully",
      profile: data,
    })
  } catch (error: any) {
    console.error("Update location error:", error)
    return NextResponse.json(
      {
        error: "Failed to update location",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
