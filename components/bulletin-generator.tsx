"use client"

import { useState } from "react"
import { fetchNewsAction } from "@/lib/actions"
import { BulletinForm } from "./bulletin-form"
import { BulletinOutput } from "./bulletin-output"
import { ArticleSelector } from "./article-selector"
import type { Article, BulletinConfig, BulletinData, BulletinFormData, BulletinTheme, ArticleFilters } from "@/lib/types"

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
  const [currentFormData, setCurrentFormData] = useState<BulletinFormData | null>(null)

  /**
   * Handles bulletin generation by fetching articles from API
   */
  const handleGenerateBulletin = async (filters: BulletinFormData) => {
    setLoading(true)
    setError(null)
    setSelectedTheme(filters.theme)
    setCurrentFormData(filters)

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
   * Handles fetching more articles with additional filters
   */
  const handleFetchMoreArticles = async (filters: ArticleFilters): Promise<Article[]> => {
    if (!currentFormData) {
      throw new Error("No form data available")
    }

    try {
      // Merge the original form data with new filters
      const mergedFilters: BulletinFormData = {
        ...currentFormData,
        // Override with new filter values
        query: filters.searchQuery || currentFormData.query,
        // Use filter type if provided, otherwise keep original
        type_id: filters.type ? getTypeIdFromType(filters.type) : currentFormData.type_id,
        // Use filter jurisdiction if provided, otherwise keep original
        jurisdiction_id: filters.jurisdiction ? getJurisdictionIdFromName(filters.jurisdiction) : currentFormData.jurisdiction_id,
        // Use date filters if provided
        published_at_from: filters.dateFrom || currentFormData.published_at_from,
        published_at_to: filters.dateTo || currentFormData.published_at_to,
      }

      const data = await fetchNewsAction({
        query: mergedFilters.query,
        page: 1, // Always fetch first page for new filters
        limit: mergedFilters.limit,
        type_id: mergedFilters.type_id,
        jurisdiction_id: mergedFilters.jurisdiction_id,
        published_at_from: mergedFilters.published_at_from,
        published_at_to: mergedFilters.published_at_to,
        updated_at_from: mergedFilters.updated_at_from,
        updated_at_to: mergedFilters.updated_at_to,
      })

      const newArticles = data.data || []
      return newArticles

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while fetching more articles"
      console.error("[BulletinGenerator] Error fetching more articles:", errorMessage)
      throw new Error(errorMessage)
    }
  }

  /**
   * Helper function to convert type string to type_id
   */
  const getTypeIdFromType = (type: string): number => {
    const typeMap: Record<string, number> = {
      "Generic": 1,
      "Disclosure": 2,
      "Regulatory": 3,
      "Litigation": 4,
      "Enforcement Action": 5,
    }
    return typeMap[type] || 1 // Default to Generic
  }

  /**
   * Helper function to convert jurisdiction name to jurisdiction_id
   */
  const getJurisdictionIdFromName = (jurisdiction: string): number => {
    const jurisdictionMap: Record<string, number> = {
      "Australia": 1,
      "Singapore": 2,
      "United States": 3,
      "European Union": 4,
      "World": 5,
      "EU": 4,
      "US": 3,
      "UK": 6, // Assuming UK has ID 6
      "Global": 5,
    }
    return jurisdictionMap[jurisdiction] || 5 // Default to World/Global
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
    setCurrentFormData(null)
    setStep("form")
  }

  /**
   * Handles going back to selector with current articles preserved
   */
  const handleBackToSelector = () => {
    setStep("selector")
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
        onFetchMore={handleFetchMoreArticles}
      />
    )
  }

  return <BulletinForm onGenerate={handleGenerateBulletin} loading={loading} error={error} />
}