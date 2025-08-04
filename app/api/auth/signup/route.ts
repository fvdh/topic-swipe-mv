import { type NextRequest, NextResponse } from "next/server"
import { signUp } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Signup request received:", { email: body.email, name: body.name })

    const { email, password, name, age, bio } = body

    // Validate required fields
    if (!email || !password || !name) {
      console.log("Missing required fields")
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("Invalid email format:", email)
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 8) {
      console.log("Password too short")
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // Validate age if provided
    if (age && (age < 18 || age > 100)) {
      console.log("Invalid age:", age)
      return NextResponse.json({ error: "Age must be between 18 and 100" }, { status: 400 })
    }

    // Validate name length
    if (name.length < 2 || name.length > 50) {
      console.log("Invalid name length:", name.length)
      return NextResponse.json({ error: "Name must be between 2 and 50 characters" }, { status: 400 })
    }

    console.log("Validation passed, creating user...")
    const result = await signUp({
      email: email.toLowerCase().trim(),
      password,
      name: name.trim(),
      age,
      bio: bio?.trim(),
    })

    console.log("User created successfully")
    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: result.user.id,
        email: result.user.email,
      },
      profile: result.profile,
    })
  } catch (error: any) {
    console.error("Signup API error:", error)

    // Handle specific error messages
    if (error.message?.includes("Database not properly configured")) {
      return NextResponse.json(
        {
          error: "Database setup incomplete. Please run the database setup scripts first.",
          details: "The required database tables have not been created.",
        },
        { status: 503 },
      )
    }

    if (error.message?.includes("duplicate") || error.message?.includes("already exists")) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
    }

    if (error.message?.includes("Failed to create user") || error.message?.includes("Failed to create profile")) {
      return NextResponse.json(
        {
          error: "Account creation failed. Please try again.",
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to create account. Please try again.",
        details: error.message || "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
