"use client"

import { useState, useEffect, useMemo } from "react"
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
  theme?: "blue" | "green" | "red"
}

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

// Comprehensive country name mapping based on the actual GeoJSON dataset
const COUNTRY_NAME_MAP: Record<string, string> = {
  // Standard mappings
  "United States of America": "United States",
  "United States": "United States",
  "United Kingdom": "United Kingdom",
  "Dem. Rep. Congo": "Democratic Republic of the Congo",
  "Czechia": "Czech Republic",
  "Bosnia and Herz.": "Bosnia and Herzegovina",
  "Dominican Rep.": "Dominican Republic",
  "S. Korea": "South Korea",
  "South Korea": "South Korea",
  "Korea": "South Korea",
  "UAE": "United Arab Emirates",
  "U.A.E.": "United Arab Emirates",
  "U.S.": "United States",
  "USA": "United States",
  "UK": "United Kingdom",
  "US": "United States",

  // Additional common mappings
  "W. Sahara": "Western Sahara",
  "Eq. Guinea": "Equatorial Guinea",
  "eSwatini": "Eswatini",
  "S. Sudan": "South Sudan",
  "Central African Rep.": "Central African Republic",
  "Côte d'Ivoire": "Ivory Coast",
  "Solomon Is.": "Solomon Islands",
  "Fr. S. Antarctic Lands": "French Southern and Antarctic Lands",
  "Falkland Is.": "Falkland Islands",

  // EU countries as they appear in the dataset
  "Austria": "Austria",
  "Belgium": "Belgium",
  "Bulgaria": "Bulgaria",
  "Croatia": "Croatia",
  "Cyprus": "Cyprus",
  "Czech Republic": "Czech Republic",
  "Denmark": "Denmark",
  "Estonia": "Estonia",
  "Finland": "Finland",
  "France": "France",
  "Germany": "Germany",
  "Greece": "Greece",
  "Hungary": "Hungary",
  "Ireland": "Ireland",
  "Italy": "Italy",
  "Latvia": "Latvia",
  "Lithuania": "Lithuania",
  "Luxembourg": "Luxembourg",
  "Malta": "Malta",
  "Netherlands": "Netherlands",
  "Poland": "Poland",
  "Portugal": "Portugal",
  "Romania": "Romania",
  "Slovakia": "Slovakia",
  "Slovenia": "Slovenia",
  "Spain": "Spain",
  "Sweden": "Sweden",
}

// Special cases that should cover multiple countries or the entire world
const SPECIAL_CASES = {
  "European Union": [
    "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic",
    "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary",
    "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta",
    "Netherlands", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia",
    "Spain", "Sweden"
  ],
  "EU": [
    "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic",
    "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary",
    "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta",
    "Netherlands", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia",
    "Spain", "Sweden"
  ],
  "International": "ALL",
  "World": "ALL",
  "Global": "ALL",
}

// Manual coordinates for countries
const MANUAL_COORDINATES: Record<string, [number, number]> = {
  "Singapore": [103.8198, 1.3521],
  "Monaco": [7.4246, 43.7384],
  "Andorra": [1.6016, 42.5462],
  "Liechtenstein": [9.5554, 47.1660],
  "San Marino": [12.4578, 43.9424],
  "Vatican City": [12.4534, 41.9029],
  "Malta": [14.3754, 35.9375],
  "Luxembourg": [6.1296, 49.8153],
  "Cyprus": [33.4299, 35.1264],
  "Bahrain": [50.5577, 26.0667],
  "Qatar": [51.1839, 25.3548],
  "Kuwait": [47.4818, 29.3117],
  "United Arab Emirates": [53.8478, 23.4241],
  "Oman": [55.9233, 21.4735],
  "Bhutan": [90.4336, 27.5142],
  "Maldives": [73.2207, 3.2028],
  "Brunei": [114.7277, 4.5353],
  "Timor-Leste": [125.7275, -8.8742],
  "Fiji": [178.0650, -17.7134],
  "Solomon Islands": [160.1562, -9.6457],
  "Vanuatu": [166.9592, -15.3767],
  "Samoa": [-172.1046, -13.7590],
  "Kiribati": [173.0274, 1.8708],
  "Micronesia": [158.2150, 6.8874],
  "Palau": [134.5825, 7.5150],
  "Marshall Islands": [171.1845, 7.1315],
  "Nauru": [166.9315, -0.5228],
  "Tuvalu": [179.1943, -8.5212],
}

// Predefined marker positions for global/special cases
const SPECIAL_MARKER_POSITIONS: Record<string, [number, number]> = {
  "World": [0, -40],
  "International": [0, -30],
  "Global": [-20, -30],
  "European Union": [10, 50],
  "EU": [10, 50],
}

// Three-color theme system
const THEME_SHADES = {
  blue: {
    world: "#90CAF9",    // Darker than before but lighter than region
    region: "#64B5F6",   // Medium Blue
    country: "#1565C0",  // Dark Blue
  },
  green: {
    world: "#A5D6A7",    // Darker than before but lighter than region
    region: "#66BB6A",   // Medium Green
    country: "#1B5E20",  // Dark Green
  },
  red: {
    world: "#EF9A9A",    // Darker than before but lighter than region
    region: "#EF5350",   // Medium Red
    country: "#B71C1C",  // Dark Red
  }
}

// Fallback coordinates for all major countries
const FALLBACK_COORDINATES: Record<string, [number, number]> = {
  "Africa": [21.0932, -1.2921],
  "Netherlands (Kingdom of the)": [5.2913, 52.1326],
  "New Zealand": [174.8860, -40.9006],
  "Austria": [14.5501, 47.5162],
  "California": [-119.4179, 36.7783],
  "United States": [-95.7129, 37.0902],
  "Germany": [10.4515, 51.1657],
  "France": [2.2137, 46.2276],
  "United Kingdom": [-3.4360, 55.3781],
  "Japan": [138.2529, 36.2048],
  "Australia": [133.7751, -25.2744],
  "Canada": [-106.3468, 56.1304],
  "China": [104.1954, 35.8617],
  "India": [78.9629, 20.5937],
  "Brazil": [-53.2, -10.3333],
  "Singapore": [103.8198, 1.3521],
  "South Korea": [127.7669, 35.9078],
  "Russia": [37.6184, 55.7558],
  "Mexico": [-102.5528, 23.6345],
  "South Africa": [22.9375, -30.5595],
  "Egypt": [30.8025, 26.8206],
  "Nigeria": [8.6753, 9.0820],
  "Kenya": [37.9062, -0.0236],
  "Argentina": [-63.6167, -38.4161],
  "Chile": [-71.5430, -35.6751],
  "Peru": [-75.0152, -9.1900],
  "Colombia": [-74.2973, 4.5709],
  "Venezuela": [-66.5897, 6.4238],
  "Pakistan": [69.3451, 30.3753],
  "Bangladesh": [90.3563, 23.6850],
  "Vietnam": [108.2772, 14.0583],
  "Thailand": [100.9925, 15.8700],
  "Malaysia": [101.9758, 4.2105],
  "Indonesia": [113.9213, -0.7893],
  "Philippines": [121.7740, 12.8797],
  "Saudi Arabia": [45.0792, 23.8859],
  "Turkey": [35.2433, 38.9637],
  "Iran": [53.6880, 32.4279],
  "Iraq": [43.6793, 33.2232],
  "Italy": [12.5674, 41.8719],
  "Spain": [-3.7492, 40.4637],
  "Netherlands": [5.2913, 52.1326],
  "Sweden": [18.6435, 60.1282],
  "Norway": [8.4689, 60.4720],
  "Denmark": [9.5018, 56.2639],
  "Finland": [25.7482, 61.9241],
  "Poland": [19.1451, 51.9194],
  "Switzerland": [8.2275, 46.8182],
  "Belgium": [4.4699, 50.5039],
  "Portugal": [-8.2245, 39.3999],
  "Greece": [21.8243, 39.0742],
  "Ukraine": [31.1656, 48.3794],
  "Romania": [24.9668, 45.9432],
  "Czech Republic": [15.4720, 49.8175],
  "Hungary": [19.5033, 47.1625],
  "Bulgaria": [25.4858, 42.7339],
  "Serbia": [21.0059, 44.0165],
  "Croatia": [15.2000, 45.1000],
  "Slovakia": [19.6990, 48.6690],
  "Ireland": [-8.2439, 53.4129],
  "Lithuania": [23.8813, 55.1694],
  "Latvia": [24.6032, 56.8796],
  "Estonia": [25.0136, 58.5953],
  "Slovenia": [14.9955, 46.1512],
  "Luxembourg": [6.1296, 49.8153],
  "Malta": [14.3754, 35.9375],
  "Cyprus": [33.4299, 35.1264],
  "Algeria": [1.6596, 28.0339],
  "Morocco": [-7.0926, 31.7917],
  "Tunisia": [9.5375, 33.8869],
  "Libya": [17.2283, 26.3351],
  "Sudan": [30.2176, 12.8628],
  "Ethiopia": [40.4897, 9.1450],
  "Democratic Republic of the Congo": [21.7587, -4.0383],
  "Tanzania": [34.8888, -6.3690],
  "Uganda": [32.2903, 1.3733],
  "Ghana": [-1.0232, 7.9465],
  "Ivory Coast": [-5.5471, 7.5400],
  "Cameroon": [12.3547, 7.3697],
  "Angola": [17.8739, -11.2027],
  "Mozambique": [35.5296, -18.6657],
  "Zambia": [27.8493, -13.1339],
  "Zimbabwe": [29.1549, -19.0154],
  "Madagascar": [46.8691, -18.7669],
  "Botswana": [24.6849, -22.3285],
  "Namibia": [18.4904, -22.9576],
  "Senegal": [-14.4524, 14.4974],
  "Mali": [-3.9962, 17.5707],
  "Burkina Faso": [-1.5616, 12.2383],
  "Niger": [8.0817, 17.6078],
  "Chad": [18.7322, 15.4542],
  "Somalia": [46.1996, 5.1521],
  "Afghanistan": [67.7099, 33.9391],
  "Kazakhstan": [66.9237, 48.0196],
  "Uzbekistan": [64.5853, 41.3775],
  "Turkmenistan": [59.5563, 38.9697],
  "Kyrgyzstan": [74.7661, 41.2044],
  "Tajikistan": [71.2761, 38.8610],
  "Nepal": [84.1240, 28.3949],
  "Sri Lanka": [80.7718, 7.8731],
  "Myanmar": [95.9562, 21.9162],
  "Cambodia": [104.9909, 12.5657],
  "Laos": [102.4955, 19.8563],
  "Mongolia": [103.8467, 46.8625],
  "Taiwan": [120.9605, 23.6978],
  "Hong Kong": [114.1694, 22.3193],
  "Macau": [113.5439, 22.1987],
  "North Korea": [127.5101, 40.3399],
  "Belarus": [27.9534, 53.7098],
  "Moldova": [28.3699, 47.4116],
  "Georgia": [43.3569, 42.3154],
  "Armenia": [45.0382, 40.0691],
  "Azerbaijan": [47.5769, 40.1431],
  "Kuwait": [47.4818, 29.3117],
  "Qatar": [51.1839, 25.3548],
  "Bahrain": [50.5577, 26.0667],
  "Oman": [55.9233, 21.4735],
  "Yemen": [48.5164, 15.5527],
  "Syria": [39.0494, 34.8021],
  "Jordan": [36.2384, 30.5852],
  "Lebanon": [35.8623, 33.8547],
  "Israel": [34.8516, 31.0461],
  "Palestine": [35.2332, 31.9522],
  "United Arab Emirates": [53.8478, 23.4241],
  "Cuba": [-77.7812, 21.5218],
  "Dominican Republic": [-70.1627, 18.7357],
  "Haiti": [-72.2852, 18.9712],
  "Jamaica": [-77.2975, 18.1096],
  "Puerto Rico": [-66.5901, 18.2208],
  "Guatemala": [-90.2308, 15.7835],
  "Honduras": [-86.2419, 15.1990],
  "El Salvador": [-88.8965, 13.7942],
  "Nicaragua": [-85.2072, 12.8654],
  "Costa Rica": [-83.7534, 9.7489],
  "Panama": [-80.7821, 8.5379],
  "Ecuador": [-78.1834, -1.8312],
  "Bolivia": [-63.5887, -16.2902],
  "Paraguay": [-58.4438, -23.4425],
  "Uruguay": [-55.7658, -32.5228],
  "Guyana": [-58.9302, 4.8604],
  "Suriname": [-56.0278, 3.9193],
  "French Guiana": [-53.1258, 3.9339],
}

// Function to calculate text width approximation
const calculateTextWidth = (text: string, fontSize: number = 10): number => {
  // Average character width approximation for the font
  const avgCharWidth = fontSize * 0.6
  return text.length * avgCharWidth
}

// Function to wrap text if it's too long
const wrapCountryName = (countryName: string, maxWidth: number = 80): string[] => {
  const words = countryName.split(' ')
  const lines: string[] = []
  let currentLine = ''

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const testWidth = calculateTextWidth(testLine)

    if (testWidth <= maxWidth) {
      currentLine = testLine
    } else {
      if (currentLine) {
        lines.push(currentLine)
      }
      currentLine = word
    }
  })

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
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
  showLegend = true,
  theme = "blue"
}: WorldMapProps) {
  const [autoMappedCountries, setAutoMappedCountries] = useState<Record<string, string[]>>({})

  // Use useMemo to prevent recreation on every render
  const countriesWithArticles = useMemo(() => {
    return countries.filter(country =>
      articlesByCountry[country] && articlesByCountry[country].length > 0
    )
  }, [countries, articlesByCountry])

  // Categorize countries into World, Region, and Country levels
  const { worldCountries, regionCountries, countryCountries } = useMemo(() => {
    const worldCountries = countriesWithArticles.filter(country => 
      SPECIAL_CASES[country as keyof typeof SPECIAL_CASES] === "ALL"
    )
    
    const regionCountries = countriesWithArticles.filter(country => 
      SPECIAL_CASES[country as keyof typeof SPECIAL_CASES] && 
      SPECIAL_CASES[country as keyof typeof SPECIAL_CASES] !== "ALL" &&
      !worldCountries.includes(country)
    )
    
    const countryCountries = countriesWithArticles.filter(country => 
      !worldCountries.includes(country) && !regionCountries.includes(country)
    )

    return { worldCountries, regionCountries, countryCountries }
  }, [countriesWithArticles])

  // Get the appropriate color based on country type
  const getCountryColor = (country: string): string => {
    const shades = THEME_SHADES[theme]
    
    if (worldCountries.includes(country)) {
      return shades.world
    } else if (regionCountries.includes(country)) {
      return shades.region
    } else {
      return shades.country
    }
  }

  // Auto-select countries on mount - ONLY countries with articles
  useEffect(() => {
    if (countriesWithArticles.length === 0) return

    const newMappings: Record<string, string[]> = {}

    countriesWithArticles.forEach(country => {
      const normalizedCountry = country.trim()

      // Handle special cases
      if (SPECIAL_CASES[normalizedCountry as keyof typeof SPECIAL_CASES]) {
        const specialCase = SPECIAL_CASES[normalizedCountry as keyof typeof SPECIAL_CASES]
        if (specialCase === "ALL") {
          newMappings[normalizedCountry] = ["ALL"]
        } else if (Array.isArray(specialCase)) {
          newMappings[normalizedCountry] = specialCase
        } else {
          newMappings[normalizedCountry] = [specialCase]
        }
      } else {
        // For regular countries, use the mapped name or original name
        const geoCountryName = COUNTRY_NAME_MAP[normalizedCountry] || normalizedCountry
        newMappings[normalizedCountry] = [geoCountryName]
      }
    })

    setAutoMappedCountries(newMappings)

    // Auto-map only countries with articles
    if (onCountryMapping) {
      Object.entries(newMappings).forEach(([legendCountry, geoCountries]) => {
        if (geoCountries[0] !== "ALL") {
          onCountryMapping(legendCountry, geoCountries[0])
        } else {
          onCountryMapping(legendCountry, "United States")
        }
      })
    }
  }, [countriesWithArticles, onCountryMapping])

  // Generate legend items with letters - ONLY for countries with articles
  const legendItems = useMemo(() => {
    // Sort countries by type: World first, then Regions, then Countries
    const sortedCountries = [...worldCountries, ...regionCountries, ...countryCountries]
    
    return sortedCountries.map((country, index) => ({
      country,
      letter: String.fromCharCode(65 + index),
      articles: articlesByCountry[country] || [],
      isMapped: true,
      isSpecialCase: !!SPECIAL_CASES[country as keyof typeof SPECIAL_CASES],
      color: getCountryColor(country),
      type: worldCountries.includes(country) ? "world" : 
            regionCountries.includes(country) ? "region" : "country"
    }))
  }, [worldCountries, regionCountries, countryCountries, articlesByCountry, getCountryColor])

  // Get all mapped geographic countries for highlighting - use normalized names
  const mappedGeoCountries = useMemo(() => {
    return Object.values(mappedCountries).map(country =>
      COUNTRY_NAME_MAP[country] || country
    )
  }, [mappedCountries])

  // Get all auto-mapped countries for highlighting (flatten the arrays) - use normalized names
  const allAutoMappedGeoCountries = useMemo(() => {
    return Object.values(autoMappedCountries)
      .flat()
      .map(country => COUNTRY_NAME_MAP[country] || country)
  }, [autoMappedCountries])

  // Check if we have any "ALL" special cases
  const hasGlobalCoverage = Object.values(autoMappedCountries).some(countries => countries[0] === "ALL")

  // Function to get coordinates for a country - SIMPLIFIED VERSION
  const getCountryCoordinates = (countryName: string): [number, number] | null => {
    // Check manual coordinates first
    if (MANUAL_COORDINATES[countryName]) {
      return MANUAL_COORDINATES[countryName]
    }

    // Use fallback coordinates - no complex geo data processing
    return FALLBACK_COORDINATES[countryName] || [0, 20]
  }

  // Function to normalize country name for comparison
  const normalizeCountryName = (countryName: string): string => {
    return COUNTRY_NAME_MAP[countryName] || countryName
  }

  // Function to get color for a specific geographic country
  const getColorForGeoCountry = (geoCountryName: string): string => {
    const normalizedGeoName = normalizeCountryName(geoCountryName)

    // Find which legend country this geographic country belongs to via explicit mapping
    const explicitLegendCountry = Object.entries(mappedCountries).find(
      ([_, geo]) => normalizeCountryName(geo) === normalizedGeoName
    )?.[0]

    if (explicitLegendCountry) {
      return getCountryColor(explicitLegendCountry)
    }

    // Check if this is part of a special case mapping (like EU)
    const specialCase = Object.entries(autoMappedCountries).find(([legendCountry, geoCountries]) =>
      geoCountries.some(geo => normalizeCountryName(geo) === normalizedGeoName)
    )?.[0]

    if (specialCase) {
      return getCountryColor(specialCase)
    }

    // If we have global coverage and no specific mapping, use the world country's color
    if (hasGlobalCoverage) {
      const worldCountry = worldCountries[0]
      return worldCountry ? getCountryColor(worldCountry) : THEME_SHADES[theme].world
    }

    // Default color for unmapped countries
    return "#D6D6DA"
  }

  // Function to check if a geographic country should be colored
  const shouldColorCountry = (geoCountryName: string): boolean => {
    const normalizedGeoName = normalizeCountryName(geoCountryName)

    // If we have global coverage, color ALL countries
    if (hasGlobalCoverage) {
      return true
    }

    // Check if this country is explicitly mapped
    const isExplicitlyMapped = mappedGeoCountries.includes(normalizedGeoName)

    // Check if this country is auto-mapped (like EU countries)
    const isAutoMapped = allAutoMappedGeoCountries.includes(normalizedGeoName)

    return isExplicitlyMapped || isAutoMapped
  }

  // Get all markers that should be displayed
  const getVisibleMarkers = () => {
    const markers: { key: string; coordinates: [number, number]; item: any }[] = []

    legendItems.forEach((item) => {
      // For global special cases (World/International), use predefined positions
      if (autoMappedCountries[item.country]?.[0] === "ALL") {
        const position = SPECIAL_MARKER_POSITIONS[item.country] || [0, 20]
        markers.push({
          key: item.country,
          coordinates: position,
          item: item
        })
      }
      // For EU and other multi-country special cases, show marker on representative country
      else if (autoMappedCountries[item.country] && autoMappedCountries[item.country].length > 1) {
        const representativeCountry = autoMappedCountries[item.country][0]
        const coordinates = getCountryCoordinates(representativeCountry)
        if (coordinates) {
          markers.push({
            key: item.country,
            coordinates: coordinates,
            item: item
          })
        }
      }
      // For regular countries, find their geographic position
      else {
        const geoCountry = mappedCountries[item.country]
        if (geoCountry) {
          const coordinates = getCountryCoordinates(geoCountry)
          if (coordinates) {
            markers.push({
              key: item.country,
              coordinates: coordinates,
              item: item
            })
          } else {
            console.log(`No coordinates found for: ${geoCountry} (mapped from: ${item.country})`)
          }
        } else {
          console.log(`No geographic country mapped for: ${item.country}`)
        }
      }
    })

    return markers
  }

  const visibleMarkers = getVisibleMarkers()

  return (
    <div className="w-full">
      {/* Map Container */}
      <div className="relative bg-slate-50 rounded-lg overflow-hidden mb-6 border border-gray-200">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 100,
            center: [0, 20]
          }}
          width={800}
          height={450}
          className="w-full h-auto"
        >
          <g>
            <Geographies geography={geoUrl}>
              {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo) => {
                  const geoName = geo.properties.name
                  const shouldColor = shouldColorCountry(geoName)
                  const countryColor = shouldColor ? getColorForGeoCountry(geoName) : "#D6D6DA"

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: {
                          fill: countryColor,
                          stroke: "#FFFFFF",
                          strokeWidth: 0.5,
                          outline: "none",
                        },
                        hover: {
                          fill: countryColor,
                          stroke: "#FFFFFF",
                          strokeWidth: 0.5,
                          outline: "none",
                          cursor: "default",
                        },
                        pressed: {
                          fill: countryColor,
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

            {/* Markers with Letters - show for ALL countries including special cases */}
            {visibleMarkers.map(({ key, coordinates, item }) => {
              // Wrap country name if it's too long
              const wrappedLines = wrapCountryName(item.country, 80)
              const lineHeight = 12
              const totalTextHeight = wrappedLines.length * lineHeight
              const bgPadding = 4
              const bgHeight = totalTextHeight + bgPadding * 2
              const bgWidth = Math.max(...wrappedLines.map(line => calculateTextWidth(line))) + bgPadding * 2

              // Determine position based on longitude
              const isRightSide = coordinates[0] > 0
              const textX = isRightSide ? 20 : -20
              const textAnchor = isRightSide ? "start" : "end"
              const bgX = isRightSide ? 15 : -15 - bgWidth
              const firstTextY = - (totalTextHeight / 2) + lineHeight / 2

              return (
                <Marker key={key} coordinates={coordinates}>
                  {/* Circle and letter */}
                  <circle
                    r={12}
                    fill={item.color}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                  <text
                    textAnchor="middle"
                    y={3}
                    style={{
                      fontFamily: "system-ui",
                      fill: "#FFFFFF",
                      fontSize: "12px",
                      fontWeight: "bold",
                      pointerEvents: "none"
                    }}
                  >
                    {item.letter}
                  </text>

                  {/* Country text with wrapped lines */}
                  <g>
                    {/* Background rectangle */}
                    <rect
                      x={bgX}
                      y={-bgHeight / 2}
                      width={bgWidth}
                      height={bgHeight}
                      fill="#000000"
                      rx={3}
                      opacity={0.9}
                    />
                    
                    {/* Wrapped text lines */}
                    {wrappedLines.map((line, index) => (
                      <text
                        key={index}
                        x={textX}
                        y={firstTextY + (index * lineHeight)}
                        textAnchor={textAnchor}
                        style={{
                          fontFamily: "system-ui",
                          fill: "#FFFFFF",
                          fontSize: "10px",
                          fontWeight: "bold",
                          pointerEvents: "none"
                        }}
                      >
                        {line}
                      </text>
                    ))}
                  </g>
                </Marker>
              )
            })}
          </g>
        </ComposableMap>

        {/* Debug info */}
        {interactive && (
          <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-md border border-blue-700 max-w-md">
            <p className="text-sm font-medium">
              Mapped {Object.keys(mappedCountries).length} of {countriesWithArticles.length} countries
            </p>
            <p className="text-xs mt-1">
              {visibleMarkers.length} markers displayed
            </p>
            {hasGlobalCoverage && (
              <p className="text-xs mt-1">
                Global coverage - all countries highlighted
              </p>
            )}
            <p className="text-xs mt-1">
              World: {worldCountries.length}, Regions: {regionCountries.length}, Countries: {countryCountries.length}
            </p>
          </div>
        )}
      </div>

      {/* Legend Section */}
      {showLegend && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {legendItems.map((item) => (
              <div
                key={item.country}
                className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-200"
                style={{ borderLeft: `4px solid ${item.color}` }}
              >
                {/* Legend Marker */}
                <div
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ backgroundColor: item.color }}
                >
                  <span className="text-white text-sm font-bold">{item.letter}</span>
                </div>

                {/* Country and Headlines */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <h4 className="font-medium text-gray-900 text-base">
                        {item.letter}. {item.country}
                      </h4>
             
                    </div>
                  </div>

                  {item.articles.length > 0 ? (
                    <ul className="space-y-1 mt-2">
                      {item.articles.map((article, idx) => (
                        <li key={article.news_id || idx} className="text-gray-600 text-sm">
                          • {article.news_title}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 text-sm mt-2">
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
