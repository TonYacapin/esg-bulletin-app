"use client"

import { Button } from "@/components/ui/button"

export interface BulletinConfig {
  headerText: string
  headerImage: string
  issueNumber: string
  publicationDate: string
  publisherLogo: string
  footerImage: string
}

interface BulletinConfigModalProps {
  isOpen: boolean
  onClose: () => void
  config: BulletinConfig
  onConfigChange: (field: keyof BulletinConfig, value: string) => void
  onRandomImage: (field: 'headerImage' | 'footerImage' | 'publisherLogo') => void
  selectedArticlesCount: number
  theme: "blue" | "green" | "red"
}

export function BulletinConfigModal({
  isOpen,
  onClose,
  config,
  onConfigChange,
  onRandomImage,
  selectedArticlesCount,
  theme
}: BulletinConfigModalProps) {
  const themeColors = {
    blue: "#1976D2",
    green: "#388E3C",
    red: "#D32F2F",
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b shrink-0">
          <h3 className="text-xl font-bold text-gray-800">Configure Bulletin</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="header-text" className="block text-sm font-medium text-gray-700 mb-2">
                Bulletin Header Text
              </label>
              <input
                type="text"
                id="header-text"
                value={config.headerText}
                onChange={(e) => onConfigChange('headerText', e.target.value)}
                placeholder="ESG BULLETIN"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="header-image" className="block text-sm font-medium text-gray-700">
                  Header Image URL
                </label>
              </div>
              <input
                type="url"
                id="header-image"
                value={config.headerImage}
                onChange={(e) => onConfigChange('headerImage', e.target.value)}
                placeholder="https://example.com/header-image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs text-yellow-800 mb-2 font-medium">
                  🚨 TESTING FEATURE - Will be removed in production
                </p>
                <Button
                  type="button"
                  onClick={() => onRandomImage('headerImage')}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium py-2 rounded"
                >
                  Use Random Test Header Image
                </Button>
              </div>

              {config.headerImage && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">Header Image Preview:</p>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <img
                      src={config.headerImage}
                      alt="Header preview"
                      className="max-w-full h-auto max-h-32 mx-auto rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="issue-number" className="block text-sm font-medium text-gray-700 mb-2">
                Issue Number
              </label>
              <input
                type="text"
                id="issue-number"
                value={config.issueNumber}
                onChange={(e) => onConfigChange('issueNumber', e.target.value)}
                placeholder="e.g., Issue #1, Vol. 2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="publication-date" className="block text-sm font-medium text-gray-700 mb-2">
                Publication Date
              </label>
              <input
                type="date"
                id="publication-date"
                value={config.publicationDate}
                onChange={(e) => onConfigChange('publicationDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="publisher-logo" className="block text-sm font-medium text-gray-700">
                  Publisher Logo URL
                </label>
              </div>
              <input
                type="url"
                id="publisher-logo"
                value={config.publisherLogo}
                onChange={(e) => onConfigChange('publisherLogo', e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs text-yellow-800 mb-2 font-medium">
                  🚨 TESTING FEATURE - Will be removed in production
                </p>
                <Button
                  type="button"
                  onClick={() => onRandomImage('publisherLogo')}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium py-2 rounded"
                >
                  Use Random Test Logo
                </Button>
              </div>

              {config.publisherLogo && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">Logo Preview:</p>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <img
                      src={config.publisherLogo}
                      alt="Logo preview"
                      className="max-w-full h-auto max-h-24 mx-auto rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="footer-image" className="block text-sm font-medium text-gray-700">
                  Footer Image URL
                </label>
              </div>
              <input
                type="url"
                id="footer-image"
                value={config.footerImage}
                onChange={(e) => onConfigChange('footerImage', e.target.value)}
                placeholder="https://example.com/footer-image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs text-yellow-800 mb-2 font-medium">
                  🚨 TESTING FEATURE - Will be removed in production
                </p>
                <Button
                  type="button"
                  onClick={() => onRandomImage('footerImage')}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium py-2 rounded"
                >
                  Use Random Test Footer Image
                </Button>
              </div>

              {config.footerImage && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">Footer Image Preview:</p>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <img
                      src={config.footerImage}
                      alt="Footer preview"
                      className="max-w-full h-auto max-h-32 mx-auto rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 shrink-0">
          <Button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={onClose}
            className="text-white font-bold py-2 px-4 rounded-lg"
            style={{
              backgroundColor: selectedArticlesCount === 0 ? "#ccc" : themeColors[theme],
            }}
          >
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  )
}