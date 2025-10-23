"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Article } from "./bulletin-generator"

interface ArticleDetailModalProps {
  article: Article
  isOpen: boolean
  onClose: () => void
  isSelected: boolean
  onToggleSelection: (newsId: number) => void
  customPrompts: Map<number, string>
  customSummaries: Map<number, string>
  onPromptChange: (articleId: number, prompt: string) => void
  onSummaryChange: (articleId: number, summary: string) => void
  onGenerateSummary: (articleId: number) => void
  onResetSummary: (articleId: number) => void
  onUseOriginalSummary: (articleId: number) => void
  isGeneratingSummary: number | null
}

export function ArticleDetailModal({
  article,
  isOpen,
  onClose,
  isSelected,
  onToggleSelection,
  customPrompts,
  customSummaries,
  onPromptChange,
  onSummaryChange,
  onGenerateSummary,
  onResetSummary,
  onUseOriginalSummary,
  isGeneratingSummary
}: ArticleDetailModalProps) {
  const formatBoldText = (text: string) => {
    if (!text) return "";
    
    return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const boldText = part.slice(2, -2);
        return (
          <strong key={index} className="font-bold">
            {boldText}
          </strong>
        );
      }
      return part;
    });
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b shrink-0">
          <h3 className="text-xl font-bold text-gray-800">{article.news_title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-wrap gap-2 mb-6 text-sm text-gray-600">
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              {article.jurisdictions?.[0]?.name || "International"}
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">{article.type_value}</span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              {new Date(article.published_at).toLocaleDateString()}
            </span>
          </div>

          <div className="mb-8 p-4 border border-blue-200 rounded-lg bg-blue-50">
            <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
           Summary Generator
            </h4>
         

            <div className="mb-4">
              <label htmlFor="summary-output" className="block text-sm font-medium text-blue-700 mb-2">
                Summary Output {customSummaries.get(article.news_id) && (
                  <span className="inline-flex items-center px-2 py-1 ml-2 text-xs font-bold bg-green-100 text-green-800 rounded-full">
                    ✓ CUSTOM SUMMARY
                  </span>
                )}
              </label>
              <textarea
                id="summary-output"
                value={customSummaries.get(article.news_id) || article.news_summary}
                onChange={(e) => onSummaryChange(article.news_id, e.target.value)}
                className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
                rows={6}
                style={{
                  borderColor: customSummaries.get(article.news_id) ? '#10B981' : '#D1D5DB',
                  backgroundColor: customSummaries.get(article.news_id) ? '#F0FDF4' : 'white'
                }}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {customSummaries.get(article.news_id) 
                    ? "✓ This custom summary will be used in the bulletin" 
                    : "Currently using original article summary"}
                </span>
                {customSummaries.get(article.news_id) && (
                  <button
                    onClick={() => onUseOriginalSummary(article.news_id)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Use Original
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => onGenerateSummary(article.news_id)}
                disabled={isGeneratingSummary === article.news_id}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:opacity-50"
              >
                {isGeneratingSummary === article.news_id ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </div>
                ) : (
                  "Generate with ChatGPT"
                )}
              </Button>
              {customSummaries.get(article.news_id) && (
                <Button
                  onClick={() => onResetSummary(article.news_id)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg text-sm"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-lg font-semibold text-gray-700 mb-3">Original Article Content</h4>
            <div className="prose max-w-none">
              {article.news_summary && (
                <div className="text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded border">
                  {formatBoldText(article.news_summary)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center p-6 border-t bg-gray-50 shrink-0">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelection(article.news_id)}
              className="w-5 h-5 cursor-pointer"
              id="include-article"
            />
            <label htmlFor="include-article" className="text-sm text-gray-700 cursor-pointer">
              Include in bulletin
            </label>
          </div>
          <Button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}