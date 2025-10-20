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
  const [activeCountry, setActiveCountry] = useState<string | null>(null)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save the current scroll position
      const scrollY = window.scrollY
      
      // Add styles to prevent scrolling
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.overflow = 'hidden'
      
      return () => {
        // Restore scrolling when modal closes
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  const handleCountryMapping = (legendCountry: string, geoCountry: string) => {
    if (geoCountry) {
      // Actual mapping from map click
      const alreadyMappedTo = Object.entries(mappedCountries).find(([_, geo]) => geo === geoCountry)?.[0]

      if (alreadyMappedTo) {
        // Unmap the previous country
        const newMappedCountries = { ...mappedCountries }
        delete newMappedCountries[alreadyMappedTo]
        setMappedCountries(newMappedCountries)
      }

      // Map the active legend country to this geographic country
      setMappedCountries({
        ...mappedCountries,
        [legendCountry]: geoCountry
      })
      setActiveCountry(null)
    } else {
      // Just setting active country from legend click
      setActiveCountry(legendCountry === activeCountry ? null : legendCountry)
    }
  }

  const handleRemoveMapping = (country: string) => {
    const newMappedCountries = { ...mappedCountries }
    delete newMappedCountries[country]
    setMappedCountries(newMappedCountries)
    if (activeCountry === country) {
      setActiveCountry(null)
    }
  }

  const handleConfirm = () => {
    onConfirm(mappedCountries)
    onClose()
  }

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
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Map Countries to Locations</h2>
          <p className="text-gray-600 mt-2">
            Click on a country in the legend, then click on the map to assign its location.
            All countries must be mapped before continuing.
          </p>
        </div>

        <div className="p-6">
          <WorldMap
            countries={countries}
            primaryColor={primaryColor}
            articlesByCountry={articlesByCountry}
            mappedCountries={mappedCountries}
            onCountryMapping={handleCountryMapping}
            onRemoveMapping={handleRemoveMapping}
            activeCountry={activeCountry}
            interactive={true}
          />
        </div>

        <div className="p-6 border-t flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {Object.keys(mappedCountries).length} of {countries.length} countries mapped
          </div>
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={Object.keys(mappedCountries).length !== countries.length}
              className="text-white font-bold py-2 px-6 rounded-lg"
              style={{ backgroundColor: primaryColor }}
            >
              Generate Bulletin
            </Button>
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

  // Function to format text with **bold** markers and justify text
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

  // Get articles by jurisdiction/country
  const getArticlesByJurisdiction = (jurisdiction: string) => {
    return articles.filter(article =>
      article.jurisdictions?.some(j =>
        j.name.toLowerCase().includes(jurisdiction.toLowerCase()) ||
        j.code?.toLowerCase().includes(jurisdiction.toLowerCase())
      )
    );
  }

  // Get articles by type/category
  const getArticlesByType = (type: string) => {
    return articles.filter(article =>
      article.type_value?.toLowerCase().includes(type.toLowerCase()) ||
      article.news_title?.toLowerCase().includes(type.toLowerCase())
    );
  }

  // Get international articles (not specific to a country)
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

  // Extract unique countries from articles for the map
  const getMapCountries = () => {
    const countrySet = new Set<string>();

    articles.forEach(article => {
      article.jurisdictions?.forEach(jurisdiction => {
        // Map jurisdiction names to WorldMap country names
        const countryName = jurisdiction.name;
        if (countryName && countryName !== "International") {
          countrySet.add(countryName);
        }
      });
    });

    // Add "International" if there are international articles
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

  const handleEditMapping = () => {
    setShowMappingModal(true)
  }

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
        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8 print:hidden">
          <Button
            onClick={onStartOver}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            Create New Bulletin
          </Button>
          <Button
            onClick={handleEditMapping}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
             style={{ backgroundColor: themeColors[theme] }}
          >
            Edit Country Mapping
          </Button>
          <Button
            onClick={handleDownloadPDF}
            className="text-white font-bold py-2 px-6 rounded-lg"
            style={{ backgroundColor: themeColors[theme] }}
          >
            Download PDF
          </Button>
        </div>

        {/* Printable Content */}
        <div className="print:block print:bg-white print:p-0 print:max-w-none">
          {/* Header Section - First Page */}
          <div className="relative mb-12 border-b pb-8 overflow-hidden print:mb-8 print:pb-6 print:min-h-[calc(29.7cm-2cm)] print:break-after-page">
            {/* Header Image Background */}
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

            {/* Header Content */}
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
          </div>

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
                interactive={false} // This makes the map non-interactive in final output
                showLegend={true}
              />
            </div>
          </div>

          {/* Key Trends Section */}
          <div className="mb-12 print:mb-8 print:min-h-[calc(29.7cm-2cm)] print:break-after-page">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-2 print:text-2xl print:mb-4">Key Trends</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-6">
              <div className="space-y-6 print:space-y-4">
                {getArticlesByType('trend').slice(0, Math.ceil(getArticlesByType('trend').length / 2)).map((article) => (
                  <div key={article.news_id} className="border-l-4 pl-4 py-2" style={{ borderColor: themeColors[theme] }}>
                    <h3 className="font-semibold text-gray-800 mb-2 print:text-sm">{article.news_title}</h3>
                    <div className="text-gray-700 text-sm">
                      {formatBoldText(article.news_summary)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6 print:space-y-4">
                {getArticlesByType('trend').slice(Math.ceil(getArticlesByType('trend').length / 2)).map((article) => (
                  <div key={article.news_id} className="border-l-4 pl-4 py-2" style={{ borderColor: themeColors[theme] }}>
                    <h3 className="font-semibold text-gray-800 mb-2 print:text-sm">{article.news_title}</h3>
                    <div className="text-gray-700 text-sm">
                      {formatBoldText(article.news_summary)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mb-12 bg-gradient-to-r from-blue-50 to-gray-50 p-8 rounded-lg border print:p-6 print:mb-8 print:bg-gray-50 print:min-h-[calc(29.7cm-2cm)] print:break-after-page">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 print:text-xl">Executive Summary</h2>
            <div className="text-gray-700 text-lg print:text-base">
              <p className="mb-4 text-justify indent-8 leading-relaxed">
                July 2025 marked a turning point in ESG disclosure—less about expansion, more about evolution. The EU led the charge with a sweeping simplification drive: trimming back the ESRS, lightening the Taxonomy load, and rolling out SME-friendly frameworks that prioritize usability over bureaucracy. Meanwhile, regulators like ESMA sharpened their focus on greenwashing, signaling tougher scrutiny ahead.
              </p>
              <p className="mb-4 text-justify indent-8 leading-relaxed">
                Across the Atlantic, U.S. ESG rulemaking hit turbulence. Legal roadblocks stalled federal momentum, but California filled the void with detailed climate disclosure guidance, proving that subnational leadership is alive and well.
              </p>
              <p className="mb-4 text-justify indent-8 leading-relaxed">
                Globally, a wave of pragmatic policymaking took hold. Japan and Nepal moved closer to mandatory sustainability reporting. Australia pushed to toughen its Modern Slavery Act, and Singapore equipped markets with transition-financing tools.
              </p>
              <p className="text-justify indent-8 leading-relaxed">
                At the same time, global standard-setters like GRI and SBTI refined their focus—on labor rights, fashion value chains, and credible net-zero accountability.
              </p>
              <p className="font-semibold mt-4 text-justify indent-8 leading-relaxed">
                The signal is clear: ESG disclosure is no longer about ticking every box. It's about making the right boxes count.
              </p>
            </div>
          </div>

          {/* European Union Section */}
          <section className="print:min-h-[calc(29.7cm-2cm)] print:break-after-page">
            <h2 className="text-4xl font-bold mb-8 text-gray-900 border-b pb-3 print:text-3xl print:mb-6">EUROPEAN UNION</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:gap-6">
              {getArticlesByJurisdiction('EU').map((article) => (
                <div key={article.news_id} className="border-l-4 pl-6 py-2" style={{ borderColor: themeColors[theme] }}>
                  <div className="flex items-start gap-3 mb-2 print:mb-1">
                    <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded print:text-2xs">
                      {article.jurisdictions?.[0]?.code || 'EU'}
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

          {/* United States Section */}
          <section className="print:min-h-[calc(29.7cm-2cm)] print:break-after-page">
            <h2 className="text-4xl font-bold mb-8 text-gray-900 border-b pb-3 print:text-3xl print:mb-6">UNITED STATES</h2>

            <div className="bg-gray-50 p-6 rounded-lg mb-8 print:p-4 print:mb-6">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 print:text-xl print:mb-3">U.S. ESG Disclosure: Progress, Pushback, and the Path Ahead</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 print:mb-3">
                {getArticlesByType('climate').slice(0, 3).map((article) => (
                  <div key={article.news_id} className="text-center">
                    <h4 className="font-semibold text-gray-800 mb-2 print:text-sm">{article.news_title}</h4>
                    <div className="text-gray-700 text-sm print:text-xs">
                      {formatBoldText(article.news_summary)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-gray-700 text-justify indent-8 leading-relaxed print:text-sm">
                Climate reporting in the U.S. is moving on two tracks—one driven forward by states like California, the other stalled in federal courts and agencies. July saw the EPA sidestep a legal challenge over delayed emissions data, while the SEC faced sharp internal criticism for retreating from its own climate rule litigation.
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:gap-6">
              {getArticlesByJurisdiction('US').map((article) => (
                <div key={article.news_id} className="border-l-4 pl-6 py-2" style={{ borderColor: themeColors[theme] }}>
                  <div className="flex items-start gap-3 mb-2 print:mb-1">
                    <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded print:text-2xs">
                      {article.jurisdictions?.[0]?.code || 'US'}
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

          {/* Global Sections */}
          <section className="print:min-h-[calc(29.7cm-2cm)] print:break-after-page">
            <h2 className="text-4xl font-bold mb-8 text-gray-900 border-b pb-3 print:text-3xl print:mb-6">ACROSS THE GLOBE</h2>

            <div className="bg-gray-50 p-6 rounded-lg mb-8 print:p-4 print:mb-6">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 print:text-xl print:mb-3">Global ESG Update: Targeted, Practical, and Gaining Speed</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 print:mb-3">
                {getArticlesByType('global').slice(0, 3).map((article) => (
                  <div key={article.news_id} className="text-center">
                    <h4 className="font-semibold text-gray-800 mb-2 print:text-sm">{article.news_title}</h4>
                    <div className="text-gray-700 text-sm print:text-xs">
                      {formatBoldText(article.news_summary)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-gray-700 text-justify indent-8 leading-relaxed print:text-sm">
                As sustainability pressures mount, global regulators and standard-setters are accelerating efforts to modernize ESG disclosure—while keeping flexibility and materiality in focus. July saw a wave of practical guidance and public consultations across Asia, Oceania, Europe, and beyond.
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:gap-6">
              {[
                ...getArticlesByJurisdiction('Singapore'),
                ...getArticlesByJurisdiction('Japan'),
                ...getArticlesByJurisdiction('Australia'),
                ...getArticlesByJurisdiction('Nepal'),
                ...getArticlesByJurisdiction('UK'),
                ...getInternationalArticles()
              ].map((article) => (
                <div key={article.news_id} className="border-l-4 pl-6 py-2" style={{ borderColor: themeColors[theme] }}>
                  <div className="flex items-center gap-3 mb-3 print:mb-2">
                    <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded print:text-2xs">
                      {article.jurisdictions?.[0]?.name?.toUpperCase() || 'INTERNATIONAL'}
                    </span>
                    {article.type_value && (
                      <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded print:text-2xs">
                        {article.type_value}
                      </span>
                    )}
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

          {/* Conclusion Section */}
          <div className="mt-16 bg-gradient-to-r from-gray-50 to-blue-50 p-8 rounded-lg border print:mt-12 print:p-6 print:bg-gray-50 print:min-h-[calc(29.7cm-2cm)] print:break-after-page">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 print:text-xl print:mb-4">Conclusion & Key Takeaways</h2>
            <div className="text-gray-700 text-lg space-y-4 print:text-base print:space-y-3">
              <p className="text-justify indent-8 leading-relaxed">
                This month's developments confirm what savvy ESG teams already know: agility and focus are no longer optional—they're essential.
              </p>
              <p className="text-justify indent-8 leading-relaxed">
                Regulators from Brussels to Tokyo are trimming complexity, dialing in on materiality, and embracing phased, proportional rollouts. Companies should seize this window to recalibrate their ESG strategies around what really matters: credible data, risk prioritization, and real-world impact.
              </p>
              <div className="mt-6 print:mt-4">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 print:text-lg print:mb-3">Now is the time to:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-justify print:text-sm">
                  <li>Streamline internal reporting systems in anticipation of simplified EU ESRS requirements.</li>
                  <li>Map readiness for jurisdiction-specific rules—especially if operating in California, Japan, or Australia.</li>
                  <li>Reassess supplier and sector exposure in light of rising scrutiny on labor practices and transition plans.</li>
                  <li>Align net-zero targets with updated SBTI expectations and review cycles.</li>
                  <li>Bolster disclosure claims with evidence to avoid greenwashing risks under growing regulatory glare.</li>
                </ul>
              </div>
              <p className="font-semibold text-gray-800 mt-6 text-justify indent-8 leading-relaxed print:mt-4">
                Whether you're a global reporter or a regional player, ESG disclosure is entering a sharper, leaner, more accountable phase. Stay proactive, stay credible—and stay ahead.
              </p>
            </div>
          </div>

          {/* Footer Image */}
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
                    <span>info@Scoralytics.com</span>
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

        {/* Enhanced Print Styles */}
       <style jsx global>{`
          @media print {
            /* Hide map in print */
            .print\\:hidden {
              display: none !important;
            }
            
            /* Reset everything for print */
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
            
            /* Hide non-printable elements */
            button, .print\\:hidden {
              display: none !important;
            }
            
            /* Container adjustments */
            .container {
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
            }
            
            /* Page setup */
            @page {
              size: A4;
              margin: 1cm;
              marks: crop cross;
            }
            
            /* Force page breaks */
            .print\\:break-after-page {
              page-break-after: always !important;
              break-after: page !important;
            }
            
            .print\\:break-before-page {
              page-break-before: always !important;
              break-before: page !important;
            }
            
            /* Ensure minimum height for pages */
            .print\\:min-h-\\[calc\\(29\\.7cm-2cm\\)\\] {
              min-height: calc(29.7cm - 2cm) !important;
            }
            
            /* Color adjustments for print */
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
            
            /* Background colors */
            .bg-white {
              background: white !important;
            }
            
            .bg-gray-50, .bg-blue-50 {
              background: #f8f9fa !important;
            }
            
            /* Remove decorative elements that don't print well */
            .shadow-lg, .shadow-md, .rounded-lg, .rounded {
              box-shadow: none !important;
              border-radius: 0 !important;
            }
            
            /* Fix positioning */
            .relative .absolute {
              position: relative !important;
            }
            
            /* Font sizing for print */
            h1 { font-size: 24pt !important; line-height: 1.2 !important; }
            h2 { font-size: 18pt !important; line-height: 1.3 !important; }
            h3 { font-size: 14pt !important; line-height: 1.3 !important; }
            h4 { font-size: 12pt !important; line-height: 1.3 !important; }
            p, li { font-size: 11pt !important; line-height: 1.4 !important; }
            .text-sm { font-size: 10pt !important; }
            .text-xs { font-size: 9pt !important; }
            .text-2xs { font-size: 8pt !important; }
            
            /* Ensure proper image sizing */
            img {
              max-width: 100% !important;
              height: auto !important;
            }
            
            /* Improve text readability */
            .text-justify {
              text-align: justify !important;
            }
            
            .leading-relaxed {
              line-height: 1.6 !important;
            }
            
            /* Ensure proper spacing */
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
          
          /* Screen styles */
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