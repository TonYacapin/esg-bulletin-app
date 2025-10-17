"use client"

import { Button } from "@/components/ui/button"
import { WorldMap } from "./world-map"
import type { BulletinData } from "./bulletin-generator"

interface BulletinOutputProps {
  data: BulletinData
  onStartOver: () => void
}

export function BulletinOutput({ data, onStartOver }: BulletinOutputProps) {
  const { theme, articles, articlesByCountry } = data
  const countries = Object.keys(articlesByCountry)

  const themeColors = {
    blue: "#1976D2",
    green: "#388E3C",
    red: "#D32F2F",
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold mb-4"
            style={{ color: themeColors[theme] }}
          >
            Sustainability Bulletin
          </h1>
          <p className="text-gray-600">
            Generated on {new Date().toLocaleDateString()} • {articles.length} articles
          </p>
        </div>

        {/* World Map */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: themeColors[theme] }}>
            Global Coverage
          </h2>
          <WorldMap 
            countries={countries} 
            primaryColor={themeColors[theme]} 
          />
        </div>

        {/* Articles by Country */}
        <div className="space-y-8">
          {Object.entries(articlesByCountry).map(([country, countryArticles]) => (
            <div key={country} className="border border-gray-200 rounded-lg p-6">
              <h3 
                className="text-xl font-semibold mb-4 pb-2 border-b"
                style={{ borderColor: themeColors[theme], color: themeColors[theme] }}
              >
                {country} ({countryArticles.length} articles)
              </h3>
              
              <div className="space-y-4">
                {countryArticles.map((article) => (
                  <div key={article.news_id} className="border-l-4 pl-4 py-2" style={{ borderColor: themeColors[theme] }}>
                    <h4 className="font-semibold text-gray-800 mb-1">{article.news_title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{article.news_summary}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {article.type_value}
                      </span>
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        Published: {formatDate(article.published_at)}
                      </span>
                      {article.jurisdictions?.[0]?.code && (
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {article.jurisdictions[0].code}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8 pt-6 border-t">
          <Button 
            onClick={onStartOver}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            Create New Bulletin
          </Button>
          <Button 
            onClick={() => window.print()}
            className="text-white font-bold py-2 px-6 rounded-lg"
            style={{ backgroundColor: themeColors[theme] }}
          >
            Print Bulletin
          </Button>
        </div>
      </div>
    </div>
  )
}