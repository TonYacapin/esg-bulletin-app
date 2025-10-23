// app/api/generate-bulletin-content/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Helper function to truncate articles to fit within token limits
function truncateArticles(articles: any[], maxCharacters: number = 6000) {
  let totalLength = 0
  const truncatedArticles = []
  
  for (const article of articles) {
    const articleText = `${article.news_title}: ${article.news_summary}`
    
    if (totalLength + articleText.length > maxCharacters) {
      // If adding this article would exceed the limit, truncate it
      const remainingSpace = maxCharacters - totalLength
      if (remainingSpace > 100) { // Only add if there's meaningful space left
        const truncatedSummary = article.news_summary.substring(0, remainingSpace - article.news_title.length - 50) + '...'
        truncatedArticles.push({
          ...article,
          news_summary: truncatedSummary
        })
      }
      break
    }
    
    truncatedArticles.push(article)
    totalLength += articleText.length
  }
  
  return truncatedArticles
}

// Helper function to create concise article summaries
function createConciseArticleList(articles: any[], maxArticles: number = 8) {
  // Take only the most recent articles or limit the number
  const limitedArticles = articles.slice(0, maxArticles)
  
  return limitedArticles.map((article, index) => 
    `${index + 1}. ${article.news_title}`
  ).join('\n')
}

export async function POST(request: NextRequest) {
  try {
    const { type, articles = [], region, currentDate, previousGreeting, customInstructions } = await request.json()

    let systemPrompt = ""
    let userPrompt = ""

    const currentMonth = new Date(currentDate).toLocaleString('en-US', { month: 'long' })
    const currentYear = new Date(currentDate).getFullYear()

    // Truncate articles if there are too many to avoid context length issues
    const processedArticles = truncateArticles(articles)
    
    console.log(`Processing ${type} with ${processedArticles.length} articles (from ${articles.length} total)`)

    switch (type) {
      case 'greeting':
        systemPrompt = "You are a witty, playful editor creating greeting messages for SCORE ESG Regulatory Bulletins."
        userPrompt = `Create a greeting message for our ESG Regulatory Bulletin for ${currentMonth} ${currentYear}. The tone should be light and playful, reflecting the current season. don't put emojis`
        
        if (previousGreeting) {
          userPrompt += `\n\nPrevious month's greeting for reference: "${previousGreeting}"`
        }
        
        if (customInstructions) {
          userPrompt += `\n\nAdditional instructions: ${customInstructions}`
        }
        break

      case 'key_trends':
        systemPrompt = "You are an ESG analyst identifying key trends for SCORE Regulatory Bulletin. Focus on the most important patterns and developments."
        if (processedArticles.length > 0) {
          userPrompt = `Identify 5 key trends from these ESG news items. Present as concise bullet points (about 70 characters each):\n\n${createConciseArticleList(processedArticles)}`
        } else {
          userPrompt = "Based on current ESG regulatory developments, identify 5 key trends in concise bullet points (about 70 characters each). Focus on sustainability reporting, climate regulations, and corporate governance."
        }
        break

      case 'executive_summary':
        systemPrompt = "You are an ESG expert creating executive summaries for SCORE Regulatory Bulletin. Be comprehensive but concise."
        if (processedArticles.length > 0) {
          userPrompt = `Create a 200-word executive summary covering these key ESG developments:\n\n${createConciseArticleList(processedArticles)}\n\nFocus on the main implications and keep it practical with a sharp, dynamic tone.`
        } else {
          userPrompt = "Create a 200-word executive summary about current ESG regulatory trends, focusing on practical implications for businesses with a sharp, dynamic tone."
        }
        break

      case 'key_takeaways':
        systemPrompt = "You are an ESG expert creating actionable key takeaways for SCORE Regulatory Bulletin."
        if (processedArticles.length > 0) {
          userPrompt = `Based on these developments, create 200-word conclusion with actionable key takeaways:\n\n${createConciseArticleList(processedArticles)}\n\nFocus on practical actions businesses should take.`
        } else {
          userPrompt = "Create a 200-word conclusion with actionable key takeaways for ESG compliance, focusing on practical steps businesses should implement."
        }
        break

      case 'section_title':
        systemPrompt = "You are a creative writer crafting catchy section titles for SCORE Regulatory Bulletin."
        userPrompt = `Create a catchy, creative, and playful title for the ${region} section of our ESG bulletin.`
        if (processedArticles.length > 0) {
          userPrompt += ` The section covers topics like: ${processedArticles.slice(0, 3).map(a => a.news_title).join(', ')}`
        }
        break

      case 'section_intro':
        systemPrompt = "You are an ESG writer creating compelling section introductions for SCORE Regulatory Bulletin."
        if (processedArticles.length > 0) {
          userPrompt = `Write a 150-word practical and engaging introduction for the ${region} section covering:\n\n${createConciseArticleList(processedArticles, 5)}`
        } else {
          userPrompt = `Write a 150-word practical and engaging introduction for the ${region} section of our ESG bulletin, focusing on regional regulatory developments.`
        }
        break

      case 'section_trends':
        systemPrompt = "You are an ESG analyst identifying regional key trends for SCORE Regulatory Bulletin."
        if (processedArticles.length > 0) {
          userPrompt = `Identify 3 key trends from these ${region} ESG developments. Present as concise bullet points:\n\n${createConciseArticleList(processedArticles, 6)}`
        } else {
          userPrompt = `Based on current ${region} ESG regulatory landscape, identify 3 key trends as concise bullet points. Focus on regional-specific developments.`
        }
        break

      case 'news_summary':
        systemPrompt = "You are an ESG content writer creating news summaries for SCORE Regulatory Bulletin."
        const article = processedArticles[0] || {}
        userPrompt = `Write a 120-word factual summary of this ESG development: "${article.news_title}". \n\nContext: ${article.news_summary || 'No additional context provided.'}\n\nInclude key deadlines, dates, and issuing authority if mentioned.`
        break

      case 'calendar_summary':
        systemPrompt = "You are an ESG content writer creating summaries for calendar events for SCORE Regulatory Bulletin."
        const calendarArticle = processedArticles[0] || {}
        userPrompt = `Summarize this ESG event outcome in 120 words: "${calendarArticle.news_title}". \n\nDetails: ${calendarArticle.news_summary || 'No details provided.'}\n\nFocus on outcomes and implications.`
        break

      default:
        throw new Error('Invalid content type')
    }

    // Add custom instructions if provided
    if (customInstructions && type !== 'greeting') {
      userPrompt += `\n\nAdditional context: ${customInstructions}`
    }

    console.log(`Sending request to OpenAI for ${type}, user prompt length: ${userPrompt.length}`)

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: type === 'key_trends' || type === 'section_trends' ? 300 : 
                  type === 'news_summary' || type === 'calendar_summary' ? 200 : 
                  type === 'section_title' ? 100 : 400,
      temperature: type === 'greeting' || type === 'section_title' ? 0.8 : 0.7,
    })

    const content = completion.choices[0]?.message?.content?.trim()

    if (!content) {
      throw new Error('No content generated')
    }

    return NextResponse.json({ content })
  } catch (error: any) {
    console.error('Error generating bulletin content:', error)
    
    // Provide more specific error messages
    if (error.code === 'context_length_exceeded') {
      return NextResponse.json(
        { 
          error: 'The content is too long. Please try with fewer articles or contact support.',
          suggestion: 'Try generating trends for smaller groups of articles.'
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate content',
        details: error.message 
      },
      { status: 500 }
    )
  }
}