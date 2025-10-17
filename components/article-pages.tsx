"use client"

import type { BulletinData } from "./bulletin-generator"

interface ArticlePagesProps {
  data: BulletinData
  colors: {
    primary: string
    dark: string
    light: string
    title: string
  }
}

export function ArticlePages({ data, colors }: ArticlePagesProps) {
  const sortedCountries = Object.keys(data.articlesByCountry).sort()

  return (
    <>
      {sortedCountries.map((country) => (
        <div key={country} className="bulletin-page">
          {/* Header */}
          <header className="flex justify-between items-center pb-2 mb-6">
            <h2 className="text-2xl font-bold uppercase" style={{ color: colors.primary }}>
              {country}
            </h2>
            <div className="w-24 h-1 rounded-full" style={{ backgroundColor: colors.primary }} />
          </header>

          {/* Articles */}
          <div className="flex-grow space-y-6">
            {data.articlesByCountry[country].map((article, index) => (
              <div
                key={article.news_id}
                className={
                  index !== data.articlesByCountry[country].length - 1 ? "border-b border-gray-200 pb-6 mb-6" : ""
                }
              >
                <p className="text-xs text-gray-500 mb-1">{article.published_at}</p>
                <h4 className="font-bold text-lg text-gray-900">{article.news_title}</h4>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{article.news_summary}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <footer className="text-center mt-auto pt-6 text-gray-500 text-xs border-t border-gray-200">
            <p>Page for {country}</p>
          </footer>
        </div>
      ))}
    </>
  )
}
