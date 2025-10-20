"use client"

import { useRef } from "react"

interface WorldMapProps {
  countries: string[]
  primaryColor: string
  articlesByCountry: Record<string, any[]>
}

const COUNTRY_COORDINATES: Record<string, { top: string; left: string }> = {
  // Americas
  "United States": { top: "38%", left: "25%" },
  Canada: { top: "25%", left: "25%" },
  Brazil: { top: "65%", left: "35%" },
  Mexico: { top: "45%", left: "24%" },
  // Europe
  "United Kingdom": { top: "26%", left: "48%" },
  Germany: { top: "28%", left: "52%" },
  "European Union": { top: "29%", left: "50%" },
  France: { top: "30%", left: "50%" },
  Spain: { top: "33%", left: "47%" },
  Italy: { top: "32%", left: "53%" },
  Switzerland: { top: "29%", left: "51.5%" },
  Denmark: { top: "26%", left: "52%" },
  // Asia & Oceania
  Australia: { top: "75%", left: "85%" },
  Japan: { top: "36%", left: "85%" },
  China: { top: "40%", left: "75%" },
  India: { top: "48%", left: "70%" },
  Singapore: { top: "58%", left: "78%" },
  "Hong Kong": { top: "46%", left: "80%" },
  "New Zealand": { top: "83%", left: "95%" },
  // Africa
  "South Africa": { top: "75%", left: "55%" },
  Uganda: { top: "60%", left: "55%" },
  // Special
  International: { top: "45%", left: "45%" },
}

export function WorldMap({ countries, primaryColor, articlesByCountry }: WorldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  // Generate legend items with letters A, B, C, etc.
  const legendItems = countries.map((country, index) => ({
    country,
    letter: String.fromCharCode(65 + index), // A, B, C, ...
    articles: articlesByCountry[country] || []
  }))

  return (
    <div className="w-full">
      {/* Map Container */}
      <div ref={mapRef} className="relative bg-slate-50 rounded-lg overflow-hidden mb-6" style={{ aspectRatio: "16/9" }}>
        {/* World Map Image */}
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg"
          alt="World Map"
          className="w-full h-full object-cover opacity-30"
        />

        {/* Map Markers with Letters */}
        {countries.map((country, index) => {
          const coords = COUNTRY_COORDINATES[country]
          if (!coords) return null

          const letter = String.fromCharCode(65 + index)

          return (
            <div
              key={country}
              className="absolute group"
              style={{
                top: coords.top,
                left: coords.left,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Marker Circle with Letter */}
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow-md cursor-pointer transition-transform group-hover:scale-125 flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="text-white text-xs font-bold">{letter}</span>
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {country} ({letter})
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {legendItems.map((item) => (
            <div key={item.country} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              {/* Legend Marker */}
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow-sm flex-shrink-0 flex items-center justify-center mt-0.5"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="text-white text-xs font-bold">{item.letter}</span>
              </div>
              
              {/* Country and Headlines */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm mb-2">
                  {item.letter}. {item.country}
                </h4>
                {item.articles.length > 0 ? (
                  <ul className="space-y-1">
                    {item.articles.map((article, idx) => (
                      <li key={article.news_id || idx} className="text-gray-600 text-xs">
                        • {article.news_title}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 text-xs">
                    Latest developments in {item.country}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      
      </div>
    </div>
  )
}