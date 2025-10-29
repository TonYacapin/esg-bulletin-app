/**
 * News API Service
 * Handles all backend API communication for fetching news
 * Centralizes API logic and error handling
 */

import type { FetchNewsParams, NewsListResponse } from "@/lib/types"

/**
 * Validates API credentials are configured
 * @throws Error if credentials are missing
 */
function validateApiCredentials(): { url: string; token: string; key: string } {
  const url = process.env.BACKEND_API_URL
  const token = process.env.BACKEND_API_TOKEN
  const key = process.env.BACKEND_API_KEY

  if (!url || !token || !key) {
    throw new Error("Missing API credentials in environment variables")
  }

  return {
    url: url.replace(/\/$/, ""), // Remove trailing slash
    token,
    key,
  }
}

/**
 * Builds URL search parameters from fetch params
 * @param params - Fetch parameters
 * @returns URLSearchParams object
 */
function buildSearchParams(params: FetchNewsParams): URLSearchParams {
  const urlParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
    query: params.query,
  })

  // Add optional parameters if provided
  if (params.type_id) urlParams.append("type_id", params.type_id.toString())
  if (params.jurisdiction_id) urlParams.append("jurisdiction_id", params.jurisdiction_id.toString())
  if (params.published_at_from) urlParams.append("published_at_from", params.published_at_from)
  if (params.published_at_to) urlParams.append("published_at_to", params.published_at_to)
  if (params.updated_at_from) urlParams.append("updated_at_from", params.updated_at_from)
  if (params.updated_at_to) urlParams.append("updated_at_to", params.updated_at_to)

  return urlParams
}

/**
 * Fetches news from backend API
 * @param params - Fetch parameters
 * @returns News list response
 * @throws Error if API call fails
 */
export async function fetchNewsFromAPI(params: FetchNewsParams): Promise<NewsListResponse> {
  try {
    const { url, token, key } = validateApiCredentials()
    const searchParams = buildSearchParams(params)

    console.log(`[NewsAPIService] Fetching news with query: "${params.query}"`)

    const response = await fetch(`${url}/api/internal/news/list?${searchParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": key,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[NewsAPIService] API error: ${response.status} - ${errorText}`)

      throw new Error(`Failed to fetch news. Status: ${response.status}`)
    }

    const data = await response.json()

    console.log(`[NewsAPIService] Successfully fetched ${data.data?.length || 0} articles`)

    return data as NewsListResponse
  } catch (error) {
    console.error("[NewsAPIService] Error:", error)
    throw error instanceof Error ? error : new Error("Unknown error occurred while fetching news")
  }
}

/**
 * Fetches detailed article information
 * @param newsId - News article ID
 * @returns Article details
 * @throws Error if API call fails
 */
export async function fetchArticleDetails(newsId: number) {
  try {
    const { url, token, key } = validateApiCredentials()

    console.log(`[NewsAPIService] Fetching details for article: ${newsId}`)

    const response = await fetch(`${url}/api/internal/news/${newsId}/details`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": key,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch article details. Status: ${response.status}`)
    }

    const data = await response.json()

    console.log(`[NewsAPIService] Successfully fetched article details`)

    return data
  } catch (error) {
    console.error("[NewsAPIService] Error fetching article details:", error)
    throw error instanceof Error ? error : new Error("Unknown error occurred while fetching article details")
  }
}
