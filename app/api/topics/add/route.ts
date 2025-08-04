import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, isAdminAvailable } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    if (!isAdminAvailable()) {
      return NextResponse.json({ 
        error: "Database admin access not configured." 
      }, { status: 500 })
    }

    const { topics } = await request.json()

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json({ error: "Invalid topics data provided" }, { status: 400 })
    }

    // Validate topic structure
    for (const topic of topics) {
      if (!topic.id || !topic.title || !topic.category) {
        return NextResponse.json({ 
          error: "Each topic must have id, title, and category" 
        }, { status: 400 })
      }
    }

    console.log(`Adding ${topics.length} new topics to database...`)

    // Format topics for database
    const topicsToInsert = topics.map((topic: any) => ({
      id: topic.id,
      title: topic.title,
      description: topic.description || "",
      category: topic.category.toLowerCase(),
      image_url: topic.image || "/placeholder.svg?height=600&width=400&text=Topic",
      icon: topic.icon || "💭",
      is_active: true,
    }))

    const { data, error } = await supabaseAdmin!
      .from("topics")
      .insert(topicsToInsert)
      .select()

    if (error) {
      console.error("Topic insert error:", error)
      throw error
    }

    console.log(`Successfully added ${topics.length} topics`)

    return NextResponse.json({
      message: "Topics added successfully",
      count: topics.length,
      topics: data,
    })
  } catch (error: any) {
    console.error("Add topics error:", error)
    return NextResponse.json({ error: error.message || "Failed to add topics" }, { status: 500 })
  }
}
