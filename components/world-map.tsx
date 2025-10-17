"use client"

import { useRef } from "react"

interface WorldMapProps {
  countries: string[]
  primaryColor: string
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

export function WorldMap({ countries, primaryColor }: WorldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={mapRef} className="relative bg-slate-50 rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
      {/* World Map Image */}
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg"
        alt="World Map"
        className="w-full h-full object-cover opacity-30"
      />

      {/* Map Markers */}
      {countries.map((country) => {
        const coords = COUNTRY_COORDINATES[country]
        if (!coords) return null

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
            {/* Marker Circle */}
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-md cursor-pointer transition-transform group-hover:scale-150"
              style={{ backgroundColor: primaryColor }}
            />

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {country}
            </div>
          </div>
        )
      })}
    </div>
  )
}
