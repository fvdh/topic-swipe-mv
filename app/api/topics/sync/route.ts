import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { mockTopics } from "@/data/topics"

export async function POST(request: NextRequest) {
  try {
    console.log("Syncing topics to database...")

    // First, check if topics table exists
    const { error: tableCheckError } = await supabaseAdmin.from("topics").select("id").limit(1)

    if (tableCheckError) {
      console.error("Topics table not accessible:", tableCheckError)
      return NextResponse.json({ error: "Topics table not found. Please run database setup first." }, { status: 500 })
    }

    // Insert all mock topics into the database
    const topicsToInsert = mockTopics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      description: topic.description,
      category: topic.category.toLowerCase(),
      image_url: topic.image,
      icon: topic.icon,
      is_active: true,
    }))

    console.log(`Inserting ${topicsToInsert.length} topics...`)

    const { data, error } = await supabaseAdmin
      .from("topics")
      .upsert(topicsToInsert, {
        onConflict: "id",
        ignoreDuplicates: false,
      })
      .select()

    if (error) {
      console.error("Topic sync error:", error)
      throw error
    }

    console.log(`Successfully synced ${topicsToInsert.length} topics`)

    return NextResponse.json({
      message: "Topics synced successfully",
      count: topicsToInsert.length,
      topics: data,
    })
  } catch (error: any) {
    console.error("Topic sync error:", error)
    return NextResponse.json({ error: error.message || "Failed to sync topics" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get topics from database
    const { data: dbTopics, error: dbError } = await supabaseAdmin.from("topics").select("*").eq("is_active", true)

    if (dbError) {
      console.error("Database topics fetch error:", dbError)
      return NextResponse.json({ error: "Failed to fetch database topics" }, { status: 500 })
    }

    // Compare with mock topics
    const mockTopicIds = mockTopics.map((t) => t.id)
    const dbTopicIds = (dbTopics || []).map((t) => t.id)

    const missingInDb = mockTopicIds.filter((id) => !dbTopicIds.includes(id))
    const extraInDb = dbTopicIds.filter((id) => !mockTopicIds.includes(id))

    return NextResponse.json({
      mockTopics: mockTopics.length,
      dbTopics: (dbTopics || []).length,
      missingInDb,
      extraInDb,
      needsSync: missingInDb.length > 0 || extraInDb.length > 0,
    })
  } catch (error: any) {
    console.error("Topic comparison error:", error)
    return NextResponse.json({ error: error.message || "Failed to compare topics" }, { status: 500 })
  }
}
