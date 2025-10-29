"use client"

import { useState } from "react"
import { fetchNewsAction } from "@/lib/actions"
import { BulletinForm } from "./bulletin-form"
import { BulletinOutput } from "./bulletin-output"
import { ArticleSelector } from "./article-selector"
import type { Article, BulletinConfig, BulletinData, BulletinFormData, BulletinTheme } from "@/lib/types"

type Step = "form" | "selector" | "output"

/**
 * Main bulletin generator component
 * Orchestrates the multi-step bulletin creation workflow
 */
export default function BulletinGenerator() {
  // State management
  const [step, setStep] = useState<Step>("form")
  const [bulletinData, setBulletinData] = useState<BulletinData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchedArticles, setFetchedArticles] = useState<Article[]>([])
  const [selectedTheme, setSelectedTheme] = useState<BulletinTheme>("blue")

  /**
   * Handles bulletin generation by fetching articles from API
   */
  const handleGenerateBulletin = async (filters: BulletinFormData) => {
    setLoading(true)
    setError(null)
    setSelectedTheme(filters.theme)

    try {
      const data = await fetchNewsAction({
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
      const errorMessage = err instanceof Error ? err.message : "An error occurred while fetching articles"
      setError(errorMessage)
      console.error("[BulletinGenerator] Error:", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handles article selection and moves to output step
   */
  const handleArticlesSelected = (selectedArticles: Article[], bulletinConfig: BulletinConfig) => {
    // Group articles by country for regional sections
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
      bulletinConfig,
    })
    setStep("output")
  }

  /**
   * Resets the workflow to start over
   */
  const handleStartOver = () => {
    setBulletinData(null)
    setFetchedArticles([])
    setError(null)
    setStep("form")
  }

  // Render appropriate step
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
