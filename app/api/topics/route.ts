import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, isAdminAvailable } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    if (!isAdminAvailable()) {
      return NextResponse.json({ 
        error: "Database admin access not configured." 
      }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const ids = searchParams.get("ids")

    if (ids) {
      // Fetch specific topics by IDs
      const topicIds = ids.split(",")
      const { data, error } = await supabaseAdmin!
        .from("topics")
        .select("*")
        .in("id", topicIds)
        .eq("is_active", true)

      if (error) throw error

      return NextResponse.json({
        topics: data || [],
      })
    }

    // Regular category-based query
    let query = supabaseAdmin!.from("topics").select("*").eq("is_active", true).order("created_at", { ascending: true })

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({
      topics: data || [],
    })
  } catch (error: any) {
    console.error("Get topics error:", error)
    return NextResponse.json({ error: "Failed to get topics" }, { status: 500 })
  }
}
