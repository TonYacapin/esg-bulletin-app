"use client"
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
      <header className="flex justify-between items-start pb-8 border-b-2 border-gray-300">
        <div>
          <h1 className="text-4xl font-bold tracking-wider text-gray-900">ESG</h1>
          <h2 className="text-3xl font-bold tracking-wider text-gray-900 mt-1">REGULATORY BULLETIN</h2>
          <p className="text-gray-600 mt-3 text-sm font-semibold">
            Issue #{issueNumber} | {month} {year}
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-xs">info@Scorealytics.com | Subscribe | About</p>
        </div>
      </header>

      <div className="mt-8 mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Welcome to our ESG Regulatory SCORE Bulletin!</h3>
        <p className="text-gray-700 text-sm leading-relaxed mb-4">
          {month} is here—sun-soaked, storm-swirled, and sizzling with ESG updates. Whether you're cooling off with a
          rooftop spritz or melting into your keyboard under deadline pressure, one thing's for sure: regulators haven't
          hit the snooze button.
        </p>
        <p className="text-gray-700 text-sm leading-relaxed">
          From Europe's recycling rebellions to policy pivots across the Americas and Asia, this month's edition serves
          up a global sampler of heatwaves, high stakes, and headline-grabbing reforms. So grab your shades, sip
          something iced, and get ready to breeze through your ESG briefings before the dog days of August roll in.
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">In This Issue</h3>
        <div className="grid grid-cols-3 gap-6 text-xs">
          {sortedCountries.map((country) => (
            <div key={country}>
              <h5 className="font-bold text-gray-900 mb-2 text-sm">{country}</h5>
              <ul className="space-y-1">
                {data.articlesByCountry[country].map((article) => (
                  <li key={article.news_id} className="text-gray-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{article.news_title}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <footer className="text-center pt-8 text-gray-600 text-xs border-t border-gray-300 mt-12">
        <p>info@Scorealytics.com | Subscribe | About</p>
        <p className="mt-2">Home Button</p>
      </footer>
    </div>
  )
}
