"use client"

import { useState } from "react"
import { fetchNewsFromAPI } from "@/lib/actions"
import { BulletinForm } from "./bulletin-form"
import { BulletinOutput } from "./bulletin-output"
import { ArticleSelector } from "./article-selector"

export interface Article {
  imageUrl: any
  news_id: number
  news_title: string
  original_title: string
  news_summary: string
  published_at: string
  created_at: string
  updated_at: string
  type_id: number
  type: string
  type_value: string
  news_status: string
  jurisdictions: {
    name: string
    code: string
  }[]
}

// UPDATED: Complete BulletinConfig interface with all fields
export interface BulletinConfig {
  // Header Section
  headerText: string
  headerImage: string
  issueNumber: string
  publicationDate: string
  publisherLogo: string
  footerImage: string
  
  // Bulletin Structure
  tableOfContents: boolean
  greetingMessage: string
  keyTrends: boolean
  executiveSummary: boolean
  keyTakeaways: boolean
  interactiveMap: boolean
  calendarSection: boolean
  
  // Regional Sections
  euSection: {
    enabled: boolean
    title: string
    keyTrends: boolean
    introduction: string
  }
  usSection: {
    enabled: boolean
    title: string
    keyTrends: boolean
    introduction: string
  }
  globalSection: {
    enabled: boolean
    title: string
    keyTrends: boolean
    introduction: string
  }
  
  // Additional Sections
  calendarMinutes: boolean
  keepAnEyeOn: boolean
  comingEvents: boolean

  // AI Generation Context
  previousGreeting: string
  customInstructions: string

  // AI Generated Content Storage
  generatedContent: {
    keyTrends: string
    executiveSummary: string
    keyTakeaways: string
    euTrends: string
    usTrends: string
    globalTrends: string
  }
}

export interface BulletinData {
  theme: "blue" | "green" | "red"
  articles: Article[]
  articlesByCountry: Record<string, Article[]>
  bulletinConfig?: BulletinConfig // UPDATED: Now uses the complete interface
}

type Step = "form" | "selector" | "output"

export default function BulletinGenerator() {
  const [step, setStep] = useState<Step>("form")
  const [bulletinData, setBulletinData] = useState<BulletinData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchedArticles, setFetchedArticles] = useState<Article[]>([])
  const [selectedTheme, setSelectedTheme] = useState<"blue" | "green" | "red">("blue")

  const handleGenerateBulletin = async (filters: {
    theme: "blue" | "green" | "red"
    query: string
    page: number
    limit: number
    type_id?: number
    jurisdiction_id?: number
    published_at_from?: string
    published_at_to?: string
    updated_at_from?: string
    updated_at_to?: string
  }) => {
    setLoading(true)
    setError(null)
    setSelectedTheme(filters.theme)

    try {
      const data = await fetchNewsFromAPI({
        query: filters.query,
        page: filters.page,
        limit: filters.limit,
        type_id: filters.type_id,
        jurisdiction_id: filters.jurisdiction_id,
        published_at_from: filters.published_at_from,
        published_at_to: filters.published_at_to,
        updated_at_from: filters.updated_at_from,
        updated_at_to: filters.updated_at_to,
      })

      const articles = data.data || []
      setFetchedArticles(articles)
      setStep("selector")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  // FIXED: Now properly typed with the complete BulletinConfig
  const handleArticlesSelected = (selectedArticles: Article[], bulletinConfig: BulletinConfig) => {
    const articlesByCountry = selectedArticles.reduce((acc: Record<string, Article[]>, article: Article) => {
      const country = article.jurisdictions?.[0]?.name || "International"
      if (!acc[country]) acc[country] = []
      acc[country].push(article)
      return acc
    }, {})

    setBulletinData({
      theme: selectedTheme,
      articles: selectedArticles,
      articlesByCountry,
      bulletinConfig // FIXED: Include the complete bulletinConfig in the data
    })
    setStep("output")
  }

  const handleStartOver = () => {
    setBulletinData(null)
    setFetchedArticles([])
    setError(null)
    setStep("form")
  }

  if (step === "output" && bulletinData) {
    return <BulletinOutput data={bulletinData} onStartOver={handleStartOver} />
  }

  if (step === "selector") {
    return (
      <ArticleSelector
        articles={fetchedArticles}
        theme={selectedTheme}
        onConfirm={handleArticlesSelected}
        onBack={handleStartOver}
      />
    )
  }

  return <BulletinForm onGenerate={handleGenerateBulletin} loading={loading} error={error} />
}