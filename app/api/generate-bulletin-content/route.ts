// app/api/generate-bulletin-content/route.ts
import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { generateContent } from "@/lib/services/content-generation.service"
import { ContentGenerationType, type GenerateContentRequest } from "@/lib/types"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Helper function to truncate articles to fit within token limits
function truncateArticles(articles: any[], maxCharacters = 6000) {
  let totalLength = 0
  const truncatedArticles = []

  for (const article of articles) {
    const articleText = `${article.news_title}: ${article.news_summary}`

    if (totalLength + articleText.length > maxCharacters) {
      // If adding this article would exceed the limit, truncate it
      const remainingSpace = maxCharacters - totalLength
      if (remainingSpace > 100) {
        // Only add if there's meaningful space left
        const truncatedSummary =
          article.news_summary.substring(0, remainingSpace - article.news_title.length - 50) + "..."
        truncatedArticles.push({
          ...article,
          news_summary: truncatedSummary,
        })
      }
      break
    }

    truncatedArticles.push(article)
    totalLength += articleText.length
  }

  return truncatedArticles
}

// Helper function to get detailed article context
function getDetailedArticleContext(articles: any[], maxArticles = 5) {
  const limitedArticles = articles.slice(0, maxArticles)

  return limitedArticles
    .map((article, index) => `${index + 1}. ${article.news_title}\n   Summary: ${article.news_summary}`)
    .join("\n\n")
}

/**
 * POST /api/generate-bulletin-content
 * Generates AI content for bulletin sections
 *
 * Request body:
 * - type: ContentGenerationType - Type of content to generate
 * - articles: Article[] - Articles for context
 * - region?: string - Region for regional content
 * - currentDate?: string - Current date (ISO format)
 * - previousGreeting?: string - Previous greeting for reference
 * - customInstructions?: string - Custom instructions from user
 *
 * Response:
 * - content: string - Generated content
 * - warning?: string - Warning message if fallback was used
 * - error?: string - Error message if fallback was used
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    const type = body.type as ContentGenerationType | undefined
    if (!type || !Object.values(ContentGenerationType).includes(type)) {
      return NextResponse.json({ error: "Valid content type is required" }, { status: 400 })
    }

    const generateRequest: GenerateContentRequest = {
      type,
      articles: body.articles ?? [],
      region: body.region,
      currentDate: body.currentDate,
      previousGreeting: body.previousGreeting,
      customInstructions: body.customInstructions,
    }

    const response = await generateContent(generateRequest)

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("[API] Error in generate-bulletin-content:", error)

    return NextResponse.json(
      {
        error: "Failed to generate content",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
