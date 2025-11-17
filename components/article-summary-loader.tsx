// components/article-summary-loader.tsx
import { useState, useEffect } from "react"

interface ArticleSummaryLoaderProps {
  isLoading?: boolean
  currentArticle?: number
  totalArticles?: number
  message?: string
}

export function ArticleSummaryLoader({
  isLoading = true,
  currentArticle = 0,
  totalArticles = 0,
  message = "Summarizing Articles Content"
}: ArticleSummaryLoaderProps) {
  const [dots, setDots] = useState("")

  useEffect(() => {
    if (!isLoading) return

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return ""
        return prev + "."
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isLoading])

  const hasProgress = totalArticles > 0 && currentArticle > 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Animated spinner */}
        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>

        {/* Main message */}
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {message}
            <span className="inline-block w-4">{dots}</span>
          </h3>
          
          {/* Progress information */}
          {hasProgress && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">
                Processing article {currentArticle} of {totalArticles}
              </p>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(currentArticle / totalArticles) * 100}%` 
                  }}
                ></div>
              </div>
              
              <p className="text-xs text-gray-500">
                {Math.round((currentArticle / totalArticles) * 100)}% complete
              </p>
            </div>
          )}

          {!hasProgress && (
            <p className="text-gray-600 text-sm">
              AI is analyzing and summarizing your articles...
            </p>
          )}
        </div>

        {/* Additional info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            This may take a few moments depending on the number of articles
          </p>
        </div>
      </div>
    </div>
  )
}

// Alternative minimal version for inline use
export function InlineArticleSummaryLoader({ 
  message = "Summarizing Articles Content" 
}: { message?: string }) {
  const [dots, setDots] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return ""
        return prev + "."
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border">
      <div className="flex items-center space-x-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <div className="text-gray-700 font-medium">
          {message}
          <span className="inline-block w-4">{dots}</span>
        </div>
      </div>
    </div>
  )
}