"use client"

import { useState } from "react"
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from "react-simple-maps"

interface WorldMapProps {
  countries?: string[]
  primaryColor: string
  articlesByCountry: Record<string, any[]>
  mappedCountries: Record<string, string>
  onCountryMapping?: (legendCountry: string, geoCountry: string) => void
  onRemoveMapping?: (country: string) => void
  activeCountry?: string | null
  interactive?: boolean
  showLegend?: boolean
}

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

// Map GeoJSON country names to our standard names
const COUNTRY_NAME_MAP: Record<string, string> = {
  "United States of America": "United States",
  "United Kingdom": "United Kingdom",
  "Dem. Rep. Congo": "Democratic Republic of the Congo",
}

export function WorldMap({ 
  countries = [], 
  primaryColor, 
  articlesByCountry, 
  mappedCountries,
  onCountryMapping,
  onRemoveMapping,
  activeCountry = null,
  interactive = true,
  showLegend = true
}: WorldMapProps) {
  const handleCountryClick = (geoCountryName: string) => {
    if (!activeCountry || !interactive || !onCountryMapping) return

    const standardName = COUNTRY_NAME_MAP[geoCountryName] || geoCountryName

    // Check if this country is already mapped
    const alreadyMappedTo = Object.entries(mappedCountries).find(([_, geo]) => geo === geoCountryName)?.[0]
    
    if (alreadyMappedTo && onRemoveMapping) {
      onRemoveMapping(alreadyMappedTo)
    }

    // Map the active legend country to this geographic country
    onCountryMapping(activeCountry, geoCountryName)
  }

  // Generate legend items with letters
  const legendItems = countries.map((country, index) => ({
    country,
    letter: String.fromCharCode(65 + index),
    articles: articlesByCountry[country] || [],
    isMapped: !!mappedCountries[country],
  }))

  // Get all mapped geographic countries for highlighting
  const mappedGeoCountries = Object.values(mappedCountries)

  return (
    <div className="w-full">
      {/* Map Container */}
      <div className="relative bg-slate-50 rounded-lg overflow-hidden mb-6 border border-gray-200">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 147,
            center: [0, 20]
          }}
          width={800}
          height={450}
          className="w-full h-auto"
        >
          {/* Always use a simple group without zooming capabilities for non-interactive */}
          <g>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isMapped = mappedGeoCountries.includes(geo.properties.name)
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => interactive && handleCountryClick(geo.properties.name)}
                      style={{
                        default: {
                          fill: isMapped ? primaryColor : "#D6D6DA",
                          stroke: "#FFFFFF",
                          strokeWidth: 0.5,
                          outline: "none",
                        },
                        hover: {
                          fill: interactive 
                            ? (activeCountry ? (isMapped ? primaryColor : "#F53") : (isMapped ? primaryColor : "#E5E5E5"))
                            : (isMapped ? primaryColor : "#D6D6DA"),
                          stroke: "#FFFFFF",
                          strokeWidth: 0.5,
                          outline: "none",
                          cursor: interactive ? "pointer" : "default",
                        },
                        pressed: {
                          fill: interactive ? primaryColor : (isMapped ? primaryColor : "#D6D6DA"),
                          stroke: "#FFFFFF",
                          strokeWidth: 0.5,
                          outline: "none",
                        },
                      }}
                    />
                  )
                })
              }
            </Geographies>

            {/* Markers with Letters - only show for mapped countries */}
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                Object.entries(mappedCountries).map(([legendCountry, geoCountry]) => {
                  const index = countries.indexOf(legendCountry)
                  if (index === -1) return null

                  const letter = String.fromCharCode(65 + index)
                  
                  // Find the geography for this country
                  const geo = geographies.find(g => g.properties.name === geoCountry)
                  if (!geo) return null

                  // Simple centroid calculation - get bounds center
                  const coordinates = geo.geometry.coordinates
                  let allCoords: number[][] = []
                  
                  // Flatten all coordinates
                  const flatten = (coords: any): void => {
                    if (Array.isArray(coords)) {
                      if (typeof coords[0] === 'number') {
                        allCoords.push(coords)
                      } else {
                        coords.forEach(flatten)
                      }
                    }
                  }
                  flatten(coordinates)

                  if (allCoords.length === 0) return null

                  // Calculate average position
                  const avgLng = allCoords.reduce((sum, coord) => sum + coord[0], 0) / allCoords.length
                  const avgLat = allCoords.reduce((sum, coord) => sum + coord[1], 0) / allCoords.length

                  return (
                    <Marker key={legendCountry} coordinates={[avgLng, avgLat]}>
                      <circle
                        r={8}
                        fill={primaryColor}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      />
                      <text
                        textAnchor="middle"
                        y={1}
                        style={{
                          fontFamily: "system-ui",
                          fill: "#FFFFFF",
                          fontSize: "10px",
                          fontWeight: "bold",
                          pointerEvents: "none"
                        }}
                      >
                        {letter}
                      </text>
                    </Marker>
                  )
                })
              }
            </Geographies>
          </g>
        </ComposableMap>

        {/* Instructions Overlay - Only show when interactive */}
        {activeCountry && interactive && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md border border-blue-700">
            <p className="text-sm font-medium">Click on the map to locate: {activeCountry}</p>
          </div>
        )}
      </div>

      {/* Legend Section - Show based on showLegend prop */}
      {showLegend && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {interactive ? `Countries to Map (${Object.keys(mappedCountries).length}/${countries.length})` : "Covered Countries"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {legendItems.map((item) => (
              <div 
                key={item.country} 
                className={`flex items-start space-x-3 p-3 rounded-lg ${
                  interactive ? 'cursor-pointer hover:bg-gray-50 transition-all' : ''
                } ${
                  activeCountry === item.country && interactive
                    ? 'bg-blue-100 border-2 border-blue-500' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
                onClick={() => interactive && onCountryMapping && onCountryMapping(item.country, "")}
              >
                {/* Legend Marker */}
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="text-white text-xs font-bold">{item.letter}</span>
                </div>
                
                {/* Country and Headlines */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {item.letter}. {item.country}
                    </h4>
                    {item.isMapped && onRemoveMapping && interactive && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onRemoveMapping(item.country)
                        }}
                        className="text-gray-400 hover:text-red-500 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  
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
      )}
    </div>
  )
}