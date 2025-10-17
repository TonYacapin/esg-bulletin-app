"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Article } from "./bulletin-generator"

interface ArticleSelectorProps {
  articles: Article[]
  theme: "blue" | "green" | "red"
  onConfirm: (selectedArticles: Article[]) => void
  onBack: () => void
}

export function ArticleSelector({ articles, theme, onConfirm, onBack }: ArticleSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set(articles.map((a) => a.news_id)))

  const toggleArticle = (newsId: number) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(newsId)) {
      newSelected.delete(newsId)
    } else {
      newSelected.add(newsId)
    }
    setSelectedIds(newSelected)
  }

  const toggleAll = () => {
    if (selectedIds.size === articles.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(articles.map((a) => a.news_id)))
    }
  }

  const selectedArticles = articles.filter((a) => selectedIds.has(a.news_id))

  const themeColors = {
    blue: "#1976D2",
    green: "#388E3C",
    red: "#D32F2F",
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-2" style={{ color: themeColors[theme] }}>
          Select Articles for Your Bulletin
        </h2>
        <p className="text-gray-600 mb-6">
          Choose which articles to include in your bulletin ({selectedArticles.length} of {articles.length} selected)
        </p>

        {/* Select All / Deselect All */}
        <div className="mb-6 flex gap-4">
          <Button
            onClick={toggleAll}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            {selectedIds.size === articles.length ? "Deselect All" : "Select All"}
          </Button>
          <span className="text-sm text-gray-600 self-center">
            {selectedIds.size} article{selectedIds.size !== 1 ? "s" : ""} selected
          </span>
        </div>

        {/* Articles List */}
        <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
          {articles.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No articles found</p>
          ) : (
            articles.map((article) => (
              <div
                key={article.news_id}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(article.news_id)}
                  onChange={() => toggleArticle(article.news_id)}
                  className="mt-1 w-5 h-5 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 mb-1">{article.news_title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{article.news_summary}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    {/* Fixed: access first jurisdiction */}
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {article.jurisdictions?.[0]?.name || "International"}
                    </span>
                    <span className="bg-gray-100 px-2 py-1 rounded">{article.type_value}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {new Date(article.published_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button onClick={onBack} className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg">
            Back
          </Button>
          <Button
            onClick={() => onConfirm(selectedArticles)}
            disabled={selectedArticles.length === 0}
            className="text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: selectedArticles.length === 0 ? "#ccc" : themeColors[theme],
            }}
          >
            Generate Bulletin ({selectedArticles.length} articles)
          </Button>
        </div>
      </div>
    </div>
  )
}