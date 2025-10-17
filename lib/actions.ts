"use server"

import type { Article } from "@/components/bulletin-generator"

export interface NewsListResponse {
  data: Article[]
  size: number
  count: number
}

export interface FetchNewsParams {
  query: string
  page: number
  limit: number
  type_id?: number
  jurisdiction_id?: number
  published_at_from?: string
  published_at_to?: string
  updated_at_from?: string
  updated_at_to?: string
}

export async function fetchNewsFromAPI(params: FetchNewsParams): Promise<NewsListResponse> {
  try {
    let backendUrl = process.env.BACKEND_API_URL || "https://api.example.com"
    const apiToken = process.env.BACKEND_API_TOKEN
    const apiKey = process.env.BACKEND_API_KEY

    if (!apiToken || !apiKey) {
      throw new Error("Missing API credentials in environment variables")
    }

    backendUrl = backendUrl.replace(/\/$/, "")

    const urlParams = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
      query: params.query,
    })

    if (params.type_id) urlParams.append("type_id", params.type_id.toString())
    if (params.jurisdiction_id) urlParams.append("jurisdiction_id", params.jurisdiction_id.toString())
    if (params.published_at_from) urlParams.append("published_at_from", params.published_at_from)
    if (params.published_at_to) urlParams.append("published_at_to", params.published_at_to)
    if (params.updated_at_from) urlParams.append("updated_at_from", params.updated_at_from)
    if (params.updated_at_to) urlParams.append("updated_at_to", params.updated_at_to)

    const response = await fetch(`${backendUrl}/api/internal/news/list?${urlParams}`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "x-api-key": apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch news. Status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    throw error instanceof Error ? error : new Error("Unknown error occurred")
  }
}
