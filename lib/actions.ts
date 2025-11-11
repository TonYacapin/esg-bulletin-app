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
export async function fetchNewsAction(params: FetchNewsParams) {
  try {
    console.log("🚀 fetchNewsAction called with params:", params)
    const result = await fetchNewsFromAPI(params)
    console.log("✅ fetchNewsAction result count:", result.data.length)
    return result
  } catch (error) {
    console.error("❌ fetchNewsAction error:", error)
    throw error
  }
}