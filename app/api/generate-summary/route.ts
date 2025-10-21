import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, articleContent } = await request.json()

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // or "gpt-4" if you have access
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates concise, professional summaries for ESG bulletins. Focus on key ESG-related aspects and main points. Keep summaries clear and to the point."
        },
        {
          role: "user",
          content: `${prompt}\n\nArticle content: ${articleContent}`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const summary = completion.choices[0]?.message?.content?.trim()

    if (!summary) {
      throw new Error('No summary generated')
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Error generating summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}