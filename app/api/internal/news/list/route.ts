import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = searchParams.get("page") || "1"
    const limit = searchParams.get("limit") || "5"
    const query = searchParams.get("query") || ""

    const backendUrl = process.env.BACKEND_API_URL || "https://api.example.com"
    const apiToken = process.env.BACKEND_API_TOKEN
    const apiKey = process.env.BACKEND_API_KEY

    if (!apiToken || !apiKey) {
      return NextResponse.json({ error: "Missing API credentials" }, { status: 500 })
    }

    const url = new URL(`${backendUrl}api/internal/news/list`)
    url.searchParams.set("page", page)
    url.searchParams.set("limit", limit)
    url.searchParams.set("query", query)

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "x-api-key": apiKey,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: `Backend API error: ${response.statusText}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
