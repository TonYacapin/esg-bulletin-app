"use client"

import { WorldMap } from "./world-map"
import type { BulletinData } from "./bulletin-generator"

interface CoverPageProps {
  data: BulletinData
  colors: {
    primary: string
    dark: string
    light: string
    title: string
  }
}

export function CoverPage({ data, colors }: CoverPageProps) {
  const today = new Date()
  const month = today.toLocaleString("default", { month: "long" })
  const year = today.getFullYear()
  const issueNumber = Math.floor(Math.random() * 10) + 1

  const sortedCountries = Object.keys(data.articlesByCountry).sort()

  return (
    <div className="bulletin-page">
      {/* Header */}
      <header className="flex justify-between items-start pb-8 border-b-2 border-gray-200">
        <div>
          <h1 className="theme-primary text-3xl font-extrabold tracking-tight">{colors.title}</h1>
          <p className="text-gray-500 mt-1">
            Issue #{issueNumber} | {month} {year}
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold text-gray-800">SCORE</h2>
          <p className="text-gray-500 text-sm">Navigating Disruption with Precision</p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-grow mt-8 flex flex-col">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-gray-800">Welcome to our ESG Bulletin!</h3>
          <p className="mt-4 max-w-3xl mx-auto text-gray-600 text-sm leading-relaxed">
            This bulletin provides a curated overview of the latest environmental, social, and governance (ESG)
            developments from around the globe. Stay informed on the key updates shaping the corporate landscape.
          </p>
        </div>

        {/* World Map */}
        <div className="mb-6">
          <WorldMap countries={sortedCountries} primaryColor={colors.primary} />
        </div>

        {/* Contents List */}
        <div className="mt-auto">
          <h3 className="text-xl font-bold mb-4 text-center" style={{ color: colors.primary }}>
            In This Issue
          </h3>
          <div className="grid grid-cols-3 gap-x-8 gap-y-4 text-xs">
            {sortedCountries.map((country) => (
              <div key={country}>
                <h5 className="font-bold mb-1" style={{ color: colors.primary }}>
                  {country}
                </h5>
                {data.articlesByCountry[country].map((article) => (
                  <p key={article.news_id} className="text-gray-600">
                    {article.news_title}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center pt-6 text-gray-500 text-xs border-t border-gray-200 mt-8">
        <p>This document is for informational purposes only.</p>
      </footer>
    </div>
  )
}
