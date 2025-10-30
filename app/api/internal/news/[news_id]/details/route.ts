// app/api/internal/news/[news_id]/details/route.ts
import { type NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ news_id: string }> }
) {
  try {
    // Await the params first
    const { news_id } = await params

    if (!news_id) {
      return NextResponse.json({ error: "Missing news ID parameter" }, { status: 400 })
    }

    console.log('news_id from params:', news_id)

    const backendUrl = process.env.BACKEND_API_URL
    const apiToken = process.env.BACKEND_API_TOKEN
    const apiKey = process.env.BACKEND_API_KEY

    if (!backendUrl || !apiToken || !apiKey) {
      return NextResponse.json({ error: "Missing API credentials" }, { status: 500 })
    }

    // Fix the URL - remove double slash and try different endpoint formats
    const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl
    
    // Try different endpoint formats
    let url: URL
    let endpointFound = false

    // Try format 1: /api/internal/news/{id}/details
    try {
      url = new URL(`${baseUrl}/api/internal/news/${news_id}/details`)
      console.log('Trying endpoint format 1:', url.toString())
      
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "x-api-key": apiKey,
        },
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
      console.log('Format 1 failed with status:', response.status)
    } catch (error) {
      console.log('Format 1 error:', error)
    }

    // Try format 2: /api/internal/news/details?id={id}
    try {
      url = new URL(`${baseUrl}/api/internal/news/details`)
      url.searchParams.set('id', news_id)
      console.log('Trying endpoint format 2:', url.toString())
      
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "x-api-key": apiKey,
        },
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
      console.log('Format 2 failed with status:', response.status)
    } catch (error) {
      console.log('Format 2 error:', error)
    }

    // Try format 3: /api/internal/news/{id} (without /details)
    try {
      url = new URL(`${baseUrl}/api/internal/news/${news_id}`)
      console.log('Trying endpoint format 3:', url.toString())
      
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "x-api-key": apiKey,
        },
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
      console.log('Format 3 failed with status:', response.status)
    } catch (error) {
      console.log('Format 3 error:', error)
    }

    // If all formats fail
    return NextResponse.json({ 
      error: "News details not found. Tried multiple endpoint formats." 
    }, { status: 404 })

  } catch (error) {
    console.error("News details API route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
