"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import type { Article } from "./bulletin-generator"

interface ArticleSelectorProps {
  articles: Article[]
  theme: "blue" | "green" | "red"
  onConfirm: (selectedArticles: Article[], bulletinConfig: BulletinConfig) => void
  onBack: () => void
}

interface BulletinConfig {
  headerText: string
  headerImage: string
  issueNumber: string
  publicationDate: string
  publisherLogo: string
  footerImage: string
}

// Reusable Confirmation Modal Component
interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  theme?: "blue" | "green" | "red"
  isLoading?: boolean
  variant?: "default" | "destructive"
}

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  theme = "blue",
  isLoading = false,
  variant = "default"
}: ConfirmationModalProps) {
  const themeColors = {
    blue: "#1976D2",
    green: "#388E3C",
    red: "#D32F2F",
  }

  const getConfirmButtonColor = () => {
    if (variant === "destructive") {
      return "#D32F2F" // red color for destructive actions
    }
    return themeColors[theme]
  }

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <p className="text-gray-600">{message}</p>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <Button
            onClick={onClose}
            disabled={isLoading}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
            style={{ backgroundColor: getConfirmButtonColor() }}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ArticleSelector({ articles, theme, onConfirm, onBack }: ArticleSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set(articles.map((a) => a.news_id)))
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [generateConfirmationModalOpen, setGenerateConfirmationModalOpen] = useState(false)
  const [backConfirmationModalOpen, setBackConfirmationModalOpen] = useState(false)
  const [currentArticleId, setCurrentArticleId] = useState<number | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [articlesWithImages, setArticlesWithImages] = useState<Map<number, string>>(new Map())
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Bulletin configuration state
  const [bulletinConfig, setBulletinConfig] = useState<BulletinConfig>({
    headerText: "ESG BULLETIN",
    headerImage: "",
    issueNumber: "",
    publicationDate: new Date().toISOString().split('T')[0],
    publisherLogo: "https://scorealytics.com/uploads/SCORE_logo_white_6c91d9768d.svg",
    footerImage: ""
  })

  // Free image APIs for testing
  const freeImageApis = [
    "https://picsum.photos/800/400",
    "https://picsum.photos/800/600",
    "https://picsum.photos/600/400",
    "https://picsum.photos/700/500",
    "https://picsum.photos/900/600",
  ]

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    const initialSelectedIds = new Set(articles.map((a) => a.news_id))
    
    // Check if selection changed
    if (selectedIds.size !== initialSelectedIds.size || 
        !Array.from(selectedIds).every(id => initialSelectedIds.has(id))) {
      return true
    }
    
    // Check if images were added
    if (articlesWithImages.size > 0) {
      return true
    }
    
    // Check if bulletin config has changes from default
    const defaultConfig: BulletinConfig = {
      headerText: "ESG BULLETIN",
      headerImage: "",
      issueNumber: "",
      publicationDate: new Date().toISOString().split('T')[0],
      publisherLogo: "https://scorealytics.com/uploads/SCORE_logo_white_6c91d9768d.svg",
      footerImage: ""
    }
    
    return bulletinConfig.headerText !== defaultConfig.headerText ||
           bulletinConfig.headerImage !== defaultConfig.headerImage ||
           bulletinConfig.issueNumber !== defaultConfig.issueNumber ||
           bulletinConfig.publicationDate !== defaultConfig.publicationDate ||
           bulletinConfig.publisherLogo !== defaultConfig.publisherLogo ||
           bulletinConfig.footerImage !== defaultConfig.footerImage
  }

  // Prevent background scrolling when modals are open
  useEffect(() => {
    if (selectedArticle || imageModalOpen || configModalOpen || generateConfirmationModalOpen || backConfirmationModalOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [selectedArticle, imageModalOpen, configModalOpen, generateConfirmationModalOpen, backConfirmationModalOpen])

  const toggleArticle = (newsId: number) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(newsId)) {
      newSelected.delete(newsId)
    } else {
      newSelected.add(newsId)
    }
    setSelectedIds(newSelected)
  }

  const toggleAll = () => {
    if (selectedIds.size === articles.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(articles.map((a) => a.news_id)))
    }
  }

  const openArticleModal = (article: Article) => {
    setSelectedArticle(article)
  }

  const closeArticleModal = () => {
    setSelectedArticle(null)
  }

  const openImageModal = (articleId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentArticleId(articleId)
    setImageUrl(articlesWithImages.get(articleId) || "")
    setImageModalOpen(true)
  }

  const closeImageModal = () => {
    setImageModalOpen(false)
    setCurrentArticleId(null)
    setImageUrl("")
  }

  const openConfigModal = () => {
    setConfigModalOpen(true)
  }

  const closeConfigModal = () => {
    setConfigModalOpen(false)
  }

  const openGenerateConfirmationModal = () => {
    setGenerateConfirmationModalOpen(true)
  }

  const closeGenerateConfirmationModal = () => {
    setGenerateConfirmationModalOpen(false)
  }

  const openBackConfirmationModal = () => {
    setBackConfirmationModalOpen(true)
  }

  const closeBackConfirmationModal = () => {
    setBackConfirmationModalOpen(false)
  }

  // Function to get a random image URL
  const getRandomImageUrl = () => {
    const randomIndex = Math.floor(Math.random() * freeImageApis.length)
    return freeImageApis[randomIndex]
  }

  // Function to set random image for article
  const setRandomImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentArticleId) {
      const randomUrl = getRandomImageUrl()
      setImageUrl(randomUrl)
    }
  }

  // Function to set random image for bulletin config
  const setRandomConfigImage = (field: 'headerImage' | 'footerImage' | 'publisherLogo', e: React.MouseEvent) => {
    e.preventDefault()
    const randomUrl = getRandomImageUrl()
    handleConfigChange(field, randomUrl)
  }

  const saveImageUrl = () => {
    if (currentArticleId) {
      const newArticlesWithImages = new Map(articlesWithImages)
      if (imageUrl.trim()) {
        newArticlesWithImages.set(currentArticleId, imageUrl.trim())
      } else {
        newArticlesWithImages.delete(currentArticleId)
      }
      setArticlesWithImages(newArticlesWithImages)
    }
    closeImageModal()
  }

  const removeImage = (articleId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const newArticlesWithImages = new Map(articlesWithImages)
    newArticlesWithImages.delete(articleId)
    setArticlesWithImages(newArticlesWithImages)
  }

  const handleConfigChange = (field: keyof BulletinConfig, value: string) => {
    setBulletinConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Function to format text with **bold** markers
  const formatBoldText = (text: string) => {
    if (!text) return "";
    
    return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const boldText = part.slice(2, -2);
        return (
          <strong key={index} className="font-bold">
            {boldText}
          </strong>
        );
      }
      return part;
    });
  }

  const selectedArticles = articles.filter((a) => selectedIds.has(a.news_id)).map(article => ({
    ...article,
    imageUrl: articlesWithImages.get(article.news_id)
  }))

  const handleGenerateConfirm = async () => {
    setIsGenerating(true)
    closeGenerateConfirmationModal()
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onConfirm(selectedArticles, bulletinConfig)
    setIsGenerating(false)
  }

  const handleBackConfirm = () => {
    onBack()
  }

  const handleBackClick = () => {
    if (hasUnsavedChanges()) {
      openBackConfirmationModal()
    } else {
      onBack()
    }
  }

  const themeColors = {
    blue: "#1976D2",
    green: "#388E3C",
    red: "#D32F2F",
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-2" style={{ color: themeColors[theme] }}>
          Select Articles for Your Bulletin
        </h2>
        <p className="text-gray-600 mb-6">
          Choose which articles to include in your bulletin ({selectedArticles.length} of {articles.length} selected)
        </p>

        {/* Bulletin Configuration Button */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-4">
            <Button
              onClick={toggleAll}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              {selectedIds.size === articles.length ? "Deselect All" : "Select All"}
            </Button>
            <span className="text-sm text-gray-600 self-center">
              {selectedIds.size} article{selectedIds.size !== 1 ? "s" : ""} selected
            </span>
          </div>
          <Button
            onClick={openConfigModal}
            className="text-white font-bold py-2 px-4 rounded-lg"
            style={{
              backgroundColor: selectedArticles.length === 0 ? "#ccc" : themeColors[theme],
            }}
          >
            Configure Bulletin
          </Button>
        </div>

        {/* Articles List */}
        <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
          {articles.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No articles found</p>
          ) : (
            articles.map((article) => (
              <div
                key={article.news_id}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer group"
                onClick={() => openArticleModal(article)}
              >
                <div 
                  className="flex items-start gap-4 flex-1 min-w-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(article.news_id)}
                    onChange={() => toggleArticle(article.news_id)}
                    className="mt-1 w-5 h-5 cursor-pointer shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-800">{article.news_title}</h3>
                      {selectedIds.has(article.news_id) && (
                        <div className="flex gap-2 ml-4 shrink-0">
                          {articlesWithImages.has(article.news_id) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => removeImage(article.news_id, e)}
                              className="text-xs bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                            >
                              Remove Image
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => openImageModal(article.news_id, e)}
                            className="text-xs"
                          >
                            {articlesWithImages.has(article.news_id) ? "Change Image" : "Add Image"}
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{article.news_summary}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {article.jurisdictions?.[0]?.name || "International"}
                      </span>
                      <span className="bg-gray-100 px-2 py-1 rounded">{article.type_value}</span>
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {new Date(article.published_at).toLocaleDateString()}
                      </span>
                      {articlesWithImages.has(article.news_id) && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                          Image Attached
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Click/Tap Indicator */}
                <div className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-gray-600 transition-colors shrink-0 whitespace-nowrap">
                  <span className="hidden sm:inline">view full article</span>
                  <svg 
                    className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button 
            onClick={handleBackClick} 
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg"
          >
            Back
          </Button>
          <Button
            onClick={openGenerateConfirmationModal}
            disabled={selectedArticles.length === 0 || isGenerating}
            className="text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: selectedArticles.length === 0 ? "#ccc" : themeColors[theme],
            }}
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </div>
            ) : (
              `Generate Bulletin (${selectedArticles.length} articles)`
            )}
          </Button>
        </div>
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b shrink-0">
              <h3 className="text-xl font-bold text-gray-800">{selectedArticle.news_title}</h3>
              <button
                onClick={closeArticleModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Article Metadata */}
              <div className="flex flex-wrap gap-2 mb-6 text-sm text-gray-600">
                <span className="bg-gray-100 px-3 py-1 rounded-full">
                  {selectedArticle.jurisdictions?.[0]?.name || "International"}
                </span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">{selectedArticle.type_value}</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">
                  {new Date(selectedArticle.published_at).toLocaleDateString()}
                </span>
              </div>

              {/* Full Article Content */}
              <div className="prose max-w-none">
                {selectedArticle.news_summary && (
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {formatBoldText(selectedArticle.news_summary)}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center p-6 border-t bg-gray-50 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedIds.has(selectedArticle.news_id)}
                  onChange={() => toggleArticle(selectedArticle.news_id)}
                  className="w-5 h-5 cursor-pointer"
                  id="include-article"
                />
                <label htmlFor="include-article" className="text-sm text-gray-700 cursor-pointer">
                  Include in bulletin
                </label>
              </div>
              <Button
                onClick={closeArticleModal}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image URL Modal */}
      {imageModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b shrink-0">
              <h3 className="text-xl font-bold text-gray-800">Add Image URL</h3>
              <button
                onClick={closeImageModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="image-url" className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    id="image-url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the full URL of the image you want to attach to this article
                  </p>
                  
                  {/* Random Image Button */}
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-xs text-yellow-800 mb-2 font-medium">
                      🚨 TESTING FEATURE - Will be removed in production
                    </p>
                    <Button
                      type="button"
                      onClick={setRandomImage}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium py-2 rounded"
                    >
                      Use Random Test Image
                    </Button>
                  </div>
                </div>

                {imageUrl && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="max-w-full h-auto max-h-48 mx-auto rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <p className="text-xs text-gray-500 text-center mt-2 break-all">
                        {imageUrl}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 shrink-0">
              <Button
                onClick={closeImageModal}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={saveImageUrl}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Save Image
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulletin Configuration Modal */}
      {configModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b shrink-0">
              <h3 className="text-xl font-bold text-gray-800">Configure Bulletin</h3>
              <button
                onClick={closeConfigModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Header Text */}
                <div>
                  <label htmlFor="header-text" className="block text-sm font-medium text-gray-700 mb-2">
                    Bulletin Header Text
                  </label>
                  <input
                    type="text"
                    id="header-text"
                    value={bulletinConfig.headerText}
                    onChange={(e) => handleConfigChange('headerText', e.target.value)}
                    placeholder="ESG BULLETIN"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Header Image */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="header-image" className="block text-sm font-medium text-gray-700">
                      Header Image URL
                    </label>
                  </div>
                  <input
                    type="url"
                    id="header-image"
                    value={bulletinConfig.headerImage}
                    onChange={(e) => handleConfigChange('headerImage', e.target.value)}
                    placeholder="https://example.com/header-image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  {/* Random Header Image Button */}
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-xs text-yellow-800 mb-2 font-medium">
                      🚨 TESTING FEATURE - Will be removed in production
                    </p>
                    <Button
                      type="button"
                      onClick={(e) => setRandomConfigImage('headerImage', e)}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium py-2 rounded"
                    >
                      Use Random Test Header Image
                    </Button>
                  </div>

                  {bulletinConfig.headerImage && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">Header Image Preview:</p>
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <img
                          src={bulletinConfig.headerImage}
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

                {/* Issue Number */}
                <div>
                  <label htmlFor="issue-number" className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Number
                  </label>
                  <input
                    type="text"
                    id="issue-number"
                    value={bulletinConfig.issueNumber}
                    onChange={(e) => handleConfigChange('issueNumber', e.target.value)}
                    placeholder="e.g., Issue #1, Vol. 2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Publication Date */}
                <div>
                  <label htmlFor="publication-date" className="block text-sm font-medium text-gray-700 mb-2">
                    Publication Date
                  </label>
                  <input
                    type="date"
                    id="publication-date"
                    value={bulletinConfig.publicationDate}
                    onChange={(e) => handleConfigChange('publicationDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Publisher Logo */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="publisher-logo" className="block text-sm font-medium text-gray-700">
                      Publisher Logo URL
                    </label>
                  </div>
                  <input
                    type="url"
                    id="publisher-logo"
                    value={bulletinConfig.publisherLogo}
                    onChange={(e) => handleConfigChange('publisherLogo', e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  {/* Random Logo Button */}
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-xs text-yellow-800 mb-2 font-medium">
                      🚨 TESTING FEATURE - Will be removed in production
                    </p>
                    <Button
                      type="button"
                      onClick={(e) => setRandomConfigImage('publisherLogo', e)}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium py-2 rounded"
                    >
                      Use Random Test Logo
                    </Button>
                  </div>

                  {bulletinConfig.publisherLogo && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">Logo Preview:</p>
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <img
                          src={bulletinConfig.publisherLogo}
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

                {/* Footer Image */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="footer-image" className="block text-sm font-medium text-gray-700">
                      Footer Image URL
                    </label>
                  </div>
                  <input
                    type="url"
                    id="footer-image"
                    value={bulletinConfig.footerImage}
                    onChange={(e) => handleConfigChange('footerImage', e.target.value)}
                    placeholder="https://example.com/footer-image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  {/* Random Footer Image Button */}
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-xs text-yellow-800 mb-2 font-medium">
                      🚨 TESTING FEATURE - Will be removed in production
                    </p>
                    <Button
                      type="button"
                      onClick={(e) => setRandomConfigImage('footerImage', e)}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium py-2 rounded"
                    >
                      Use Random Test Footer Image
                    </Button>
                  </div>

                  {bulletinConfig.footerImage && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">Footer Image Preview:</p>
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <img
                          src={bulletinConfig.footerImage}
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

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 shrink-0">
              <Button
                onClick={closeConfigModal}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={closeConfigModal}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                 style={{
              backgroundColor: selectedArticles.length === 0 ? "#ccc" : themeColors[theme],
            }}
              >
                Save Configuration
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Bulletin Confirmation Modal */}
      <ConfirmationModal
        isOpen={generateConfirmationModalOpen}
        onClose={closeGenerateConfirmationModal}
        onConfirm={handleGenerateConfirm}
        title="Generate Bulletin"
        message={`You are about to generate a bulletin with ${selectedArticles.length} article${selectedArticles.length !== 1 ? 's' : ''}. This will create a professional PDF document. Do you want to proceed?`}
        confirmText="Generate Bulletin"
        cancelText="Cancel"
        theme={theme}
        isLoading={isGenerating}
      />

      {/* Back Confirmation Modal */}
      <ConfirmationModal
        isOpen={backConfirmationModalOpen}
        onClose={closeBackConfirmationModal}
        onConfirm={handleBackConfirm}
        title="Go Back"
        message="You have unsaved changes. Are you sure you want to go back? All your selections and configurations will be lost."
        confirmText="Yes, Go Back"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}