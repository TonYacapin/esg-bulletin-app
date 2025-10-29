"use client"

import type { BulletinData } from "./bulletin-generator"

interface ProfessionalBulletinTemplateProps {
  data: BulletinData
  theme: "blue" | "green" | "red"
}

const themeColors = {
  blue: {
    primary: "#0066cc",
    light: "#e6f2ff",
    dark: "#003d99",
    accent: "#0052a3",
  },
  green: {
    primary: "#00a86b",
    light: "#e6f9f0",
    dark: "#006b47",
    accent: "#008c5a",
  },
  red: {
    primary: "#cc0000",
    light: "#ffe6e6",
    dark: "#990000",
    accent: "#b30000",
  },
}

export function ProfessionalBulletinTemplate({ data, theme }: ProfessionalBulletinTemplateProps) {
  const colors = themeColors[theme]
  const config = data.bulletinConfig
  const today = new Date()
  const month = today.toLocaleString("default", { month: "long" })
  const year = today.getFullYear()

  // Group articles by country
  const sortedCountries = Object.keys(data.articlesByCountry).sort()

  // Create country letter mapping
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
    <div className="bg-white text-gray-900 font-serif">
      {/* ===== COVER PAGE ===== */}
      <div
        className="bulletin-page min-h-screen flex flex-col justify-between p-12 border-b-4"
        style={{ borderColor: colors.primary }}
      >
        {/* Header */}
        <div>
          <div className="flex justify-between items-start mb-16">
            <div>
              <h1 className="text-5xl font-bold tracking-widest" style={{ color: colors.primary }}>
                ESG
              </h1>
              <h2 className="text-4xl font-bold tracking-widest mt-2" style={{ color: colors.primary }}>
                REGULATORY BULLETIN
              </h2>
              <p className="text-sm font-semibold text-gray-600 mt-4">
                Issue {config?.issueNumber || "#10"} | {month} {year}
              </p>
            </div>
            <div className="text-right text-xs text-gray-500">
              <p>info@Scorealytics.com</p>
              <p>Subscribe | About</p>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="mt-12 max-w-3xl">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Welcome to our ESG Regulatory SCORE Bulletin!</h3>
            <p className="text-sm leading-relaxed text-gray-700 mb-4">
              {config?.greetingMessage ||
                `${month} is here—sun-soaked, storm-swirled, and sizzling with ESG updates. Whether you're cooling off with a rooftop spritz or melting into your keyboard under deadline pressure, one thing's for sure: regulators haven't hit the snooze button.`}
            </p>
            <p className="text-sm leading-relaxed text-gray-700">
              From Europe's recycling rebellions to policy pivots across the Americas and Asia, this month's edition
              serves up a global sampler of heatwaves, high stakes, and headline-grabbing reforms. So grab your shades,
              sip something iced, and get ready to breeze through your ESG briefings.
            </p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="mt-16">
          <h3 className="text-lg font-bold text-center mb-8 text-gray-900">In This Issue</h3>
          <div className="grid grid-cols-3 gap-8 text-xs">
            {sortedCountries.map((country) => (
              <div key={country}>
                <div className="flex items-center mb-3 pb-2 border-b-2" style={{ borderColor: colors.light }}>
                  <h5 className="font-bold text-gray-900">{country}</h5>
                  <span className="ml-auto font-bold" style={{ color: colors.primary }}>
                    {countryLetterMap[country] || "•"}
                  </span>
                </div>
                <ul className="space-y-1">
                  {data.articlesByCountry[country].slice(0, 5).map((article) => (
                    <li key={article.news_id} className="text-gray-600 text-xs leading-tight">
                      • {article.news_title}
                    </li>
                  ))}
                  {data.articlesByCountry[country].length > 5 && (
                    <li className="text-gray-500 text-xs italic">+{data.articlesByCountry[country].length - 5} more</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 pt-8 border-t border-gray-300">
          <p>info@Scorealytics.com | Subscribe | About</p>
          <p className="mt-2">Home Button</p>
        </div>
      </div>

      {/* ===== EXECUTIVE SUMMARY PAGE ===== */}
      {config?.executiveSummary && (
        <div className="bulletin-page min-h-screen p-12 border-b-4" style={{ borderColor: colors.primary }}>
          <h2 className="text-3xl font-bold mb-8 pb-4 border-b-2" style={{ borderColor: colors.primary }}>
            Executive Summary
          </h2>

          <div className="grid grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="font-bold text-sm mb-3" style={{ color: colors.primary }}>
                Key Trends
              </h3>
              <ul className="text-sm space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="mr-3 font-bold" style={{ color: colors.primary }}>
                    •
                  </span>
                  <span>
                    Regulatory Polarization Deepens: ESG policies are expanding in some regions, retreating in others.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 font-bold" style={{ color: colors.primary }}>
                    •
                  </span>
                  <span>Traceability is the New Norm: Global supply chains face stricter tracking mandates.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 font-bold" style={{ color: colors.primary }}>
                    •
                  </span>
                  <span>Climate Action is Becoming More Sector-Specific.</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-sm mb-3" style={{ color: colors.primary }}>
                Regional Highlights
              </h3>
              <ul className="text-sm space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="mr-3 font-bold" style={{ color: colors.primary }}>
                    •
                  </span>
                  <span>EU: Circularity Enforced with new waste and battery regulations</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 font-bold" style={{ color: colors.primary }}>
                    •
                  </span>
                  <span>US: Regulatory rollbacks hit climate and clean energy</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 font-bold" style={{ color: colors.primary }}>
                    •
                  </span>
                  <span>Global: Human rights and labor protections gaining legal teeth</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded border-l-4" style={{ borderColor: colors.primary }}>
            <p className="text-sm leading-relaxed text-gray-700">
              {config?.generatedContent?.executiveSummary ||
                "This month's ESG developments demand more than passive reading—they call for active recalibration. Regulators are not just tweaking rules; they're rewriting playbooks. From Europe's digitized waste tracking to Brazil's rural credit reform, compliance teams must prepare for significant changes across multiple sectors."}
            </p>
          </div>

          <div className="mt-12 text-xs text-gray-500 text-center">
            <p>Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      )}

      {/* ===== REGIONAL SECTIONS ===== */}
      {sortedCountries.map((country, index) => (
        <div
          key={country}
          className="bulletin-page min-h-screen p-12 border-b-4"
          style={{ borderColor: colors.primary }}
        >
          <div
            className="flex items-center justify-between mb-8 pb-4 border-b-2"
            style={{ borderColor: colors.primary }}
          >
            <h2 className="text-3xl font-bold">{country}</h2>
            <span className="text-4xl font-bold" style={{ color: colors.light }}>
              {countryLetterMap[country] || "•"}
            </span>
          </div>

          <div className="space-y-8">
            {data.articlesByCountry[country].map((article) => (
              <article key={article.news_id} className="border-b pb-6">
                <h3 className="text-lg font-bold mb-2 text-gray-900">{article.news_title}</h3>
                <p className="text-xs font-semibold mb-3" style={{ color: colors.primary }}>
                  {article.type} • {new Date(article.published_at).toLocaleDateString()}
                </p>
                <p className="text-sm leading-relaxed text-gray-700 mb-3">{article.news_summary}</p>
                {article.news_content && (
                  <p className="text-xs text-gray-600 leading-relaxed">{article.news_content.substring(0, 200)}...</p>
                )}
              </article>
            ))}
          </div>

          <div className="mt-12 text-xs text-gray-500 text-center">
            <p>info@Scorealytics.com | Subscribe | About</p>
          </div>
        </div>
      ))}

      {/* ===== CONCLUSION PAGE ===== */}
      <div
        className="bulletin-page min-h-screen p-12 flex flex-col justify-between border-b-4"
        style={{ borderColor: colors.primary }}
      >
        <div>
          <h2 className="text-3xl font-bold mb-8 pb-4 border-b-2" style={{ borderColor: colors.primary }}>
            Conclusion & Key Takeaways
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-sm mb-3" style={{ color: colors.primary }}>
                For Compliance Teams
              </h3>
              <p className="text-sm leading-relaxed text-gray-700">
                Prepare for the EU's digitized waste tracking (DIWASS), tighter battery recovery mandates, and upcoming
                enforcement of occupational exposure limits. Audit your systems for alignment—especially in chemicals,
                waste, and automotive sectors.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-sm mb-3" style={{ color: colors.primary }}>
                For Sustainability Strategists
              </h3>
              <p className="text-sm leading-relaxed text-gray-700">
                Rethink risk models. The ICJ's climate obligations opinion raises the legal stakes. Meanwhile, France's
                fast-fashion fallout and Brazil's rural credit reform underscore how public policy and grassroots
                pressure are reshaping ESG risks.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-sm mb-3" style={{ color: colors.primary }}>
                For Legal & Public Affairs Teams
              </h3>
              <p className="text-sm leading-relaxed text-gray-700">
                Monitor U.S. deregulatory momentum alongside bills like the Pesticide Injury Accountability Act and
                SPEED Act, which could upend compliance landscapes.
              </p>
            </div>
          </div>
        </div>

        <footer className="text-center text-xs text-gray-500 pt-8 border-t border-gray-300">
          <p>info@Scorealytics.com | Subscribe | About</p>
          <p className="mt-2">
            Generated on {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </footer>
      </div>
    </div>
  )
}
