"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface BulletinFormProps {
  onGenerate: (filters: {
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
  }) => void
  loading: boolean
  error: string | null
}

export function BulletinForm({ onGenerate, loading, error }: BulletinFormProps) {
  const [theme, setTheme] = useState<"blue" | "green" | "red">("blue")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [filters, setFilters] = useState({
    type_id: "",
    jurisdiction_id: "",
    published_at_from: "",
    published_at_to: "",
    updated_at_from: "",
    updated_at_to: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGenerate({
      theme,
      query,
      page,
      limit,
      type_id: filters.type_id ? parseInt(filters.type_id) : undefined,
      jurisdiction_id: filters.jurisdiction_id ? parseInt(filters.jurisdiction_id) : undefined,
      published_at_from: filters.published_at_from || undefined,
      published_at_to: filters.published_at_to || undefined,
      updated_at_from: filters.updated_at_from || undefined,
      updated_at_to: filters.updated_at_to || undefined,
    })
  }

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const themeColors = {
    blue: "#1976D2",
    green: "#388E3C",
    red: "#D32F2F",
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-center mb-2">Generate Your ESG Bulletin</h2>
        <p className="text-gray-600 text-center mb-8">
          Create customized ESG bulletin with global coverage
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bulletin Theme</label>
            <div className="flex gap-4">
              {(["blue", "green", "red"] as const).map((color) => (
                <label key={color} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value={color}
                    checked={theme === color}
                    onChange={(e) => setTheme(e.target.value as "blue" | "green" | "red")}
                    className="sr-only"
                  />
                  <div
                    className={`w-8 h-8 rounded-full border-2 mr-2 ${
                      theme === color ? "border-gray-800" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: themeColors[color] }}
                  />
                  <span className="text-sm font-medium capitalize">{color}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Search Query */}
          <div>
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
              Query:
            </label>
            <input
              type="text"
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search based on Topic, Title, Summary"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Results Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="page" className="block text-sm font-medium text-gray-700 mb-1">
                Page Number
              </label>
              <input
                type="number"
                id="page"
                min="1"
                value={page}
                onChange={(e) => setPage(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-1">
                Results per Page
              </label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10 results</option>
                <option value={25}>25 results</option>
                <option value={50}>50 results</option>
                <option value={100}>100 results</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Filters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Filters */}
              <div>
                <label htmlFor="published_at_from" className="block text-sm font-medium text-gray-700 mb-1">
                  Published From
                </label>
                <input
                  type="date"
                  id="published_at_from"
                  value={filters.published_at_from}
                  onChange={(e) => handleFilterChange("published_at_from", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="published_at_to" className="block text-sm font-medium text-gray-700 mb-1">
                  Published To
                </label>
                <input
                  type="date"
                  id="published_at_to"
                  value={filters.published_at_to}
                  onChange={(e) => handleFilterChange("published_at_to", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Updated Date Filters */}
              <div>
                <label htmlFor="updated_at_from" className="block text-sm font-medium text-gray-700 mb-1">
                  Updated From
                </label>
                <input
                  type="date"
                  id="updated_at_from"
                  value={filters.updated_at_from}
                  onChange={(e) => handleFilterChange("updated_at_from", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="updated_at_to" className="block text-sm font-medium text-gray-700 mb-1">
                  Updated To
                </label>
                <input
                  type="date"
                  id="updated_at_to"
                  value={filters.updated_at_to}
                  onChange={(e) => handleFilterChange("updated_at_to", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Type and Jurisdiction */}
              <div>
                <label htmlFor="type_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type
                </label>
                <select
                  id="type_id"
                  value={filters.type_id}
                  onChange={(e) => handleFilterChange("type_id", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="2">Disclosure</option>
                  <option value="1">Regulation</option>
                  <option value="3">Guidance</option>
                </select>
              </div>

              <div>
                <label htmlFor="jurisdiction_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Jurisdiction
                </label>
                <select
                  id="jurisdiction_id"
                  value={filters.jurisdiction_id}
                  onChange={(e) => handleFilterChange("jurisdiction_id", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Jurisdictions</option>
                  <option value="1">Australia</option>
                  <option value="2">Singapore</option>
                  <option value="3">United States</option>
                  <option value="4">European Union</option>
                  <option value="5">World</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="text-white font-bold py-3 px-8 rounded-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: themeColors[theme] }}
            >
              {loading ? "Searching Articles..." : "Fetch Articles"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}