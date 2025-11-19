/**
 * Content Generation Service
 * Handles all AI-powered content generation logic
 * Separates business logic from API route handlers
 */

import OpenAI from "openai"
import {
  ContentGenerationType,
  type GenerateContentRequest,
  type GenerateContentResponse,
  type Article,
} from "@/lib/types"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_ARTICLE_CHARACTERS = 6000
const MIN_REMAINING_SPACE = 100
const DEFAULT_MAX_ARTICLES = 5
const OPENAI_TIMEOUT_MS = 45000

/**
 * Token limits for different content types
 */
const TOKEN_LIMITS: Record<ContentGenerationType, number> = {
  [ContentGenerationType.KEY_TRENDS]: 300,
  [ContentGenerationType.SECTION_TRENDS]: 300,
  [ContentGenerationType.NEWS_SUMMARY]: 250,
  [ContentGenerationType.CALENDAR_SUMMARY]: 250,
  [ContentGenerationType.SECTION_TITLE]: 100,
  [ContentGenerationType.GREETING_MESSAGE]: 400,
  [ContentGenerationType.GREETING]: 500,
  [ContentGenerationType.EXECUTIVE_SUMMARY]: 500,
  [ContentGenerationType.KEY_TAKEAWAYS]: 500,
  [ContentGenerationType.SECTION_INTRO]: 500,
}

/**
 * Temperature settings for different content types
 */
const TEMPERATURE_SETTINGS: Record<ContentGenerationType, number> = {
  [ContentGenerationType.GREETING]: 0.8,
  [ContentGenerationType.GREETING_MESSAGE]: 0.8,
  [ContentGenerationType.SECTION_TITLE]: 0.8,
  [ContentGenerationType.KEY_TRENDS]: 0.7,
  [ContentGenerationType.SECTION_TRENDS]: 0.7,
  [ContentGenerationType.EXECUTIVE_SUMMARY]: 0.7,
  [ContentGenerationType.KEY_TAKEAWAYS]: 0.7,
  [ContentGenerationType.SECTION_INTRO]: 0.7,
  [ContentGenerationType.NEWS_SUMMARY]: 0.7,
  [ContentGenerationType.CALENDAR_SUMMARY]: 0.7,
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Truncates articles to fit within token limits
 * @param articles - Array of articles to truncate
 * @param maxCharacters - Maximum total characters allowed
 * @returns Truncated articles array
 */
function truncateArticles(articles: Article[], maxCharacters: number = MAX_ARTICLE_CHARACTERS): Article[] {
  let totalLength = 0
  const truncatedArticles: Article[] = []

  for (const article of articles) {
    const articleText = `${article.news_title}: ${article.news_summary}`

    if (totalLength + articleText.length > maxCharacters) {
      const remainingSpace = maxCharacters - totalLength
      if (remainingSpace > MIN_REMAINING_SPACE) {
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

/**
 * Formats articles into readable context for prompts
 * @param articles - Articles to format
 * @param maxArticles - Maximum number of articles to include
 * @returns Formatted article context string
 */
function getDetailedArticleContext(articles: Article[], maxArticles: number = DEFAULT_MAX_ARTICLES): string {
  const limitedArticles = articles.slice(0, maxArticles)

  return limitedArticles
    .map((article, index) => `${index + 1}. ${article.news_title}\n   Summary: ${article.news_summary}`)
    .join("\n\n")
}

/**
 * Gets current month and year for context
 * @param dateString - Optional date string (ISO format)
 * @returns Object with month and year
 */
function getDateContext(dateString?: string) {
  const date = dateString ? new Date(dateString) : new Date()
  const month = date.toLocaleString("en-US", { month: "long" })
  const year = date.getFullYear()
  const isoDate = date.toISOString().split("T")[0]

  return { month, year, isoDate }
}

// ============================================================================
// PROMPT BUILDERS
// ============================================================================

/**
 * Builds system and user prompts for content generation
 * @param type - Type of content to generate
 * @param articles - Articles for context
 * @param region - Region for regional content
 * @param currentDate - Current date for context
 * @param previousGreeting - Previous greeting for reference
 * @param customInstructions - Custom instructions from user
 * @returns Object with system and user prompts
 */
function buildPrompts(
  type: ContentGenerationType,
  articles: Article[],
  region?: string,
  currentDate?: string,
  previousGreeting?: string,
  customInstructions?: string,
): { systemPrompt: string; userPrompt: string } {
  const { month, year, isoDate } = getDateContext(currentDate)
  const processedArticles = truncateArticles(articles)

  let systemPrompt = ""
  let userPrompt = ""

  switch (type) {
    case ContentGenerationType.GREETING_MESSAGE:
      systemPrompt =
        "You are a professional ESG editor creating engaging greeting messages for regulatory bulletins. Create welcoming, professional opening messages that set the tone for the bulletin without referencing previous content."

      userPrompt = `Create a fresh, engaging greeting message for our ESG Regulatory Bulletin for ${month} ${year}.

This bulletin contains ${articles.length} articles covering the latest ESG regulatory developments, disclosures, and reporting requirements from around the world.

Requirements:
- Create a welcoming and professional tone
- Mention the importance of staying current with ESG regulations
- Reference the comprehensive coverage of global developments
- Be concise (2-3 paragraphs maximum, around 150-200 words total)
- Do NOT reference previous bulletins or use phrases like "welcome back" or "as always"
- Focus on the current regulatory landscape and its significance
- Make it feel fresh and timely for ${month} ${year}
- Emphasize the practical value for compliance professionals

Current date: ${isoDate}
Number of articles in this bulletin: ${articles.length}

Generate an appropriate, professional greeting message that stands on its own:`
      break

    case ContentGenerationType.GREETING:
      systemPrompt =
        "You are a witty, playful editor creating greeting messages for SCORE ESG Regulatory Bulletins. Create engaging, professional yet friendly opening messages. Please dont use Emojis."

      if (previousGreeting?.trim()) {
        userPrompt = `Create a fresh greeting message for our ESG Regulatory Bulletin for ${month} ${year}. 

Previous month's greeting for reference: "${previousGreeting}"

Maintain a similar playful and professional tone while creating a new message that reflects the current season (${month}). Keep it warm, inviting, and around 100-150 words.`
      } else {
        userPrompt = `Create an engaging greeting message for our ESG Regulatory Bulletin for ${month} ${year}. 

This is a new bulletin, so establish a warm, professional yet playful tone. Reflect the current season (${month}) and create an inviting opening that welcomes readers to explore the latest ESG regulatory developments. Keep it around 100-150 words.`
      }

      if (customInstructions) {
        userPrompt += `\n\nAdditional instructions: ${customInstructions}`
      }
      break

 case ContentGenerationType.KEY_TRENDS:
  systemPrompt =
    `You are an ESG analyst generating exactly 5 key trends for the SCORE Regulatory Bulletin.

Return the output ONLY in this strict machine-readable format:

<trend>First concise trend...</trend>
<trend>Second concise trend...</trend>
<trend>Third concise trend...</trend>
<trend>Fourth concise trend...</trend>
<trend>Fifth concise trend...</trend>

Rules:
- Use ONLY <trend>...</trend> tags.
- No bullet points, no hyphens, no numbering.
- Each trend must be concise (~70 characters).
- Focus on the most important ESG regulatory patterns and developments.`;

  if (processedArticles.length > 0) {
    userPrompt = `
Based on these recent ESG developments, generate exactly 5 key trends.

Return them ONLY using this format:

<trend>...</trend>
<trend>...</trend>
<trend>...</trend>
<trend>...</trend>
<trend>...</trend>

Here are the article details:
${getDetailedArticleContext(processedArticles, 8)}
    `;
  } else {
    userPrompt = `
Based on the current ESG regulatory landscape, generate exactly 5 key trends.

Return them ONLY using this format:

<trend>...</trend>
<trend>...</trend>
<trend>...</trend>
<trend>...</trend>
<trend>...</trend>

Focus on sustainability reporting, climate regulations,
corporate governance, and emerging ESG standards.
    `;
  }
  break;


    case ContentGenerationType.EXECUTIVE_SUMMARY:
      systemPrompt =
        "You are an ESG expert creating executive summaries for SCORE Regulatory Bulletin. Be comprehensive but concise (around 200 words). Focus on practical business implications."
      if (processedArticles.length > 0) {
        userPrompt = `Create a comprehensive executive summary (around 200 words) covering these key ESG developments:\n\n${getDetailedArticleContext(processedArticles, 6)}\n\nFocus on the main implications for businesses and keep it practical with a sharp, dynamic tone. Highlight the most significant regulatory changes.`
      } else {
        userPrompt =
          "Create a 200-word executive summary about current ESG regulatory trends, focusing on practical implications for businesses. Cover climate disclosure, sustainability reporting, and compliance requirements with a sharp, dynamic tone."
      }
      break

    case ContentGenerationType.KEY_TAKEAWAYS:
      systemPrompt =
        "You are an ESG expert creating actionable key takeaways for SCORE Regulatory Bulletin. Focus on practical recommendations and next steps for businesses."
      if (processedArticles.length > 0) {
        userPrompt = `Based on these ESG developments, create actionable key takeaways (around 200 words):\n\n${getDetailedArticleContext(processedArticles, 6)}\n\nFocus on practical actions, compliance steps, and strategic recommendations businesses should implement. Provide clear, actionable advice.`
      } else {
        userPrompt =
          "Create 200-word conclusion with actionable key takeaways for ESG compliance. Focus on practical steps businesses should implement regarding reporting, compliance, risk management, and stakeholder engagement."
      }
      break

    case ContentGenerationType.SECTION_TITLE:
      systemPrompt =
        "You are a creative writer crafting catchy section titles for SCORE Regulatory Bulletin. Create playful, engaging titles that capture the essence of the content."
      userPrompt = `Create a catchy, creative, and playful title for the ${region} section of our ESG bulletin.`
      if (processedArticles.length > 0) {
        userPrompt += ` The section covers topics like: ${processedArticles
          .slice(0, 3)
          .map((a) => a.news_title)
          .join(", ")}`
      }
      userPrompt += `\n\nMake it engaging and reflective of ${region} ESG developments.`
      break

    case ContentGenerationType.SECTION_INTRO:
      systemPrompt =
        "You are an ESG writer creating compelling section introductions for SCORE Regulatory Bulletin. Write engaging, informative introductions (around 150 words)."
      if (processedArticles.length > 0) {
        userPrompt = `Write a practical and engaging introduction (around 150 words) for the ${region} section covering these developments:\n\n${getDetailedArticleContext(processedArticles, 5)}`
      } else {
        userPrompt = `Write a 150-word practical and engaging introduction for the ${region} section of our ESG bulletin. Focus on regional regulatory developments, key challenges, and opportunities in the ${region} ESG landscape.`
      }
      break

    case ContentGenerationType.SECTION_TRENDS:
      systemPrompt =
        "You are an ESG analyst identifying regional key trends for SCORE Regulatory Bulletin. Identify exactly 3 key trends as concise bullet points."
      if (processedArticles.length > 0) {
        userPrompt = `Identify exactly 3 key trends from these ${region} ESG developments as concise bullet points:\n\n${getDetailedArticleContext(processedArticles, 6)}`
      } else {
        userPrompt = `Based on current ${region} ESG regulatory landscape, identify exactly 3 key trends as concise bullet points. Focus on region-specific developments, regulatory changes, and market impacts.`
      }
      break

    case ContentGenerationType.NEWS_SUMMARY:
      systemPrompt =
        "You are an ESG content writer creating news summaries for SCORE Regulatory Bulletin. Write factual, concise summaries (around 120 words)."
      const article = processedArticles[0] || {}
      userPrompt = `Write a factual summary (around 120 words) of this ESG development: "${article.news_title}". \n\nContext: ${article.news_summary || "No additional context provided."}\n\nInclude key deadlines, dates, issuing authority, and compliance implications if mentioned.`
      break

    case ContentGenerationType.CALENDAR_SUMMARY:
      systemPrompt =
        "You are an ESG content writer creating summaries for calendar events for SCORE Regulatory Bulletin. Focus on outcomes and implications."
      const calendarArticle = processedArticles[0] || {}
      userPrompt = `Summarize this ESG event outcome in 120 words: "${calendarArticle.news_title}". \n\nDetails: ${calendarArticle.news_summary || "No details provided."}\n\nFocus on outcomes, decisions made, implications for businesses, and next steps.`
      break

    default:
      throw new Error(`Invalid content type: ${type}`)
  }

  // Add custom instructions if applicable
  if (
    customInstructions &&
    type !== ContentGenerationType.GREETING &&
    type !== ContentGenerationType.GREETING_MESSAGE
  ) {
    userPrompt += `\n\nAdditional instructions: ${customInstructions}`
  }

  return { systemPrompt, userPrompt }
}

// ============================================================================
// FALLBACK CONTENT
// ============================================================================

/**
 * Generates fallback content when AI generation fails
 * @param type - Type of content
 * @param articles - Articles for context
 * @param region - Region for regional content
 * @returns Fallback content string
 */
function generateFallbackContent(type: ContentGenerationType, articles: Article[], region?: string): string {
  const { month, year } = getDateContext()

  const fallbackMap: Record<ContentGenerationType, string> = {
    [ContentGenerationType.GREETING_MESSAGE]: `Welcome to our ${month} ${year} ESG Regulatory Bulletin. We are pleased to present this comprehensive overview of the latest developments in environmental, social, and governance reporting requirements. This edition features ${articles.length} significant regulatory updates from across global jurisdictions, providing you with essential insights to navigate the evolving compliance landscape.

As regulatory frameworks continue to mature and expand, staying informed about disclosure requirements and reporting standards has never been more critical for organizations worldwide. This bulletin offers timely analysis and practical guidance to support your compliance efforts and strategic planning.

We remain committed to delivering high-quality, actionable intelligence to help you stay ahead of regulatory changes and implement effective ESG practices within your organization.`,

    [ContentGenerationType.GREETING]: `Welcome to our ${month} ${year} ESG Regulatory Bulletin! We're excited to bring you the latest developments in sustainability reporting and compliance. This edition covers key trends and actionable insights to help you navigate the evolving ESG landscape. As regulations continue to evolve, staying informed is more important than ever for effective compliance and strategic planning.`,

    [ContentGenerationType.KEY_TRENDS]: `• Enhanced climate disclosure requirements gaining global traction
• Supply chain due diligence regulations expanding across jurisdictions
• Standardization of ESG reporting frameworks accelerating
• Increased regulatory scrutiny on green claims and sustainability labeling
• Biodiversity and nature-related disclosures emerging as key focus areas`,

    [ContentGenerationType.EXECUTIVE_SUMMARY]: `The ESG regulatory landscape continues to evolve rapidly, with significant developments across multiple jurisdictions this month. Key trends include enhanced climate disclosure requirements, expanded supply chain due diligence obligations, and emerging standards for biodiversity reporting. Companies should prepare for more stringent reporting requirements and increased stakeholder expectations. Early adoption of comprehensive ESG frameworks will be crucial for maintaining compliance and competitive advantage.`,

    [ContentGenerationType.KEY_TAKEAWAYS]: `Businesses should prioritize updating their ESG reporting frameworks, conducting comprehensive supply chain assessments, and preparing for enhanced climate disclosure requirements. Early adoption of emerging standards will provide competitive advantage and reduce compliance risks. Regular monitoring of regulatory developments and stakeholder engagement remain essential components of effective ESG strategy implementation.`,

    [ContentGenerationType.SECTION_TITLE]: `${region} Regulatory Developments`,

    [ContentGenerationType.SECTION_INTRO]: `The ${region} landscape continues to evolve with significant regulatory developments impacting ESG compliance requirements. This section covers key updates and emerging trends that businesses operating in this region need to monitor closely.`,

    [ContentGenerationType.SECTION_TRENDS]: `• Enhanced ${region} specific disclosure requirements
• Emerging regulatory frameworks for sustainability reporting
• Increased focus on regional compliance deadlines`,

    [ContentGenerationType.NEWS_SUMMARY]: `Content for news summary is being prepared. Please check back shortly for the latest updates and insights.`,

    [ContentGenerationType.CALENDAR_SUMMARY]: `Content for calendar summary is being prepared. Please check back shortly for the latest updates and insights.`,
  }

  return (
    fallbackMap[type] ||
    `Content for ${type} section is being prepared. Please check back shortly for the latest updates and insights.`
  )
}

// ============================================================================
// MAIN SERVICE FUNCTION
// ============================================================================

/**
 * Generates content using OpenAI API with fallback support
 * @param request - Content generation request
 * @returns Generated content response
 */
export async function generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse> {
  const { type, articles, region, currentDate, previousGreeting, customInstructions } = request

  try {
    // Validate input
    if (!type) {
      throw new Error("Content type is required")
    }

    // Build prompts
    const { systemPrompt, userPrompt } = buildPrompts(
      type,
      articles,
      region,
      currentDate,
      previousGreeting,
      customInstructions,
    )

    console.log(`[ContentGenerationService] Generating ${type} with ${articles.length} articles`)

    // Set up timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS)

    try {
      // Call OpenAI API
      const completion = await openai.chat.completions.create(
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: TOKEN_LIMITS[type],
          temperature: TEMPERATURE_SETTINGS[type],
        },
        {
          signal: controller.signal,
        },
      )

      clearTimeout(timeoutId)

      const content = completion.choices[0]?.message?.content?.trim()

      if (!content) {
        throw new Error("No content generated by AI")
      }

      console.log(`[ContentGenerationService] Successfully generated ${type}`)
      return { content }
    } catch (openaiError: any) {
      clearTimeout(timeoutId)

      if (openaiError.name === "AbortError") {
        throw new Error("OpenAI request timed out after 45 seconds")
      }
      throw openaiError
    }
  } catch (error: any) {
    console.error("[ContentGenerationService] Error:", error.message)

    // Return fallback content
    const fallbackContent = generateFallbackContent(type, articles, region)

    return {
      content: fallbackContent,
      warning: "AI generation encountered issues, using fallback content",
      error: error.message,
    }
  }
}
