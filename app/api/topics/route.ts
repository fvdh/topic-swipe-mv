import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    let query = supabase.from("topics").select("*").eq("is_active", true).order("created_at", { ascending: true })

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
