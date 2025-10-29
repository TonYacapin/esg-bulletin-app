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

  const countryLetterMap: Record<string, string> = {
    Australia: "A",
    Brazil: "B",
    Cambodia: "D",
    Chile: "E",
    Ecuador: "F",
    "European Union": "G",
    France: "H",
    Ghana: "I",
    India: "J",
    International: "K",
    Netherlands: "L",
    "New Zealand": "M",
    Nigeria: "N",
    "South Korea": "O",
    Spain: "P",
    "United Kingdom": "Q",
    "United States": "U",
  }

  return (
    <>
      {sortedCountries.map((country) => (
        <div key={country} className="bulletin-page">
          {/* Header with country name and letter code */}
          <header className="flex justify-between items-center pb-4 mb-8 border-b-2 border-gray-300">
            <h2 className="text-2xl font-bold uppercase tracking-wide text-gray-900">{country}</h2>
            <div className="flex-1 mx-4 h-0.5 bg-gray-300" />
            <p className="text-xs text-gray-600 font-semibold">{countryLetterMap[country] || "•"}</p>
          </header>

          {/* Articles */}
          <div className="flex-grow space-y-8">
            {data.articlesByCountry[country].map((article, index) => (
              <div
                key={article.news_id}
                className={index !== data.articlesByCountry[country].length - 1 ? "border-b border-gray-200 pb-8" : ""}
              >
                {/* Article title */}
                <h4 className="font-bold text-base text-gray-900 leading-tight mb-1">{article.news_title}</h4>

                {/* Category and subcategory */}
                {article.category && <p className="text-xs text-gray-500 font-semibold mb-3">{article.category}</p>}

                {/* Article summary */}
                <p className="text-sm text-gray-700 leading-relaxed">{article.news_summary}</p>

                {/* Published date */}
                {article.published_at && <p className="text-xs text-gray-500 mt-3">{article.published_at}</p>}
              </div>
            ))}
          </div>

          {/* Footer */}
          <footer className="text-center mt-auto pt-6 text-gray-600 text-xs border-t border-gray-300">
            <p>info@Scorealytics.com | Subscribe | About</p>
            <p className="mt-1">Home Button</p>
          </footer>
        </div>
      ))}
    </>
  )
}
