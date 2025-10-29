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

// Helper function to get detailed article context
function getDetailedArticleContext(articles: any[], maxArticles: number = 5) {
  const limitedArticles = articles.slice(0, maxArticles)
  
  return limitedArticles.map((article, index) => 
    `${index + 1}. ${article.news_title}\n   Summary: ${article.news_summary}`
  ).join('\n\n')
}

export async function POST(request: NextRequest) {
  let type: string | undefined
  let articles: any[] = []
  let region: string | undefined
  let currentDate: string | undefined
  let previousGreeting: string | undefined
  let customInstructions: string | undefined

  try {
    const body = await request.json()
    type = body.type
    articles = body.articles ?? []
    region = body.region
    currentDate = body.currentDate
    previousGreeting = body.previousGreeting
    customInstructions = body.customInstructions

    // Validate required parameters
    if (!type) {
      return NextResponse.json(
        { error: 'Content type is required' },
        { status: 400 }
      )
    }

    let systemPrompt = ""
    let userPrompt = ""

    // Handle missing currentDate
    const actualDate = currentDate || new Date().toISOString().split('T')[0]
    const currentMonth = new Date(actualDate).toLocaleString('en-US', { month: 'long' })
    const currentYear = new Date(actualDate).getFullYear()

    // Truncate articles if there are too many to avoid context length issues
    const processedArticles = truncateArticles(articles)
    
    console.log(`Processing ${type} with ${processedArticles.length} articles (from ${articles.length} total)`)

    switch (type) {
      case 'greeting_message':
        systemPrompt = "You are a professional ESG editor creating engaging greeting messages for regulatory bulletins. Create welcoming, professional opening messages that set the tone for the bulletin without referencing previous content."
        
        userPrompt = `Create a fresh, engaging greeting message for our ESG Regulatory Bulletin for ${currentMonth} ${currentYear}.

This bulletin contains ${articles.length} articles covering the latest ESG regulatory developments, disclosures, and reporting requirements from around the world.

Requirements:
- Create a welcoming and professional tone
- Mention the importance of staying current with ESG regulations
- Reference the comprehensive coverage of global developments
- Be concise (2-3 paragraphs maximum, around 150-200 words total)
- Do NOT reference previous bulletins or use phrases like "welcome back" or "as always"
- Focus on the current regulatory landscape and its significance
- Make it feel fresh and timely for ${currentMonth} ${currentYear}
- Emphasize the practical value for compliance professionals

Current date: ${actualDate}
Number of articles in this bulletin: ${articles.length}

Generate an appropriate, professional greeting message that stands on its own:`
        break

      case 'greeting':
        systemPrompt = "You are a witty, playful editor creating greeting messages for SCORE ESG Regulatory Bulletins. Create engaging, professional yet friendly opening messages. Please dont use Emojis."
        
        if (previousGreeting && previousGreeting.trim()) {
          userPrompt = `Create a fresh greeting message for our ESG Regulatory Bulletin for ${currentMonth} ${currentYear}. 

Previous month's greeting for reference: "${previousGreeting}"

Maintain a similar playful and professional tone while creating a new message that reflects the current season (${currentMonth}). Keep it warm, inviting, and around 100-150 words.`
        } else {
          userPrompt = `Create an engaging greeting message for our ESG Regulatory Bulletin for ${currentMonth} ${currentYear}. 

Previous month's greeting for reference:
          Welcome to our ESG Regulatory SCORE Bulletin! 
August has arrived—long, lazy, and just a little bit restless. The cicadas are buzzing, deadlines are looming, and ESG 
regulators? Still as wideawake as ever. 
This month, we’re serving up a mix as hot as the sidewalks: fresh climate crackdowns, plastic treaty stumbles, and 
policy twists from Berlin toBrasília. Think of it as your ESG beach read—minus the sand in your laptop. So pour 
something iced, find a shady spot, and dive into the updatesbefore September starts knocking with its back-to-
business energy.

This is a new bulletin, so establish a warm, professional yet playful tone. Reflect the current season (${currentMonth}) and create an inviting opening that welcomes readers to explore the latest ESG regulatory developments. Keep it around 100-150 words.`
        }
        
        if (customInstructions) {
          userPrompt += `\n\nAdditional instructions: ${customInstructions}`
        }
        break

      case 'key_trends':
        systemPrompt = "You are an ESG analyst identifying key trends for SCORE Regulatory Bulletin. Focus on the most important patterns and developments. Return exactly 5 concise bullet points."
        if (processedArticles.length > 0) {
          userPrompt = `Based on these recent ESG developments, identify exactly 5 key trends as concise bullet points (about 70 characters each):\n\n${getDetailedArticleContext(processedArticles, 8)}`
        } else {
          userPrompt = "Based on current ESG regulatory landscape, identify exactly 5 key trends as concise bullet points (about 70 characters each). Focus on sustainability reporting, climate regulations, corporate governance, and emerging ESG standards."
        }
        break

      case 'executive_summary':
        systemPrompt = "You are an ESG expert creating executive summaries for SCORE Regulatory Bulletin. Be comprehensive but concise (around 200 words). Focus on practical business implications."
        if (processedArticles.length > 0) {
          userPrompt = `Create a comprehensive executive summary (around 200 words) covering these key ESG developments:\n\n${getDetailedArticleContext(processedArticles, 6)}\n\nFocus on the main implications for businesses and keep it practical with a sharp, dynamic tone. Highlight the most significant regulatory changes.`
        } else {
          userPrompt = "Create a 200-word executive summary about current ESG regulatory trends, focusing on practical implications for businesses. Cover climate disclosure, sustainability reporting, and compliance requirements with a sharp, dynamic tone."
        }
        break

      case 'key_takeaways':
        systemPrompt = "You are an ESG expert creating actionable key takeaways for SCORE Regulatory Bulletin. Focus on practical recommendations and next steps for businesses."
        if (processedArticles.length > 0) {
          userPrompt = `Based on these ESG developments, create actionable key takeaways (around 200 words):\n\n${getDetailedArticleContext(processedArticles, 6)}\n\nFocus on practical actions, compliance steps, and strategic recommendations businesses should implement. Provide clear, actionable advice.`
        } else {
          userPrompt = "Create 200-word conclusion with actionable key takeaways for ESG compliance. Focus on practical steps businesses should implement regarding reporting, compliance, risk management, and stakeholder engagement."
        }
        break

      case 'section_title':
        systemPrompt = "You are a creative writer crafting catchy section titles for SCORE Regulatory Bulletin. Create playful, engaging titles that capture the essence of the content."
        userPrompt = `Create a catchy, creative, and playful title for the ${region} section of our ESG bulletin.`
        if (processedArticles.length > 0) {
          userPrompt += ` The section covers topics like: ${processedArticles.slice(0, 3).map(a => a.news_title).join(', ')}`
        }
        userPrompt += `\n\nMake it engaging and reflective of ${region} ESG developments.`
        break

      case 'section_intro':
        systemPrompt = "You are an ESG writer creating compelling section introductions for SCORE Regulatory Bulletin. Write engaging, informative introductions (around 150 words)."
        if (processedArticles.length > 0) {
          userPrompt = `Write a practical and engaging introduction (around 150 words) for the ${region} section covering these developments:\n\n${getDetailedArticleContext(processedArticles, 5)}`
        } else {
          userPrompt = `Write a 150-word practical and engaging introduction for the ${region} section of our ESG bulletin. Focus on regional regulatory developments, key challenges, and opportunities in the ${region} ESG landscape.`
        }
        break

      case 'section_trends':
        systemPrompt = "You are an ESG analyst identifying regional key trends for SCORE Regulatory Bulletin. Identify exactly 3 key trends as concise bullet points."
        if (processedArticles.length > 0) {
          userPrompt = `Identify exactly 3 key trends from these ${region} ESG developments as concise bullet points:\n\n${getDetailedArticleContext(processedArticles, 6)}`
        } else {
          userPrompt = `Based on current ${region} ESG regulatory landscape, identify exactly 3 key trends as concise bullet points. Focus on region-specific developments, regulatory changes, and market impacts.`
        }
        break

      case 'news_summary':
        systemPrompt = "You are an ESG content writer creating news summaries for SCORE Regulatory Bulletin. Write factual, concise summaries (around 120 words)."
        const article = processedArticles[0] || {}
        userPrompt = `Write a factual summary (around 120 words) of this ESG development: "${article.news_title}". \n\nContext: ${article.news_summary || 'No additional context provided.'}\n\nInclude key deadlines, dates, issuing authority, and compliance implications if mentioned.`
        break

      case 'calendar_summary':
        systemPrompt = "You are an ESG content writer creating summaries for calendar events for SCORE Regulatory Bulletin. Focus on outcomes and implications."
        const calendarArticle = processedArticles[0] || {}
        userPrompt = `Summarize this ESG event outcome in 120 words: "${calendarArticle.news_title}". \n\nDetails: ${calendarArticle.news_summary || 'No details provided.'}\n\nFocus on outcomes, decisions made, implications for businesses, and next steps.`
        break

      default:
        throw new Error('Invalid content type')
    }

    // Add custom instructions if provided
    if (customInstructions && type !== 'greeting' && type !== 'greeting_message') {
      userPrompt += `\n\nAdditional instructions: ${customInstructions}`
    }

    console.log(`Sending request to OpenAI for ${type}, user prompt length: ${userPrompt.length}`)

    // Add timeout protection
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 45000) // 45 second timeout

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: type === 'key_trends' || type === 'section_trends' ? 300 : 
                   type === 'news_summary' || type === 'calendar_summary' ? 250 : 
                   type === 'section_title' ? 100 : 
                   type === 'greeting_message' ? 400 : 500,
        temperature: type === 'greeting' || type === 'greeting_message' || type === 'section_title' ? 0.8 : 0.7,
      }, {
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const content = completion.choices[0]?.message?.content?.trim()

      if (!content) {
        throw new Error('No content generated by AI')
      }

      console.log(`Successfully generated ${type} content, length: ${content.length}`)
      return NextResponse.json({ content })

    } catch (openaiError: any) {
      clearTimeout(timeoutId)
      
      if (openaiError.name === 'AbortError') {
        throw new Error('OpenAI request timed out after 45 seconds')
      }
      throw openaiError
    }

  } catch (error: any) {
    console.error('Error generating bulletin content:', error)
    
    // Provide fallback content
    let fallbackContent = ""
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' })
    const currentYear = new Date().getFullYear()

    switch (type) {
      case 'greeting_message':
        fallbackContent = `Welcome to our ${currentMonth} ${currentYear} ESG Regulatory Bulletin. We are pleased to present this comprehensive overview of the latest developments in environmental, social, and governance reporting requirements. This edition features ${articles.length} significant regulatory updates from across global jurisdictions, providing you with essential insights to navigate the evolving compliance landscape.

As regulatory frameworks continue to mature and expand, staying informed about disclosure requirements and reporting standards has never been more critical for organizations worldwide. This bulletin offers timely analysis and practical guidance to support your compliance efforts and strategic planning.

We remain committed to delivering high-quality, actionable intelligence to help you stay ahead of regulatory changes and implement effective ESG practices within your organization.`
        break
      case 'greeting':
        fallbackContent = `Welcome to our ${currentMonth} ${currentYear} ESG Regulatory Bulletin! We're excited to bring you the latest developments in sustainability reporting and compliance. This edition covers key trends and actionable insights to help you navigate the evolving ESG landscape. As regulations continue to evolve, staying informed is more important than ever for effective compliance and strategic planning.`
        break
      case 'key_trends':
        fallbackContent = `• Enhanced climate disclosure requirements gaining global traction\n• Supply chain due diligence regulations expanding across jurisdictions\n• Standardization of ESG reporting frameworks accelerating\n• Increased regulatory scrutiny on green claims and sustainability labeling\n• Biodiversity and nature-related disclosures emerging as key focus areas`
        break
      case 'executive_summary':
        fallbackContent = `The ESG regulatory landscape continues to evolve rapidly, with significant developments across multiple jurisdictions this month. Key trends include enhanced climate disclosure requirements, expanded supply chain due diligence obligations, and emerging standards for biodiversity reporting. Companies should prepare for more stringent reporting requirements and increased stakeholder expectations. Early adoption of comprehensive ESG frameworks will be crucial for maintaining compliance and competitive advantage.`
        break
      case 'key_takeaways':
        fallbackContent = `Businesses should prioritize updating their ESG reporting frameworks, conducting comprehensive supply chain assessments, and preparing for enhanced climate disclosure requirements. Early adoption of emerging standards will provide competitive advantage and reduce compliance risks. Regular monitoring of regulatory developments and stakeholder engagement remain essential components of effective ESG strategy implementation.`
        break
      case 'section_title':
        fallbackContent = `${region} Regulatory Developments`
        break
      case 'section_intro':
        fallbackContent = `The ${region} landscape continues to evolve with significant regulatory developments impacting ESG compliance requirements. This section covers key updates and emerging trends that businesses operating in this region need to monitor closely.`
        break
      case 'section_trends':
        fallbackContent = `• Enhanced ${region} specific disclosure requirements\n• Emerging regulatory frameworks for sustainability reporting\n• Increased focus on regional compliance deadlines`
        break
      default:
        fallbackContent = `Content for ${type} section is being prepared. Please check back shortly for the latest updates and insights.`
    }
    
    // Return fallback content instead of error for better user experience
    return NextResponse.json(
      { 
        content: fallbackContent,
        warning: 'AI generation encountered issues, using fallback content',
        error: error.message 
      },
      { status: 200 }
    )
  }
}
