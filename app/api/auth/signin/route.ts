import { type NextRequest, NextResponse } from "next/server"
import { signIn } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Signin request received:", { email: body.email })

    const { email, password } = body

    if (!email || !password) {
      console.log("Missing credentials")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log("Attempting signin...")
    const result = await signIn({ email, password })

    console.log("Signin successful")
    return NextResponse.json({
      message: "Sign in successful",
      user: {
        id: result.user.id,
        email: result.user.email,
      },
      profile: result.profile,
    })
  } catch (error: any) {
    console.error("Signin API error:", error)

    if (error.message?.includes("relation") || error.message?.includes("table")) {
      return NextResponse.json(
        { error: "Database not properly configured. Please run the setup scripts." },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        error: error.message || "Sign in failed. Please check your credentials.",
      },
      { status: 401 },
    )
  }
}
