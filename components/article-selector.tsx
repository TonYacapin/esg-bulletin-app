"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ConfirmationModal } from "./confirmation-modal"
import { ArticleDetailModal } from "./article-detail-modal"
import { ImageModal } from "./image-modal"
import { BulletinConfigModal, type BulletinConfig } from "./bulletin-config-modal"
import type { Article } from "./bulletin-generator"
import { toast } from 'sonner'

interface ArticleSelectorProps {
  articles: Article[]
  theme: "blue" | "green" | "red"
  onConfirm: (selectedArticles: Article[], bulletinConfig: BulletinConfig) => void
  onBack: () => void
}

export function ArticleSelector({ articles, theme, onConfirm, onBack }: ArticleSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [generateConfirmationModalOpen, setGenerateConfirmationModalOpen] = useState(false)
  const [backConfirmationModalOpen, setBackConfirmationModalOpen] = useState(false)
  const [currentArticleId, setCurrentArticleId] = useState<number | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [articlesWithImages, setArticlesWithImages] = useState<Map<number, string>>(new Map())
  const [isGenerating, setIsGenerating] = useState(false)
  
  const [customPrompts, setCustomPrompts] = useState<Map<number, string>>(new Map())
  const [customSummaries, setCustomSummaries] = useState<Map<number, string>>(new Map())
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<number | null>(null)
  
  const [bulletinConfig, setBulletinConfig] = useState<BulletinConfig>({
    headerText: "ESG Bulletin",
    headerImage: "",
    issueNumber: "",
    publicationDate: new Date().toISOString().split('T')[0],
    publisherLogo: "https://scorealytics.com/uploads/SCORE_logo_white_6c91d9768d.svg",
    footerImage: "",
    tableOfContents: true,
    greetingMessage: "",
    keyTrends: true,
    executiveSummary: true,
    keyTakeaways: true,
    interactiveMap: true,
    calendarSection: true,
    euSection: {
      enabled: true,
      title: "",
      keyTrends: true,
      introduction: "",
      trends: ""
    },
    usSection: {
      enabled: true,
      title: "",
      keyTrends: true,
      introduction: "",
      trends: "" 
    },
    globalSection: {
      enabled: true,
      title: "",
      keyTrends: true,
      introduction: "",
      trends: ""
    },
    calendarMinutes: true,
    keepAnEyeOn: true,
    comingEvents: true,
    previousGreeting: "",
    customInstructions: "",
    generatedContent: {
      keyTrends: "",
      executiveSummary: "",
      keyTakeaways: "",
      euTrends: "",
      usTrends: "",
      globalTrends: ""
    }
  })

  const [isAutoGenerating, setIsAutoGenerating] = useState(false)

  const freeImageApis = [
    "https://picsum.photos/800/400",
    "https://picsum.photos/800/600",
    "https://picsum.photos/600/400",
    "https://picsum.photos/700/500",
    "https://picsum.photos/900/600",
  ]

  // Auto-select all articles on initial load
  useEffect(() => {
    if (articles.length > 0 && selectedIds.size === 0) {
      setSelectedIds(new Set(articles.map((a) => a.news_id)))
    }
  }, [articles])

  // Auto-generate bulletin content when articles are selected
  useEffect(() => {
    const selectedArticles = articles.filter((a) => selectedIds.has(a.news_id))
    if (selectedArticles.length > 0 && !isAutoGenerating) {
      autoGenerateBulletinContent(selectedArticles)
    }
  }, [selectedIds, articles])

  const hasUnsavedChanges = () => {
    const initialSelectedIds = new Set(articles.map((a) => a.news_id))
    
    if (selectedIds.size !== initialSelectedIds.size || 
        !Array.from(selectedIds).every(id => initialSelectedIds.has(id))) {
      return true
    }
    
    if (articlesWithImages.size > 0) {
      return true
    }
    
    if (customSummaries.size > 0) {
      return true
    }
    
    const defaultConfig = {
      headerText: "ESG BULLETIN",
      headerImage: "",
      issueNumber: "",
      publicationDate: new Date().toISOString().split('T')[0],
      publisherLogo: "https://scorealytics.com/uploads/SCORE_logo_white_6c91d9768d.svg",
      footerImage: "",
      tableOfContents: true,
      greetingMessage: "",
      keyTrends: true,
      executiveSummary: true,
      euSection: {
        enabled: true,
        title: "",
        keyTrends: true,
        introduction: ""
      },
      usSection: {
        enabled: true,
        title: "",
        keyTrends: true,
        introduction: ""
      },
      globalSection: {
        enabled: true,
        title: "",
        keyTrends: true,
        introduction: ""
      }
    } as BulletinConfig
    
    return bulletinConfig.headerText !== defaultConfig.headerText ||
           bulletinConfig.headerImage !== defaultConfig.headerImage ||
           bulletinConfig.issueNumber !== defaultConfig.issueNumber ||
           bulletinConfig.publicationDate !== defaultConfig.publicationDate ||
           bulletinConfig.publisherLogo !== defaultConfig.publisherLogo ||
           bulletinConfig.footerImage !== defaultConfig.footerImage
  }

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

  const getRandomImageUrl = () => {
    const randomIndex = Math.floor(Math.random() * freeImageApis.length)
    return freeImageApis[randomIndex]
  }

  const setRandomImage = () => {
    if (currentArticleId) {
      const randomUrl = getRandomImageUrl()
      setImageUrl(randomUrl)
    }
  }

  const setRandomConfigImage = (field: 'headerImage' | 'footerImage' | 'publisherLogo') => {
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

  const handlePromptChange = (articleId: number, prompt: string) => {
    const newPrompts = new Map(customPrompts)
    newPrompts.set(articleId, prompt)
    setCustomPrompts(newPrompts)
  }

  const handleSummaryChange = (articleId: number, summary: string) => {
    const newSummaries = new Map(customSummaries)
    newSummaries.set(articleId, summary)
    setCustomSummaries(newSummaries)
  }

  const generateSummary = async (articleId: number) => {
    if (!selectedArticle) return
    
    setIsGeneratingSummary(articleId)
    
    const prompt = customPrompts.get(articleId) || 
      `Please provide a concise summary of the following article for an ESG bulletin. Focus on key ESG-related aspects and main points.`
    
    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          articleContent: selectedArticle.news_summary
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate summary')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      handleSummaryChange(articleId, data.summary)
    } catch (error) {
      console.error('Error generating summary:', error)
      handleSummaryChange(articleId, selectedArticle.news_summary)
      toast.error('Failed to generate AI summary. Using original summary.')
    } finally {
      setIsGeneratingSummary(null)
    }
  }

  const resetSummary = (articleId: number) => {
    handleSummaryChange(articleId, "")
  }

  const useOriginalSummary = (articleId: number) => {
    if (selectedArticle) {
      handleSummaryChange(articleId, selectedArticle.news_summary)
    }
  }

  const autoGenerateBulletinContent = async (selectedArticles: Article[]) => {
    if (selectedArticles.length === 0) return
    
    setIsAutoGenerating(true)
    
    try {
      // Generate issue number based on current date
      const currentDate = new Date()
      const month = currentDate.toLocaleString('en-US', { month: 'long' })
      const year = currentDate.getFullYear()
      const issueNumber = `Issue #${Math.floor(Math.random() * 100) + 1} - ${month} ${year}`
      
      // Update basic configuration
      setBulletinConfig(prev => ({
        ...prev,
        headerText: "ESG DISCLOSURE & REPORTING BULLETIN",
        issueNumber,
        publicationDate: currentDate.toISOString().split('T')[0],
        headerImage: getRandomImageUrl(),
        footerImage: getRandomImageUrl()
      }))

      // Generate AI content for the bulletin
      await generateAIContentForBulletin(selectedArticles)
      
      toast.success('Bulletin content auto-generated successfully!')
    } catch (error) {
      console.error('Error auto-generating bulletin content:', error)
      toast.error('Failed to auto-generate some content. You can generate it manually in the configuration.')
    } finally {
      setIsAutoGenerating(false)
    }
  }

  const generateAIContentForBulletin = async (selectedArticles: Article[]) => {
    try {
      // Generate key trends
      const keyTrendsResponse = await fetch('/api/generate-bulletin-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'key_trends',
          articles: selectedArticles,
          currentDate: bulletinConfig.publicationDate
        }),
      })

      if (keyTrendsResponse.ok) {
        const keyTrendsData = await keyTrendsResponse.json()
        setBulletinConfig(prev => ({
          ...prev,
          generatedContent: {
            ...prev.generatedContent,
            keyTrends: keyTrendsData.content
          }
        }))
      }

      // Generate executive summary
      const execSummaryResponse = await fetch('/api/generate-bulletin-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'executive_summary',
          articles: selectedArticles,
          currentDate: bulletinConfig.publicationDate
        }),
      })

      if (execSummaryResponse.ok) {
        const execSummaryData = await execSummaryResponse.json()
        setBulletinConfig(prev => ({
          ...prev,
          generatedContent: {
            ...prev.generatedContent,
            executiveSummary: execSummaryData.content
          }
        }))
      }

      // Generate key takeaways
      const keyTakeawaysResponse = await fetch('/api/generate-bulletin-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'key_takeaways',
          articles: selectedArticles,
          currentDate: bulletinConfig.publicationDate
        }),
      })

      if (keyTakeawaysResponse.ok) {
        const keyTakeawaysData = await keyTakeawaysResponse.json()
        setBulletinConfig(prev => ({
          ...prev,
          generatedContent: {
            ...prev.generatedContent,
            keyTakeaways: keyTakeawaysData.content
          }
        }))
      }

      // Generate regional content for enabled sections
      const regions = ['euSection', 'usSection', 'globalSection'] as const
      
      for (const region of regions) {
        if (bulletinConfig[region].enabled) {
          const regionalArticles = getRegionalArticles(selectedArticles, region)
          
          if (regionalArticles.length > 0) {
            // Generate regional title
            const titleResponse = await fetch('/api/generate-bulletin-content', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type: 'section_title',
                articles: regionalArticles,
                region: region.replace('Section', '').toUpperCase(),
                currentDate: bulletinConfig.publicationDate
              }),
            })

            if (titleResponse.ok) {
              const titleData = await titleResponse.json()
              setBulletinConfig(prev => ({
                ...prev,
                [region]: {
                  ...prev[region],
                  title: titleData.content
                }
              }))
            }

            // Generate regional trends if enabled
            if (bulletinConfig[region].keyTrends) {
              const trendsResponse = await fetch('/api/generate-bulletin-content', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  type: 'section_trends',
                  articles: regionalArticles,
                  region: region.replace('Section', '').toUpperCase(),
                  currentDate: bulletinConfig.publicationDate
                }),
              })

              if (trendsResponse.ok) {
                const trendsData = await trendsResponse.json()
                setBulletinConfig(prev => ({
                  ...prev,
                  [region]: {
                    ...prev[region],
                    trends: trendsData.content
                  }
                }))
              }
            }
          }
        }
      }

    } catch (error) {
      console.error('Error generating AI content:', error)
      throw error
    }
  }

  const getRegionalArticles = (articles: Article[], region: 'euSection' | 'usSection' | 'globalSection') => {
    return articles.filter(article => {
      const jurisdiction = article.jurisdictions?.[0]?.name?.toLowerCase() || ''

      switch (region) {
        case 'euSection':
          return jurisdiction.includes('eu') ||
            jurisdiction.includes('europe') ||
            jurisdiction.includes('european') ||
            article.jurisdictions?.some(j =>
              j.name.toLowerCase().includes('eu') ||
              j.name.toLowerCase().includes('europe')
            )
        case 'usSection':
          return jurisdiction.includes('us') ||
            jurisdiction.includes('united states') ||
            jurisdiction.includes('america') ||
            article.jurisdictions?.some(j =>
              j.name.toLowerCase().includes('us') ||
              j.name.toLowerCase().includes('united states')
            )
        case 'globalSection':
          return !jurisdiction.includes('eu') &&
            !jurisdiction.includes('europe') &&
            !jurisdiction.includes('us') &&
            !jurisdiction.includes('united states') &&
            !article.jurisdictions?.some(j =>
              j.name.toLowerCase().includes('eu') ||
              j.name.toLowerCase().includes('europe') ||
              j.name.toLowerCase().includes('us') ||
              j.name.toLowerCase().includes('united states')
            )
        default:
          return true
      }
    })
  }

  const selectedArticles = articles.filter((a) => selectedIds.has(a.news_id)).map(article => ({
    ...article,
    imageUrl: articlesWithImages.get(article.news_id),
    news_summary: customSummaries.get(article.news_id) || article.news_summary
  }))

  const handleGenerateConfirm = async () => {
    setIsGenerating(true)
    closeGenerateConfirmationModal()
    
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: themeColors[theme] }}>
              Select Articles for Your Bulletin
            </h2>
            <p className="text-gray-600">
              {isAutoGenerating ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  Auto-generating bulletin content...
                </span>
              ) : (
                `Choose which articles to include in your bulletin (${selectedArticles.length} of ${articles.length} selected)`
              )}
            </p>
          </div>
          {isAutoGenerating && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <p className="text-blue-700 text-sm font-medium">Auto-generating content...</p>
            </div>
          )}
        </div>

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
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {customSummaries.get(article.news_id) || article.news_summary}
                    </p>
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
                      {customSummaries.has(article.news_id) && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                          </svg>
                          Custom Summary
                        </span>
                      )}
                    </div>
                  </div>
                </div>
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

        <div className="flex justify-center gap-4 mt-8">
          <Button 
            onClick={handleBackClick} 
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg"
          >
            Back
          </Button>
          <Button
            onClick={openGenerateConfirmationModal}
            disabled={selectedArticles.length === 0 || isGenerating || isAutoGenerating}
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
            ) : isAutoGenerating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Preparing...
              </div>
            ) : (
              `Generate Bulletin (${selectedArticles.length} articles)`
            )}
          </Button>
        </div>
      </div>

      <ArticleDetailModal
        article={selectedArticle!}
        isOpen={!!selectedArticle}
        onClose={closeArticleModal}
        isSelected={selectedIds.has(selectedArticle?.news_id || -1)}
        onToggleSelection={toggleArticle}
        customPrompts={customPrompts}
        customSummaries={customSummaries}
        onPromptChange={handlePromptChange}
        onSummaryChange={handleSummaryChange}
        onGenerateSummary={generateSummary}
        onResetSummary={resetSummary}
        onUseOriginalSummary={useOriginalSummary}
        isGeneratingSummary={isGeneratingSummary}
      />

      <ImageModal
        isOpen={imageModalOpen}
        onClose={closeImageModal}
        onSave={saveImageUrl}
        imageUrl={imageUrl}
        onImageUrlChange={setImageUrl}
        onRandomImage={setRandomImage}
      />

      <BulletinConfigModal
        isOpen={configModalOpen}
        onClose={closeConfigModal}
        config={bulletinConfig}
        onConfigChange={handleConfigChange}
        onRandomImage={setRandomConfigImage}
        selectedArticlesCount={selectedArticles.length}
        theme={theme}
        articles={selectedArticles}
      />

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