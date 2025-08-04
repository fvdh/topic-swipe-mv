import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, isAdminAvailable } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    if (!isAdminAvailable()) {
      return NextResponse.json({ 
        error: "Database admin access not configured." 
      }, { status: 500 })
    }

    const { topicIds } = await request.json()

    if (!topicIds || !Array.isArray(topicIds) || topicIds.length === 0) {
      return NextResponse.json({ error: "Invalid topic IDs provided" }, { status: 400 })
    }

    console.log(`Removing ${topicIds.length} extra topics from database...`)

    // Delete the extra topics
    const { error } = await supabaseAdmin!
      .from("topics")
      .delete()
      .in("id", topicIds)

    if (error) {
      console.error("Topic cleanup error:", error)
      throw error
    }

    console.log(`Successfully removed ${topicIds.length} topics`)

    return NextResponse.json({
      message: "Topics cleaned up successfully",
      removedCount: topicIds.length,
    })
  } catch (error: any) {
    console.error("Topic cleanup error:", error)
    return NextResponse.json({ error: error.message || "Failed to cleanup topics" }, { status: 500 })
  }
}
