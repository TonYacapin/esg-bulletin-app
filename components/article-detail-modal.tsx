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
  customSummaries: Map<number, string>
  onSummaryChange: (articleId: number, summary: string) => void
  onUseOriginalSummary: (articleId: number) => void
}

export function ArticleDetailModal({
  article,
  isOpen,
  onClose,
  isSelected,
  onToggleSelection,
  customSummaries,
  onSummaryChange,
  onUseOriginalSummary
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


          <div className="border-t pt-4">
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
