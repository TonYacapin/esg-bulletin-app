"use server"

import { fetchNewsFromAPI } from "@/lib/services/news-api.service"
import type { FetchNewsParams, NewsListResponse } from "@/lib/types"

/**
 * Server action to fetch news from backend API
 * Handles all API communication and error handling
 *
 * @param params - Fetch parameters (query, pagination, filters)
 * @returns News list response with articles
 * @throws Error if API call fails
 */
export async function fetchNewsAction(params: FetchNewsParams): Promise<NewsListResponse> {
  try {
    return await fetchNewsFromAPI(params)
  } catch (error) {
    console.error("[fetchNewsAction] Error:", error)
    throw error instanceof Error ? error : new Error("Failed to fetch news")
  }
}
