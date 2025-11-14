"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { fetchNewsAction } from "@/lib/actions"
import { BulletinOutput } from "./bulletin-output"
import { ArticleDetailModal } from "./article-detail-modal"
import { ImageModal } from "./image-modal"
import { BulletinConfigModal, type BulletinConfig } from "./bulletin-config-modal"
import { ConfirmationModal } from "./confirmation-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import {
  Calendar,
  FileText,
  Settings,
  ChevronDown,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react"
import type React from "react"
import { validateBulletinForm } from "@/lib/services/validation.service"
import type {
  Article,
  BulletinConfig as BulletinConfigType,
  BulletinData,
  BulletinFormData,
  BulletinTheme,
  BulletinFormFilters,
  ValidationError,
  DateFilterOption,
} from "@/lib/types"

// Types for jurisdictions
type Jurisdiction = {
  id: number;
  name: string;
  code: string;
}

// Theme configuration
const THEME_CONFIG = {
  blue: {
    color: "#3B82F6",
    name: "Regulatory Blue",
    type_id: "3",
  },
  green: {
    color: "#10B981",
    name: "Disclosure Green",
    type_id: "2",
  },
  red: {
    color: "#EF4444",
    name: "Litigation Red",
    type_id: "4",
  },
} as const

// Date filter options
const DATE_FILTER_OPTIONS = [
  { value: "custom", label: "Custom Date Range" },
  { value: "last_week", label: "Last Week" },
  { value: "last_2_weeks", label: "Last 2 Weeks" },
  { value: "last_month", label: "Last Month" },
] as const

// Pagination constants
const ARTICLES_PER_PAGE = 10

export default function BulletinGenerator() {
  // State management
  const [bulletinData, setBulletinData] = useState<BulletinData | null>(null)
  const [loading, setLoading] = useState(false)
  const [articles, setArticles] = useState<Article[]>([]) // Current filtered articles
  const [allArticles, setAllArticles] = useState<Article[]>([]) // All articles ever fetched
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [theme, setTheme] = useState<BulletinTheme>("blue")
  const [dateFilter, setDateFilter] = useState<DateFilterOption>("custom")
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [showOnlySelected, setShowOnlySelected] = useState(false)
  
  // Jurisdictions state
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([])
  const [loadingJurisdictions, setLoadingJurisdictions] = useState(false)

  // Form state
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [limit] = useState(5000)
  const [filters, setFilters] = useState<BulletinFormFilters>({
    type_id: "all",
    jurisdiction_id: "all",
    published_at_from: "",
    published_at_to: "",
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)

  // Modal states
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [generateConfirmationModalOpen, setGenerateConfirmationModalOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const { toast } = useToast()

  const [bulletinConfig, setBulletinConfig] = useState<BulletinConfig>({
    headerText: "ESG Bulletin",
    headerImage: "",
    issueNumber: "",
    publicationDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    publisherLogo: "",
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
      title: "EU Developments",
      keyTrends: true,
      introduction: "",
      trends: "",
    },
    usSection: {
      enabled: true,
      title: "US Developments", 
      keyTrends: true,
      introduction: "",
      trends: "",
    },
    globalSection: {
      enabled: true,
      title: "Global Developments",
      keyTrends: true,
      introduction: "",
      trends: "",
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
      globalTrends: "",
    },
  })

  // Fetch jurisdictions on component mount
  useEffect(() => {
    const fetchJurisdictions = async () => {
      setLoadingJurisdictions(true);
      try {
        const response = await fetch('/api/jurisdiction-filter');
        const data = await response.json();
        if (data.jurisdictions) {
          setJurisdictions(data.jurisdictions);
        }
      } catch (error) {
        console.error('Error fetching jurisdictions:', error);
        toast({
          title: "Error loading jurisdictions",
          description: "Failed to load jurisdiction list",
          variant: "destructive",
        });
      } finally {
        setLoadingJurisdictions(false);
      }
    };

    fetchJurisdictions();
  }, [toast]);

  // Group jurisdictions by region for better organization
  const groupedJurisdictions = useMemo(() => {
    const groups: { [key: string]: Jurisdiction[] } = {
      "Popular": [],
      "Americas": [],
      "Europe": [],
      "Asia Pacific": [],
      "Middle East & Africa": [],
      "International": []
    };

    jurisdictions.forEach(jurisdiction => {
      // Define popular jurisdictions
      const popularJurisdictions = [
        "United States of America", 
        "United Kingdom of Great Britain and Northern Ireland",
        "European Union",
        "Canada",
        "Australia",
        "Singapore",
        "Japan",
        "China"
      ];

      if (popularJurisdictions.includes(jurisdiction.name)) {
        groups.Popular.push(jurisdiction);
      } else if (jurisdiction.name === "European Union" || jurisdiction.name === "International" || jurisdiction.name === "World") {
        groups.International.push(jurisdiction);
      } else if (["US", "CA", "MX", "BR", "AR", "CL", "CO", "PE"].includes(jurisdiction.code)) {
        groups.Americas.push(jurisdiction);
      } else if (["GB", "FR", "DE", "IT", "ES", "NL", "BE", "CH", "SE", "NO", "DK", "FI", "IE", "AT", "PT", "GR"].includes(jurisdiction.code)) {
        groups.Europe.push(jurisdiction);
      } else if (["CN", "JP", "IN", "AU", "SG", "KR", "ID", "MY", "TH", "VN", "PH", "NZ"].includes(jurisdiction.code)) {
        groups["Asia Pacific"].push(jurisdiction);
      } else {
        groups["Middle East & Africa"].push(jurisdiction);
      }
    });

    // Sort each group alphabetically
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => a.name.localeCompare(b.name));
    });

    return groups;
  }, [jurisdictions]);

  // Calculate displayed articles with filtering for "Show Only Selected"
  const displayedArticles = useMemo(() => {
    let filteredArticles = articles
    
    // If "Show Only Selected" is enabled, show ALL selected articles from all searches
    if (showOnlySelected) {
      // Get all selected articles from allArticles (all fetched articles)
      const allSelectedArticles = allArticles.filter(article => selectedIds.has(article.news_id))
      
      // Then apply pagination
      const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE
      const endIndex = startIndex + ARTICLES_PER_PAGE
      return allSelectedArticles.slice(startIndex, endIndex)
    }
    
    // Otherwise, show current filtered articles with pagination
    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE
    const endIndex = startIndex + ARTICLES_PER_PAGE
    return filteredArticles.slice(startIndex, endIndex)
  }, [articles, allArticles, showOnlySelected, selectedIds, currentPage])

  // Calculate total pages based on filtered articles
  const totalPages = Math.ceil(
    (showOnlySelected 
      ? allArticles.filter(article => selectedIds.has(article.news_id)).length 
      : articles.length
    ) / ARTICLES_PER_PAGE
  )

  // Calculate visible page numbers (show max 5 pages)
  const getVisiblePages = () => {
    const visiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2))
    let endPage = Math.min(totalPages, startPage + visiblePages - 1)
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < visiblePages) {
      startPage = Math.max(1, endPage - visiblePages + 1)
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
  }

  // Reset to first page when articles change or when toggling showOnlySelected
  useEffect(() => {
    setCurrentPage(1)
  }, [articles, showOnlySelected])

  /**
   * Search articles function with persistent selections
   */
  const searchArticles = useCallback(async () => {
    const finalQuery = query.trim() || undefined
    const finalTypeId = filters.type_id !== "all" 
      ? Number.parseInt(filters.type_id) 
      : Number.parseInt(THEME_CONFIG[theme].type_id)

    // Handle jurisdiction_id conversion
    const finalJurisdictionId = filters.jurisdiction_id !== "all" 
      ? Number.parseInt(filters.jurisdiction_id) 
      : undefined

    const formData: BulletinFormData = {
      theme,
      page,
      limit,
      type_id: finalTypeId,
      ...(finalQuery && { query: finalQuery }),
      jurisdiction_id: finalJurisdictionId,
      published_at_from: filters.published_at_from || undefined,
      published_at_to: filters.published_at_to || undefined,
    }

    const errors = validateBulletinForm(formData)
    setValidationErrors(errors)

    if (errors.length > 0) {
      return
    }

    setLoading(true)
    try {
      const data = await fetchNewsAction({
        query: formData.query,
        page: formData.page,
        limit: formData.limit,
        type_id: formData.type_id,
        jurisdiction_id: formData.jurisdiction_id,
        published_at_from: formData.published_at_from,
        published_at_to: formData.published_at_to,
      })

      const newArticles = data.data || []
      
      // Set current filtered articles
      setArticles(newArticles)
      
      // Update allArticles by merging new articles, avoiding duplicates
      setAllArticles(prev => {
        const existingIds = new Set(prev.map(a => a.news_id))
        const uniqueNewArticles = newArticles.filter(article => !existingIds.has(article.news_id))
        return [...prev, ...uniqueNewArticles]
      })
      
      if (newArticles.length === 0) {
        toast({
          title: "No articles found",
          description: "Try adjusting your search criteria",
        })
      } else {
        toast({
          title: "Search completed",
          description: `Found ${newArticles.length} articles, ${selectedIds.size} total articles selected`,
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while fetching articles"
      console.error("[BulletinGenerator] Error:", errorMessage)
      toast({
        title: "Error fetching articles",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [query, theme, page, limit, filters, toast, selectedIds, allArticles])

  /**
   * Performs a search with default filter values
   */
  const searchArticlesWithDefaultFilters = useCallback(async () => {
    const defaultTypeId = Number.parseInt(THEME_CONFIG.blue.type_id)
    
    const formData: BulletinFormData = {
      theme: "blue",
      page: 1,
      limit,
      type_id: defaultTypeId,
      // No query, jurisdiction_id, or date filters
    }

    setLoading(true)
    try {
      const data = await fetchNewsAction({
        page: formData.page,
        limit: formData.limit,
        type_id: formData.type_id,
        // No other filters to keep it broad
      })

      const newArticles = data.data || []
      
      // Set current filtered articles
      setArticles(newArticles)
      
      // Update allArticles by merging new articles, avoiding duplicates
      setAllArticles(prev => {
        const existingIds = new Set(prev.map(a => a.news_id))
        const uniqueNewArticles = newArticles.filter(article => !existingIds.has(article.news_id))
        return [...prev, ...uniqueNewArticles]
      })
      
      if (newArticles.length === 0) {
        toast({
          title: "No articles found",
          description: "Try adjusting your search criteria",
        })
      } else {
        toast({
          title: "Search completed",
          description: `Found ${newArticles.length} articles, ${selectedIds.size} total articles selected`,
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while fetching articles"
      console.error("[BulletinGenerator] Error:", errorMessage)
      toast({
        title: "Error fetching articles",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [limit, toast, selectedIds])

  /**
   * Auto-search when filters change
   */
  useEffect(() => {
    // Trigger initial search on component mount
    const timeoutId = setTimeout(() => {
      searchArticles()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [])

  /**
   * Auto-search when filters change
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchArticles()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [query, theme, filters])

  /**
   * Calculates date range based on selected option
   */
  const calculateDateRange = (option: DateFilterOption) => {
    const today = new Date()
    const fromDate = new Date()

    switch (option) {
      case "last_week":
        fromDate.setDate(today.getDate() - 7)
        break
      case "last_2_weeks":
        fromDate.setDate(today.getDate() - 14)
        break
      case "last_month":
        fromDate.setMonth(today.getMonth() - 1)
        break
      case "custom":
        return { from: "", to: "" }
    }

    const formatDate = (date: Date) => date.toISOString().split('T')[0]
    
    return {
      from: formatDate(fromDate),
      to: formatDate(today)
    }
  }

  /**
   * Handles date filter change
   */
  const handleDateFilterChange = (value: DateFilterOption) => {
    setDateFilter(value)
    
    if (value !== "custom") {
      const dateRange = calculateDateRange(value)
      setFilters(prev => ({
        ...prev,
        published_at_from: dateRange.from,
        published_at_to: dateRange.to,
      }))
    } else {
      setFilters(prev => ({
        ...prev,
        published_at_from: "",
        published_at_to: ""
      }))
    }
    
    clearFieldError("published_at_from")
    clearFieldError("published_at_to")
  }

  /**
   * Clears validation error for a field
   */
  const clearFieldError = (fieldName: string) => {
    setValidationErrors((prev) => prev.filter((error) => error.field !== fieldName))
  }

  /**
   * Handles theme change
   */
  const handleThemeChange = (value: BulletinTheme) => {
    setTheme(value)
    clearFieldError("theme")
  }

  /**
   * Handles filter changes
   */
  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
    
    if (field === "published_at_from" || field === "published_at_to") {
      setDateFilter("custom")
    }
    
    clearFieldError(field)
  }

  /**
   * Handles query change with debouncing
   */
  const handleQueryChange = (value: string) => {
    setQuery(value)
    clearFieldError("query")
  }

  /**
   * Resets all search filters to their default values while preserving selected articles
   */
  const resetAllFilters = () => {
    // Reset form state
    setQuery("")
    setPage(1)
    setCurrentPage(1)
    
    // Reset filters to default values
    setFilters({
      type_id: "all",
      jurisdiction_id: "all",
      published_at_from: "",
      published_at_to: "",
    })
    
    // Reset theme to default
    setTheme("blue")
    
    // Reset date filter to default
    setDateFilter("custom")
    
    // Reset validation errors
    setValidationErrors([])
    
    // Reset "Show Only Selected" view
    setShowOnlySelected(false)
    
    // Trigger a new search with default filters
    searchArticlesWithDefaultFilters()
    
    toast({
      title: "Filters reset",
      description: "All filters have been reset to default values",
    })
  }

  // Article selection functions
  const toggleArticle = (newsId: number) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(newsId)) {
      newSelected.delete(newsId)
    } else {
      newSelected.add(newsId)
    }
    setSelectedIds(newSelected)
  }

  /**
   * Clear all selections across all pages
   */
  const clearAllSelections = () => {
    setSelectedIds(new Set())
    setShowOnlySelected(false)
    toast({
      title: "Selections cleared",
      description: "All article selections have been cleared",
    })
  }

  /**
   * Toggle "Show Only Selected" view
   */
  const toggleShowOnlySelected = () => {
    setShowOnlySelected(prev => !prev)
    setCurrentPage(1) // Reset to first page when toggling
  }

  // Pagination functions
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Modal functions
  const openArticleModal = (article: Article) => {
    setSelectedArticle(article)
  }

  const closeArticleModal = () => {
    setSelectedArticle(null)
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

  const handleConfigChange = (field: keyof BulletinConfig, value: any) => {
    setBulletinConfig((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Bulletin generation functions
  const selectedArticles = allArticles
    .filter((a) => selectedIds.has(a.news_id))

  const handleGenerateConfirm = async () => {
    closeGenerateConfirmationModal()
    setIsGenerating(true)

    try {
      // Group articles by country for regional sections
      const articlesByCountry = selectedArticles.reduce((acc: Record<string, Article[]>, article: Article) => {
        const country = article.jurisdictions?.[0]?.name || "International"
        if (!acc[country]) acc[country] = []
        acc[country].push(article)
        return acc
      }, {})

      // Set bulletin data
      setBulletinData({
        theme,
        articles: selectedArticles,
        articlesByCountry,
        bulletinConfig,
      })

      toast({
        title: "Bulletin generated successfully",
        description: "Your ESG bulletin is ready",
      })
    } catch (error) {
      console.error("Error generating bulletin:", error)
      toast({
        title: "Failed to generate bulletin",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Calculate display range for pagination description
  const displayStart = Math.min((currentPage - 1) * ARTICLES_PER_PAGE + 1, showOnlySelected ? selectedIds.size : articles.length)
  const displayEnd = Math.min(currentPage * ARTICLES_PER_PAGE, showOnlySelected ? selectedIds.size : articles.length)
  const totalDisplayCount = showOnlySelected ? selectedIds.size : articles.length

  // If we have bulletin data, show the output
  if (bulletinData) {
    return <BulletinOutput data={bulletinData} onStartOver={() => setBulletinData(null)} />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
      <div className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3">
        ESG Bulletin Generator
      </div>
        {/* Simplified Filters Section */}
        <Card className="shadow-sm mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Search Articles</CardTitle>
                <CardDescription>
                  {loading ? "Searching..." : `Found ${articles.length} articles, ${selectedIds.size} selected`}
                </CardDescription>
              </div>
              <Button
                onClick={resetAllFilters}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {/* Main Search Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search Input - Wider */}
                <div className="md:col-span-2 space-y-2">
                  <Label>Search Articles</Label>
                  <Input
                    type="text"
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    placeholder="Search by title, summary, or content..."
                  />
                </div>

                {/* Theme */}
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select value={theme} onValueChange={handleThemeChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["blue", "green", "red"] as const).map((color) => (
                        <SelectItem key={color} value={color}>
                          {THEME_CONFIG[color].name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select value={dateFilter} onValueChange={handleDateFilterChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATE_FILTER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quick Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Content Type */}
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select value={filters.type_id} onValueChange={(value) => handleFilterChange("type_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="1">Generic</SelectItem>
                      <SelectItem value="2">Disclosure</SelectItem>
                      <SelectItem value="3">Regulatory</SelectItem>
                      <SelectItem value="4">Litigation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Jurisdiction */}
                <div className="space-y-2">
                  <Label>Jurisdiction</Label>
                  <Select
                    value={filters.jurisdiction_id}
                    onValueChange={(value) => handleFilterChange("jurisdiction_id", value)}
                    disabled={loadingJurisdictions}
                  >
                    <SelectTrigger>
                      {loadingJurisdictions ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          <span>Loading jurisdictions...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="All regions" />
                      )}
                    </SelectTrigger>
                    <SelectContent className="max-h-[400px]">
                      <SelectItem value="all">All regions</SelectItem>
                      
                      {Object.entries(groupedJurisdictions).map(([groupName, groupJurisdictions]) => (
                        groupJurisdictions.length > 0 && (
                          <div key={groupName}>
                         
                            {groupJurisdictions.map((jurisdiction) => (
                              <SelectItem 
                                key={jurisdiction.id} 
                                value={jurisdiction.id.toString()}
                              >
                                {jurisdiction.name}
                              </SelectItem>
                            ))}
                          </div>
                        )
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Date Inputs - Only show when custom date range is selected */}
                {dateFilter === "custom" && (
                  <div className="space-y-2">
                    <Label>Custom Dates</Label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={filters.published_at_from}
                        onChange={(e) => handleFilterChange("published_at_from", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="date"
                        value={filters.published_at_to}
                        onChange={(e) => handleFilterChange("published_at_to", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Articles Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Articles</CardTitle>
                <CardDescription>
                  {articles.length > 0 
                    ? `Showing ${displayStart}-${displayEnd} of ${totalDisplayCount} articles (${selectedIds.size} total selected)`
                    : "Search for articles to get started"
                  }
                  {showOnlySelected && (
                    <span className="text-blue-600 font-medium ml-2">• Showing only selected articles</span>
                  )}
                </CardDescription>
              </div>
              {articles.length > 0 && (
                <div className="flex gap-2">
                  {/* Show Only Selected Button */}
                  <Button
                    onClick={toggleShowOnlySelected}
                    variant={showOnlySelected ? "default" : "outline"}
                    size="sm"
                    style={{
                      backgroundColor: showOnlySelected ? THEME_CONFIG[theme].color : undefined,
                    }}
                    disabled={selectedIds.size === 0}
                  >
                    {showOnlySelected ? (
                      <>
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Show All ({selectedIds.size} selected)
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Show Selected ({selectedIds.size})
                      </>
                    )}
                  </Button>
                  
                  {selectedIds.size > 0 && (
                    <Button
                      onClick={clearAllSelections}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Clear All
                    </Button>
                  )}
                  <Button
                    onClick={openConfigModal}
                    disabled={selectedIds.size === 0}
                    size="sm"
                    style={{
                      backgroundColor: selectedIds.size === 0 ? "#ccc" : THEME_CONFIG[theme].color,
                    }}
                  >
                    Configure Bulletin
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {articles.length === 0 && !loading ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No articles yet</h3>
                <p className="text-gray-500">Use the search filters to find articles</p>
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-600">Searching articles...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {displayedArticles.map((article) => (
                    <div
                      key={article.news_id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => openArticleModal(article)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(article.news_id)}
                        onChange={() => toggleArticle(article.news_id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-medium text-gray-900">{article.news_title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {article.news_summary}
                        </p>
                        <div className="flex flex-wrap gap-1 text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {article.jurisdictions?.[0]?.name || "International"}
                          </span>
                          <span className="bg-gray-100 px-2 py-1 rounded">{article.type_value}</span>
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {new Date(article.published_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-500">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPrevPage}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      {/* Page Numbers - Show only 5 pages at a time */}
                      <div className="flex gap-1">
                        {getVisiblePages().map((pageNum) => (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(pageNum)}
                            style={{
                              backgroundColor: currentPage === pageNum ? THEME_CONFIG[theme].color : undefined,
                            }}
                          >
                            {pageNum}
                          </Button>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {articles.length > 0 && (
              <div className="flex justify-center mt-6">
                <Button
                  onClick={openGenerateConfirmationModal}
                  disabled={selectedIds.size === 0 || isGenerating}
                  className="px-8"
                  style={{
                    backgroundColor: selectedIds.size === 0 ? "#ccc" : THEME_CONFIG[theme].color,
                  }}
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </div>
                  ) : (
                    `Generate Bulletin (${selectedIds.size})`
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ArticleDetailModal
        article={selectedArticle!}
        isOpen={!!selectedArticle}
        onClose={closeArticleModal}
        isSelected={selectedIds.has(selectedArticle?.news_id || -1)}
        onToggleSelection={toggleArticle}
        customPrompts={new Map()}
        customSummaries={new Map()}
        onPromptChange={() => {}}
        onSummaryChange={() => {}}
        onGenerateSummary={() => Promise.resolve()}
        onResetSummary={() => {}}
        onUseOriginalSummary={() => {}}
        isGeneratingSummary={null}
      />

      <BulletinConfigModal
        isOpen={configModalOpen}
        onClose={closeConfigModal}
        config={bulletinConfig}
        onConfigChange={handleConfigChange}
        onRandomImage={(field) => {
          handleConfigChange(field, "https://picsum.photos/600/400")
        }}
        selectedArticlesCount={selectedIds.size}
        theme={theme}
        articles={selectedArticles}
      />

      <ConfirmationModal
        isOpen={generateConfirmationModalOpen}
        onClose={closeGenerateConfirmationModal}
        onConfirm={handleGenerateConfirm}
        title="Generate Bulletin"
        message={`Generate bulletin with ${selectedIds.size} article${selectedIds.size !== 1 ? "s" : ""}?`}
        confirmText={isGenerating ? "Generating..." : "Generate"}
        cancelText="Cancel"
        theme={theme}
        isLoading={isGenerating}
      />
    </div>
  )
}