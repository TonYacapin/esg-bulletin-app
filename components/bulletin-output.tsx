"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { WorldMap } from "./world-map"
import type { BulletinData } from "./bulletin-generator"

interface BulletinOutputProps {
  data: BulletinData
  onStartOver: () => void
}

interface CountryMappingModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (mappings: Record<string, string>) => void
  countries: string[]
  primaryColor: string
  articlesByCountry: Record<string, any[]>
}

function CountryMappingModal({
  isOpen,
  onClose,
  onConfirm,
  countries,
  primaryColor,
  articlesByCountry
}: CountryMappingModalProps) {
  const [mappedCountries, setMappedCountries] = useState<Record<string, string>>({})
  const [hasAutoMapped, setHasAutoMapped] = useState(false)

  const COUNTRY_NAME_MAP: Record<string, string> = {
    "United States of America": "United States",
    "United Kingdom": "United Kingdom",
    "Dem. Rep. Congo": "Democratic Republic of the Congo",
    "Czechia": "Czech Republic",
    "Bosnia and Herz.": "Bosnia and Herzegovina",
    "Dominican Rep.": "Dominican Republic",
  }

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

  const findMatchingCountries = (countryName: string): string[] => {
    const matches: string[] = []
    
    const exactMatch = Object.keys(COUNTRY_NAME_MAP).find(
      geoName => geoName.toLowerCase() === countryName.toLowerCase()
    ) || Object.values(COUNTRY_NAME_MAP).find(
      mappedName => mappedName.toLowerCase() === countryName.toLowerCase()
    )
    
    if (exactMatch) {
      matches.push(COUNTRY_NAME_MAP[exactMatch] || exactMatch)
      return matches
    }
    
    Object.keys(COUNTRY_NAME_MAP).forEach(geoName => {
      if (geoName.toLowerCase().includes(countryName.toLowerCase()) || 
          countryName.toLowerCase().includes(geoName.toLowerCase())) {
        matches.push(COUNTRY_NAME_MAP[geoName] || geoName)
      }
    })
    
    Object.values(COUNTRY_NAME_MAP).forEach(mappedName => {
      if (mappedName.toLowerCase().includes(countryName.toLowerCase()) || 
          countryName.toLowerCase().includes(mappedName.toLowerCase())) {
        matches.push(mappedName)
      }
    })
    
    return [...new Set(matches)]
  }

  useEffect(() => {
    if (isOpen && !hasAutoMapped) {
      const autoMappings: Record<string, string> = {}
      
      countries.forEach(country => {
        const normalizedCountry = country.trim()
        
        if (SPECIAL_CASES[normalizedCountry as keyof typeof SPECIAL_CASES]) {
          const specialCase = SPECIAL_CASES[normalizedCountry as keyof typeof SPECIAL_CASES]
          if (specialCase === "ALL") {
            autoMappings[normalizedCountry] = "United States"
          } else {
            autoMappings[normalizedCountry] = "Germany"
          }
        } else {
          const matchedCountries = findMatchingCountries(normalizedCountry)
          if (matchedCountries.length > 0) {
            autoMappings[normalizedCountry] = matchedCountries[0]
          } else {
            autoMappings[normalizedCountry] = normalizedCountry
          }
        }
      })

      setMappedCountries(autoMappings)
      setHasAutoMapped(true)
      
      setTimeout(() => {
        onConfirm(autoMappings)
        onClose()
      }, 500)
    }
  }, [isOpen, countries, hasAutoMapped, onConfirm, onClose])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Auto-Mapping Countries</h2>
          <p className="text-gray-600 mt-2">
            Automatically mapping {countries.length} countries to their geographic locations...
          </p>
          <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <strong>Auto-mapping in progress:</strong> All countries are being automatically mapped. 
              Special cases like "European Union", "International", and "World" are handled automatically.
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Mapping countries...</p>
              <p className="text-sm text-gray-500 mt-2">
                {Object.keys(mappedCountries).length} of {countries.length} countries mapped
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function BulletinOutput({ data, onStartOver }: BulletinOutputProps) {
  const { theme, articles, articlesByCountry, bulletinConfig } = data
  const [showMappingModal, setShowMappingModal] = useState(true)
  const [countryMappings, setCountryMappings] = useState<Record<string, string>>({})

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
  
  const formatConfigDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  const formatBoldText = (text: string) => {
    if (!text) return "";

    const sentences = text.split(/(?<=[.!?])\s+/);

    return (
      <div className="text-justify leading-relaxed">
        {sentences.map((sentence, index) => {
          const formattedSentence = sentence.split(/(\*\*.*?\*\*)/g).map((part, partIndex) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              const boldText = part.slice(2, -2);
              return (
                <strong key={partIndex} className="font-bold">
                  {boldText}
                </strong>
              );
            }
            return part;
          });

          if (index === 0) {
            return (
              <span key={index} className="inline-block">
                <span className="inline-block w-8">{"\u00A0"}</span>
                {formattedSentence}
              </span>
            );
          }

          return (
            <span key={index}>
              {" "}{formattedSentence}
            </span>
          );
        })}
      </div>
    );
  }

  const getArticlesByJurisdiction = (jurisdiction: string) => {
    return articles.filter(article =>
      article.jurisdictions?.some(j =>
        j.name.toLowerCase().includes(jurisdiction.toLowerCase()) ||
        j.code?.toLowerCase().includes(jurisdiction.toLowerCase())
      )
    );
  }

  const getArticlesByType = (type: string) => {
    return articles.filter(article =>
      article.type_value?.toLowerCase().includes(type.toLowerCase()) ||
      article.news_title?.toLowerCase().includes(type.toLowerCase())
    );
  }

  const getInternationalArticles = () => {
    return articles.filter(article =>
      !article.jurisdictions?.some(j =>
        ['united states', 'us', 'eu', 'european union', 'germany', 'united kingdom', 'uk',
          'australia', 'singapore', 'japan', 'nepal'].includes(j.name.toLowerCase())
      )
    );
  }

  const handleDownloadPDF = () => {
    window.print();
  }

  const getMapCountries = () => {
    const countrySet = new Set<string>();

    articles.forEach(article => {
      article.jurisdictions?.forEach(jurisdiction => {
        const countryName = jurisdiction.name;
        if (countryName && countryName !== "International") {
          countrySet.add(countryName);
        }
      });
    });

    if (getInternationalArticles().length > 0) {
      countrySet.add("International");
    }

    return Array.from(countrySet);
  }

  const mapCountries = getMapCountries();

  const handleMappingConfirm = (mappings: Record<string, string>) => {
    setCountryMappings(mappings)
    setShowMappingModal(false)
  }

  // Helper function to render bullet points from generated content
  const renderBulletPoints = (content: string) => {
    if (!content) return null;
    
    const lines = content.split('\n').filter(line => line.trim());
    return (
      <div className="space-y-3">
        {lines.map((line, index) => (
          <div key={index} className="flex items-start">
            <span className="text-lg mr-2 mt-1">•</span>
            <span className="text-gray-700">{line.trim()}</span>
          </div>
        ))}
      </div>
    );
  };

  // Helper function to render section with custom title and introduction
  const renderRegionalSection = (region: 'euSection' | 'usSection' | 'globalSection') => {
    const sectionConfig = bulletinConfig?.[region];
    const articles = getArticlesByJurisdiction(region === 'euSection' ? 'EU' : region === 'usSection' ? 'US' : '');
    
    if (!sectionConfig?.enabled || articles.length === 0) return null;

    return (
      <section className="print:min-h-[calc(29.7cm-2cm)] print:break-after-page">
        <h2 className="text-4xl font-bold mb-8 text-gray-900 border-b pb-3 print:text-3xl print:mb-6">
          {sectionConfig.title || region.replace('Section', '').toUpperCase()}
        </h2>
        
        {/* Section Introduction */}
        {sectionConfig.introduction && (
          <div className="bg-gray-50 p-6 rounded-lg mb-8 print:p-4 print:mb-6">
            <div className="text-gray-700 text-justify leading-relaxed print:text-sm">
              {formatBoldText(sectionConfig.introduction)}
            </div>
          </div>
        )}

        {/* Section Key Trends - use optional trends property if present */}
        {sectionConfig.keyTrends && ('trends' in sectionConfig) && (sectionConfig as any).trends && (
          <div className="mb-8 print:mb-6">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800 print:text-xl print:mb-3">
              {region.replace('Section', '')} Key Trends
            </h3>
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 print:p-4">
              {renderBulletPoints((sectionConfig as any).trends)}
            </div>
          </div>
        )}

        {/* Articles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:gap-6">
          {articles.map((article) => (
            <div key={article.news_id} className="border-l-4 pl-6 py-2" style={{ borderColor: themeColors[theme] }}>
              <div className="flex items-start gap-3 mb-2 print:mb-1">
                <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded print:text-2xs">
                  {article.jurisdictions?.[0]?.code || region.replace('Section', '').toUpperCase()}
                </span>
                <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded print:text-2xs">
                  {article.type_value}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 print:text-lg print:mb-2">{article.news_title}</h3>

              {article.imageUrl && (
                <div className="mb-4 print:mb-3">
                  <img
                    src={article.imageUrl}
                    alt={`Illustration for ${article.news_title}`}
                    className="w-full h-auto rounded-lg shadow-md border border-gray-200 print:max-h-32"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}

              <div className="text-gray-700 mb-4 print:text-sm">
                {formatBoldText(article.news_summary)}
              </div>
              <div className="text-sm text-gray-500 print:text-xs">
                Published: {formatDate(article.published_at)}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <>
      <CountryMappingModal
        isOpen={showMappingModal}
        onClose={() => setShowMappingModal(false)}
        onConfirm={handleMappingConfirm}
        countries={mapCountries}
        primaryColor={themeColors[theme]}
        articlesByCountry={articlesByCountry}
      />

      <div className={`container mx-auto p-8 max-w-6xl bg-white ${showMappingModal ? 'overflow-hidden' : ''}`}>
        <div className="flex justify-center gap-4 mb-8 print:hidden">
          <Button
            onClick={onStartOver}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            Create New Bulletin
          </Button>
          <Button
            onClick={handleDownloadPDF}
            className="text-white font-bold py-2 px-6 rounded-lg"
            style={{ backgroundColor: themeColors[theme] }}
          >
            Download PDF
          </Button>
        </div>

        <div className="print:block print:bg-white print:p-0 print:max-w-none">
    
          <div className="relative mb-12 border-b pb-8 overflow-hidden print:mb-8 print:pb-6 print:min-h-[calc(29.7cm-2cm)] print:break-after-page">
            {bulletinConfig?.headerImage && (
              <div className="absolute inset-0 z-0 print:relative print:inset-auto print:h-64">
                <img
                  src={bulletinConfig.headerImage}
                  alt="Header Background"
                  className="w-full h-full object-cover print:h-64 print:object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div className="absolute inset-0 bg-black/50 print:bg-black/30"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white/60 print:hidden"></div>
              </div>
            )}

            <div className="relative z-10 text-center flex flex-col items-center print:relative print:z-auto">
              <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-5xl mx-auto px-6 print:px-0 print:max-w-full">
                <h1
                  className="text-5xl font-bold mb-6 text-white tracking-tight leading-tight text-center sm:text-left break-words print:text-4xl print:text-black print:mb-4"
                  dangerouslySetInnerHTML={{
                    __html: (() => {
                      const header =
                        bulletinConfig?.headerText ||
                        "ESG DISCLOSURE & REPORTING BULLETIN";
                      const words = header.split(" ");
                      const mid = Math.ceil(words.length / 2);
                      return (
                        words.slice(0, mid).join(" ") +
                        "<br />" +
                        words.slice(mid).join(" ")
                      );
                    })(),
                  }}
                />

                {bulletinConfig?.publisherLogo && (
                  <img
                    src={bulletinConfig.publisherLogo}
                    alt="Publisher Logo"
                    className="h-20 w-auto object-contain mt-4 sm:mt-0 sm:ml-8 print:h-16 print:mt-2"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
              </div>

              <div className="mt-6 flex justify-start w-full max-w-5xl mx-auto px-6 text-lg font-semibold text-white print:px-0 print:max-w-full print:mt-4 print:text-base">
                <span className="px-4 py-2 rounded-lg print:bg-transparent print:px-0">
                  {bulletinConfig?.issueNumber || "Issue #10"} |{" "}
                  {bulletinConfig?.publicationDate
                    ? formatConfigDate(bulletinConfig.publicationDate)
                    : "Current Month"}
                </span>
              </div>
            </div>
                  {/* Greeting Message */}
          {bulletinConfig?.greetingMessage && (
            <div className="mb-12 bg-gradient-to-r from-blue-50 to-gray-50 p-8 rounded-lg border print:p-6 print:mb-8 print:bg-gray-50 print:min-h-[calc(29.7cm-2cm)] print:break-after-page">
              <div className="italic text-gray-700 text-lg text-justify leading-relaxed print:text-base">
                {formatBoldText(bulletinConfig.greetingMessage)}
              </div>
            </div>
          )}

          </div>

         
          {/* {bulletinConfig?.tableOfContents && (
            <div className="mb-12 print:mb-8 print:min-h-[calc(29.7cm-2cm)] print:break-after-page">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-2 print:text-2xl print:mb-4">
                Table of Contents
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
                <div className="space-y-3 print:space-y-2">
                  <h3 className="font-semibold text-gray-800">Main Sections</h3>
                  <ul className="space-y-2 print:space-y-1">
                    <li className="text-gray-700">• Global Coverage Map</li>
                    <li className="text-gray-700">• 5 Key Trends</li>
                    <li className="text-gray-700">• Executive Summary</li>
                    {bulletinConfig?.euSection?.enabled && <li className="text-gray-700">• {bulletinConfig.euSection.title || "EU Section"}</li>}
                    {bulletinConfig?.usSection?.enabled && <li className="text-gray-700">• {bulletinConfig.usSection.title || "US Section"}</li>}
                    {bulletinConfig?.globalSection?.enabled && <li className="text-gray-700">• {bulletinConfig.globalSection.title || "Global Section"}</li>}
                    <li className="text-gray-700">• Key Takeaways</li>
                  </ul>
                </div>
                <div className="space-y-3 print:space-y-2">
                  <h3 className="font-semibold text-gray-800">Additional Sections</h3>
                  <ul className="space-y-2 print:space-y-1">
                    {bulletinConfig?.calendarMinutes && <li className="text-gray-700">• Calendar - Minutes</li>}
                    {bulletinConfig?.keepAnEyeOn && <li className="text-gray-700">• Keep An Eye On</li>}
                    {bulletinConfig?.comingEvents && <li className="text-gray-700">• Coming Events</li>}
                  </ul>
                </div>
              </div>
            </div>
          )} */}

          {/* Interactive World Map */}
          {bulletinConfig?.interactiveMap && (
            <div className="mb-12 print:mb-8 print:min-h-[calc(29.7cm-2cm)] print:break-after-page">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-2 print:text-2xl print:mb-4">
                Global Coverage Map
              </h2>
              <div className="bg-white rounded-lg border border-gray-200 p-6 print:p-4">
                <WorldMap
                  countries={mapCountries}
                  primaryColor={themeColors[theme]}
                  articlesByCountry={articlesByCountry}
                  mappedCountries={countryMappings}
                  interactive={false}
                  showLegend={true}
                />
              </div>
            </div>
          )}

          {/* 5 Key Trends */}
          {bulletinConfig?.keyTrends && bulletinConfig?.generatedContent?.keyTrends && (
            <div className="mb-12 print:mb-8 print:min-h-[calc(29.7cm-2cm)] print:break-after-page">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-2 print:text-2xl print:mb-4">5 Key Trends</h2>
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 print:p-4">
                {renderBulletPoints(bulletinConfig.generatedContent.keyTrends)}
              </div>
            </div>
          )}

          {/* Executive Summary */}
          {bulletinConfig?.executiveSummary && bulletinConfig?.generatedContent?.executiveSummary && (
            <div className="mb-12 bg-gradient-to-r from-blue-50 to-gray-50 p-8 rounded-lg border print:p-6 print:mb-8 print:bg-gray-50 print:min-h-[calc(29.7cm-2cm)] print:break-after-page">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 print:text-xl">Executive Summary</h2>
              <div className="text-gray-700 text-lg print:text-base">
                {formatBoldText(bulletinConfig.generatedContent.executiveSummary)}
              </div>
            </div>
          )}

          {/* Regional Sections */}
          {renderRegionalSection('euSection')}
          {renderRegionalSection('usSection')}
          {renderRegionalSection('globalSection')}

          {/* Key Takeaways */}
          {bulletinConfig?.keyTakeaways && bulletinConfig?.generatedContent?.keyTakeaways && (
            <div className="mt-16 bg-gradient-to-r from-gray-50 to-blue-50 p-8 rounded-lg border print:mt-12 print:p-6 print:bg-gray-50 print:min-h-[calc(29.7cm-2cm)] print:break-after-page">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 print:text-xl print:mb-4">Conclusion & Key Takeaways</h2>
              <div className="text-gray-700 text-lg space-y-4 print:text-base print:space-y-3">
                {formatBoldText(bulletinConfig.generatedContent.keyTakeaways)}
              </div>
            </div>
          )}

          {bulletinConfig?.footerImage && (
            <div className="relative mt-12 pt-8 border-t overflow-hidden h-48 print:mt-8 print:h-40 print:min-h-[calc(29.7cm-2cm)] print:break-after-page">
              <div className="absolute inset-0 z-0 print:relative print:inset-auto">
                <img
                  src={bulletinConfig.footerImage}
                  alt="Footer Background"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div className="absolute inset-0 bg-black/50 print:bg-black/30"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/60 print:hidden"></div>
              </div>

              <div className="relative z-10 h-full flex flex-col justify-center items-center text-center print:relative print:z-auto">
                <div className="text-white print:text-black">
                  <div className="flex justify-center space-x-8 mb-4 text-lg print:text-base print:space-x-6">
                    <span>info@example.com</span>
                    <span>Subscribe</span>
                    <span>About</span>
                  </div>
                  <div className="text-sm print:text-xs">
                    Generated on {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <style jsx global>{`
          @media print {
            .print\\:hidden {
              display: none !important;
            }
            
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              box-sizing: border-box;
            }
            
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              font-family: 'Times New Roman', Times, serif !important;
              line-height: 1.4;
            }
            
            button, .print\\:hidden {
              display: none !important;
            }
            
            .container {
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
            }
            
            @page {
              size: A4;
              margin: 1cm;
              marks: crop cross;
            }
            
            .print\\:break-after-page {
              page-break-after: always !important;
              break-after: page !important;
            }
            
            .print\\:break-before-page {
              page-break-before: always !important;
              break-before: page !important;
            }
            
            .print\\:min-h-\\[calc\\(29\\.7cm-2cm\\)\\] {
              min-height: calc(29.7cm - 2cm) !important;
            }
            
            .text-white {
              color: black !important;
            }
            
            .text-gray-700 {
              color: #374151 !important;
            }
            
            .text-gray-800 {
              color: #1f2937 !important;
            }
            
            .text-gray-900 {
              color: #111827 !important;
            }
            
            .bg-white {
              background: white !important;
            }
            
            .bg-gray-50, .bg-blue-50, .bg-purple-50 {
              background: #f8f9fa !important;
            }
            
            .shadow-lg, .shadow-md, .rounded-lg, .rounded {
              box-shadow: none !important;
              border-radius: 0 !important;
            }
            
            .relative .absolute {
              position: relative !important;
            }
            
            h1 { font-size: 24pt !important; line-height: 1.2 !important; }
            h2 { font-size: 18pt !important; line-height: 1.3 !important; }
            h3 { font-size: 14pt !important; line-height: 1.3 !important; }
            h4 { font-size: 12pt !important; line-height: 1.3 !important; }
            p, li { font-size: 11pt !important; line-height: 1.4 !important; }
            .text-sm { font-size: 10pt !important; }
            .text-xs { font-size: 9pt !important; }
            .text-2xs { font-size: 8pt !important; }
            
            img {
              max-width: 100% !important;
              height: auto !important;
            }
            
            .text-justify {
              text-align: justify !important;
            }
            
            .leading-relaxed {
              line-height: 1.6 !important;
            }
            
            .print\\:mb-8 { margin-bottom: 2rem !important; }
            .print\\:mb-6 { margin-bottom: 1.5rem !important; }
            .print\\:mb-4 { margin-bottom: 1rem !important; }
            .print\\:mb-3 { margin-bottom: 0.75rem !important; }
            .print\\:mb-2 { margin-bottom: 0.5rem !important; }
            .print\\:mb-1 { margin-bottom: 0.25rem !important; }
            
            .print\\:mt-12 { margin-top: 3rem !important; }
            .print\\:mt-8 { margin-top: 2rem !important; }
            .print\\:mt-6 { margin-top: 1.5rem !important; }
            .print\\:mt-4 { margin-top: 1rem !important; }
            
            .print\\:space-y-4 > * + * { margin-top: 1rem !important; }
            .print\\:space-y-3 > * + * { margin-top: 0.75rem !important; }
            
            .print\\:gap-6 { gap: 1.5rem !important; }
            .print\\:gap-4 { gap: 1rem !important; }
            
            .print\\:p-6 { padding: 1.5rem !important; }
            .print\\:p-4 { padding: 1rem !important; }
          }
          
          @media screen {
            .print\\:min-h-\\[calc\\(29\\.7cm-2cm\\)\\] {
              min-height: auto !important;
            }
          }
        `}</style>
      </div>
    </>
  )
}