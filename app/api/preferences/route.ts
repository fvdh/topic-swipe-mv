import { type NextRequest, NextResponse } from "next/server"
import { saveTopicPreferences, getUserTopicPreferences } from "@/lib/matching"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, preferences } = body

    if (!userId || !Array.isArray(preferences)) {
      return NextResponse.json({ error: "User ID and preferences array are required" }, { status: 400 })
    }

    await saveTopicPreferences(userId, preferences)

    return NextResponse.json({
      message: "Preferences saved successfully",
    })
  } catch (error: any) {
    console.error("Save preferences error:", error)
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const preferences = await getUserTopicPreferences(userId)

    return NextResponse.json({
      preferences,
    })
  } catch (error: any) {
    console.error("Get preferences error:", error)
    return NextResponse.json({ error: "Failed to get preferences" }, { status: 500 })
  }
}
