"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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
  articlesByCountry,
}: CountryMappingModalProps) {
  const [mappedCountries, setMappedCountries] = useState<Record<string, string>>({})
  const [hasAutoMapped, setHasAutoMapped] = useState(false)

  const COUNTRY_NAME_MAP: Record<string, string> = {
    "United States of America": "United States",
    "United Kingdom": "United Kingdom",
    "Dem. Rep. Congo": "Democratic Republic of the Congo",
    Czechia: "Czech Republic",
    "Bosnia and Herz.": "Bosnia and Herzegovina",
    "Dominican Rep.": "Dominican Republic",
  }

  const SPECIAL_CASES = {
    "European Union": [
      "Austria",
      "Belgium",
      "Bulgaria",
      "Croatia",
      "Cyprus",
      "Czech Republic",
      "Denmark",
      "Estonia",
      "Finland",
      "France",
      "Germany",
      "Greece",
      "Hungary",
      "Ireland",
      "Italy",
      "Latvia",
      "Lithuania",
      "Luxembourg",
      "Malta",
      "Netherlands",
      "Poland",
      "Portugal",
      "Romania",
      "Slovakia",
      "Slovenia",
      "Spain",
      "Sweden",
    ],
    EU: [
      "Austria",
      "Belgium",
      "Bulgaria",
      "Croatia",
      "Cyprus",
      "Czech Republic",
      "Denmark",
      "Estonia",
      "Finland",
      "France",
      "Germany",
      "Greece",
      "Hungary",
      "Ireland",
      "Italy",
      "Latvia",
      "Lithuania",
      "Luxembourg",
      "Malta",
      "Netherlands",
      "Poland",
      "Portugal",
      "Romania",
      "Slovakia",
      "Slovenia",
      "Spain",
      "Sweden",
    ],
    International: "ALL",
    World: "ALL",
    Global: "ALL",
  }

  const findMatchingCountries = (countryName: string): string[] => {
    const matches: string[] = []

    const exactMatch =
      Object.keys(COUNTRY_NAME_MAP).find((geoName) => geoName.toLowerCase() === countryName.toLowerCase()) ||
      Object.values(COUNTRY_NAME_MAP).find((mappedName) => mappedName.toLowerCase() === countryName.toLowerCase())

    if (exactMatch) {
      matches.push(COUNTRY_NAME_MAP[exactMatch] || exactMatch)
      return matches
    }

    Object.keys(COUNTRY_NAME_MAP).forEach((geoName) => {
      if (
        geoName.toLowerCase().includes(countryName.toLowerCase()) ||
        countryName.toLowerCase().includes(geoName.toLowerCase())
      ) {
        matches.push(COUNTRY_NAME_MAP[geoName] || geoName)
      }
    })

    Object.values(COUNTRY_NAME_MAP).forEach((mappedName) => {
      if (
        mappedName.toLowerCase().includes(countryName.toLowerCase()) ||
        countryName.toLowerCase().includes(mappedName.toLowerCase())
      ) {
        matches.push(mappedName)
      }
    })

    return [...new Set(matches)]
  }

  useEffect(() => {
    if (isOpen && !hasAutoMapped) {
      const autoMappings: Record<string, string> = {}

      countries.forEach((country) => {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Auto-Mapping Countries</h2>
          <p className="text-gray-600 mt-2">
            Automatically mapping {countries.length} countries to their geographic locations...
          </p>
          <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <strong>Auto-mapping in progress:</strong> All countries are being automatically mapped. Special cases
              like "European Union", "International", and "World" are handled automatically.
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

interface DragDropImageUploadProps {
  onImageUpload: (file: File) => void
  onRemoveImage?: () => void
  currentImage?: string
  placeholder?: string
  className?: string
  disabled?: boolean
  showUploadInterface?: boolean
  showRemoveButton?: boolean
}

function DragDropImageUpload({
  onImageUpload,
  onRemoveImage,
  currentImage,
  placeholder = "Drag & drop an image here or click to browse",
  className = "",
  disabled = false,
  showUploadInterface = true,
  showRemoveButton = true,
}: DragDropImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(currentImage || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setPreviewUrl(currentImage || "")
  }, [currentImage])

  const handleDragOver = (e: React.DragEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith("image/")) {
        handleFile(file)
      }
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      handleFile(file)
    }
  }

  const handleFile = (file: File) => {
    onImageUpload(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleClick = () => {
    if (disabled || !showUploadInterface) return
    fileInputRef.current?.click()
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onRemoveImage) {
      onRemoveImage()
    }
    setPreviewUrl("")
  }

  // If image exists and we shouldn't show upload interface, just display the image with remove button
  if (previewUrl && !showUploadInterface) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full aspect-square max-w-xs mx-auto">
          <img
            src={previewUrl || "/placeholder.svg"}
            alt="Article"
            className="w-full h-full object-cover rounded-lg border shadow-sm"
          />
        </div>
        {showRemoveButton && onRemoveImage && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors print:hidden"
            title="Remove image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    )
  }

  if (disabled) {
    return (
      <div className={`border-2 border-dashed border-gray-300 rounded-lg p-4 ${className}`}>
        {previewUrl ? (
          <div className="relative">
            <div className="w-full aspect-square max-w-xs mx-auto">
              <img
                src={previewUrl || "/placeholder.svg"}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg border shadow-sm"
              />
            </div>
            {showRemoveButton && onRemoveImage && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
                title="Remove image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <p>No image</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
        ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
        ${className}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />

      {previewUrl ? (
        <div className="space-y-2 relative">
          <div className="w-full aspect-square max-w-xs mx-auto">
            <img
              src={previewUrl || "/placeholder.svg"}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg border shadow-sm"
            />
          </div>
          <div className="flex justify-center gap-2">
            <p className="text-sm text-gray-600">Click or drag to change image</p>
            {showRemoveButton && onRemoveImage && (
              <button
                type="button"
                onClick={handleRemove}
                className="text-sm text-red-600 hover:text-red-800 underline"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-gray-600">{placeholder}</p>
          <p className="text-sm text-gray-500 mt-1">Supports JPG, PNG, GIF</p>
        </div>
      )}
    </div>
  )
}

interface ArticleImageDisplayProps {
  imageUrl?: string
  alt: string
  onImageUpload?: (file: File) => void
  onRemoveImage?: () => void
  editable?: boolean
  className?: string
}
interface ArticleImageDisplayProps {
  imageUrl?: string
  alt: string
  onImageUpload?: (file: File) => void
  onRemoveImage?: () => void
  editable?: boolean
  className?: string
}

function ArticleImageDisplay({
  imageUrl,
  alt,
  onImageUpload,
  onRemoveImage,
  editable = true,
  className = "",
}: ArticleImageDisplayProps) {
  const [imageError, setImageError] = useState(false)

  const handleRemove = () => {
    if (onRemoveImage) {
      onRemoveImage()
    }
    setImageError(false)
  }

  // If image exists and loaded successfully, show it in 4:3 format with remove button
  if (imageUrl && !imageError) {
    return (
      <div className={`mb-6 print:mb-4 relative ${className}`}>
        <div className="w-full aspect-[4/3]">
          {" "}
          {/* 4:3 aspect ratio */}
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={alt}
            className="w-full h-full object-cover rounded-lg border shadow-lg"
            onError={() => setImageError(true)}
          />
          {/* Remove button - only show when editable and onRemoveImage is provided */}
          {editable && onRemoveImage && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors print:hidden"
              title="Remove image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    )
  }

  // If no image or image failed to load, and editing is allowed, show upload interface
  if (editable && onImageUpload) {
    return (
      <div className={`mb-6 print:mb-4 print:hidden ${className}`}>
        <DragDropImageUpload
          onImageUpload={onImageUpload}
          onRemoveImage={onRemoveImage}
          currentImage={imageUrl}
          placeholder="Drag & drop article image or click to browse"
          className="h-48"
          showUploadInterface={!imageUrl || imageError}
          showRemoveButton={!!imageUrl && !imageError}
        />
      </div>
    )
  }

  // If no image and not editable, show nothing
  return null
}

interface HeaderEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (headerData: {
    headerText: string
    issueNumber: string
    publicationDate: string
    headerImage: string
    publisherLogo: string
  }) => void
  currentData: {
    headerText: string
    issueNumber: string
    publicationDate: string
    headerImage: string
    publisherLogo: string
  }
}

function HeaderEditModal({ isOpen, onClose, onSave, currentData }: HeaderEditModalProps) {
  const [formData, setFormData] = useState(currentData)

  useEffect(() => {
    if (isOpen) {
      setFormData(currentData)
    }
  }, [isOpen, currentData])

  const handleImageUpload = (field: "headerImage" | "publisherLogo", file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setFormData((prev) => ({ ...prev, [field]: result }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Edit Header Content</h2>
          <p className="text-gray-600 mt-2">Update your bulletin header information and images</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Header Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Header Title</label>
            <input
              type="text"
              value={formData.headerText}
              onChange={(e) => setFormData((prev) => ({ ...prev, headerText: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ESG DISCLOSURE & REPORTING BULLETIN"
            />
          </div>

          {/* Issue Number and Publication Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issue Number</label>
              <input
                type="text"
                value={formData.issueNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, issueNumber: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Issue #10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Publication Date</label>
              <input
                type="month"
                value={formData.publicationDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, publicationDate: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Header Background Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Header Background Image</label>
            <DragDropImageUpload
              onImageUpload={(file) => handleImageUpload("headerImage", file)}
              currentImage={formData.headerImage}
              placeholder="Drag & drop header background image or click to browse"
              className="h-100"
            />
          </div>

          {/* Publisher Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Publisher Logo</label>
            <DragDropImageUpload
              onImageUpload={(file) => handleImageUpload("publisherLogo", file)}
              currentImage={formData.publisherLogo}
              placeholder="Drag & drop publisher logo or click to browse"
              className="h-100"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" onClick={onClose} variant="outline" className="px-6 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface ArticleEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (articleId: string, updatedArticle: any) => void
  article: any
}

function ArticleEditModal({ isOpen, onClose, onSave, article }: ArticleEditModalProps) {
  const [editedArticle, setEditedArticle] = useState({
    news_title: article?.news_title || "",
    news_summary: article?.news_summary || "",
    imageUrl: article?.imageUrl || "",
    source_alias: article?.source?.[0]?.source_alias || "",
    source_url: article?.source?.[0]?.source_url || "",
  })

  const [loadingSource, setLoadingSource] = useState(false)
  const [sourceError, setSourceError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && article) {
      setEditedArticle({
        news_title: article.news_title || "",
        news_summary: article.news_summary || "",
        imageUrl: article.imageUrl || "",
        source_alias: article.source?.[0]?.source_alias || "",
        source_url: article.source?.[0]?.source_url || "",
      })

      // Reset error state
      setSourceError(null)

      // If article doesn't have source data but has news_id, fetch it
      if (article.news_id && (!article.source || article.source.length === 0 || !article.source[0]?.source_alias)) {
        fetchSourceData(article.news_id)
      }
    }
  }, [isOpen, article])

  const fetchSourceData = async (newsId: string) => {
    try {
      setLoadingSource(true)
      setSourceError(null)

      const response = await fetch(`/api/internal/news/${newsId}/details`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Update the source fields with the fetched data
      if (data.data?.source?.[0]) {
        setEditedArticle((prev) => ({
          ...prev,
          source_alias: data.data.source[0].source_alias || "",
          source_url: data.data.source[0].source_url || "",
        }))
      } else {
        setSourceError("No source data found for this article")
      }
    } catch (error) {
      console.error("Error fetching source data:", error)
      setSourceError(error instanceof Error ? error.message : "Failed to fetch source data")
    } finally {
      setLoadingSource(false)
    }
  }

  const handleImageUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setEditedArticle((prev) => ({ ...prev, imageUrl: result }))
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setEditedArticle((prev) => ({ ...prev, imageUrl: "" }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Prepare the updated source array
    const updatedSource = [
      {
        id: article.source?.[0]?.id,
        source_alias: editedArticle.source_alias,
        source_url: editedArticle.source_url,
        source_file_key: article.source?.[0]?.source_file_key,
      },
    ]

    onSave(article.news_id, {
      news_title: editedArticle.news_title,
      news_summary: editedArticle.news_summary,
      imageUrl: editedArticle.imageUrl,
      source: updatedSource,
    })
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Formatting helper functions for article modal
  const applyFormatting = (text: string, formatType: "bold" | "italic"): string => {
    const textarea = document.activeElement as HTMLTextAreaElement
    if (!textarea || textarea.tagName !== "TEXTAREA") return text

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = text.substring(start, end)

    if (!selectedText) return text

    let formattedText = ""
    if (formatType === "bold") {
      formattedText = `**${selectedText}**`
    } else if (formatType === "italic") {
      formattedText = `*${selectedText}*`
    }

    const newText = text.substring(0, start) + formattedText + text.substring(end)

    setTimeout(() => {
      textarea.selectionStart = start + formattedText.length
      textarea.selectionEnd = start + formattedText.length
      textarea.focus()
    }, 0)

    return newText
  }

  const handleBold = () => {
    const newSummary = applyFormatting(editedArticle.news_summary, "bold")
    setEditedArticle((prev) => ({ ...prev, news_summary: newSummary }))
  }

  const handleItalic = () => {
    const newSummary = applyFormatting(editedArticle.news_summary, "italic")
    setEditedArticle((prev) => ({ ...prev, news_summary: newSummary }))
  }

  // Keyboard shortcut handler for article modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && isOpen) {
        const activeElement = document.activeElement
        if (activeElement && activeElement.tagName === "TEXTAREA") {
          switch (e.key.toLowerCase()) {
            case "b":
              e.preventDefault()
              handleBold()
              break
            case "i":
              e.preventDefault()
              handleItalic()
              break
          }
        }
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, editedArticle.news_summary])

  if (!isOpen || !article) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Edit News Article</h2>
          <p className="text-gray-600 mt-2">Update the article title, summary, image, and source</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Article Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Article Title</label>
            <input
              type="text"
              value={editedArticle.news_title}
              onChange={(e) => setEditedArticle((prev) => ({ ...prev, news_title: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter article title"
            />
          </div>

          {/* Article Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Article Summary</label>
            <textarea
              value={editedArticle.news_summary}
              onChange={(e) => setEditedArticle((prev) => ({ ...prev, news_summary: e.target.value }))}
              rows={8}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter article summary"
            />
            <p className="text-xs text-gray-500 mt-2">
              Use <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl+B</kbd> for bold,{" "}
              <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl+I</kbd> for italic
            </p>
          </div>

          {/* Source Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source Information
              {loadingSource && <span className="ml-2 text-xs text-blue-600">Loading source data...</span>}
            </label>

            {sourceError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  <strong>Error loading source:</strong> {sourceError}
                </p>
                <button
                  type="button"
                  onClick={() => fetchSourceData(article.news_id)}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Source Name</label>
                <input
                  type="text"
                  value={editedArticle.source_alias}
                  onChange={(e) => setEditedArticle((prev) => ({ ...prev, source_alias: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Source name"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Source URL</label>
                <input
                  type="url"
                  value={editedArticle.source_url}
                  onChange={(e) => setEditedArticle((prev) => ({ ...prev, source_url: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/article"
                />
              </div>
            </div>

            {!editedArticle.source_alias && !editedArticle.source_url && !loadingSource && (
              <p className="mt-2 text-xs text-gray-500">
                Source information will be automatically loaded if available.
              </p>
            )}
          </div>

          {/* Article Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Article Image
              {editedArticle.imageUrl && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="ml-2 text-xs text-red-600 hover:text-red-800 underline"
                >
                  Remove Image
                </button>
              )}
            </label>
            <DragDropImageUpload
              onImageUpload={handleImageUpload}
              onRemoveImage={editedArticle.imageUrl ? handleRemoveImage : undefined}
              currentImage={editedArticle.imageUrl}
              placeholder="Drag & drop article image or click to browse"
              className="h-100"
              showRemoveButton={!!editedArticle.imageUrl}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" onClick={onClose} variant="outline" className="px-6 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function BulletinOutput({ data, onStartOver }: BulletinOutputProps) {
  const { theme, articles: initialArticles, articlesByCountry, bulletinConfig } = data

  // Create a safe bulletin config with fallbacks
  const safeBulletinConfig = bulletinConfig || {
    headerText: "ESG DISCLOSURE & REPORTING BULLETIN",
    issueNumber: "",
    publicationDate: new Date().toISOString().split("T")[0],
    headerImage: "",
    publisherLogo: "",
    footerImage: "",
    greetingMessage: "",
    keyTrends: true,
    executiveSummary: true,
    keyTakeaways: true,
    interactiveMap: true,
    euSection: { enabled: true, title: "", introduction: "", trends: "", keyTrends: true },
    usSection: { enabled: true, title: "", introduction: "", trends: "", keyTrends: true },
    globalSection: { enabled: true, title: "", introduction: "", trends: "", keyTrends: true },
    generatedContent: {
      keyTrends: "",
      executiveSummary: "",
      keyTakeaways: "",
    },
  }

  const [showMappingModal, setShowMappingModal] = useState(true)
  const [showHeaderEditModal, setShowHeaderEditModal] = useState(false)
  const [showArticleEditModal, setShowArticleEditModal] = useState(false)
  const [countryMappings, setCountryMappings] = useState<Record<string, string>>({})
  const [editingArticle, setEditingArticle] = useState<any>(null)
  const [regeneratingArticle, setRegeneratingArticle] = useState<string | null>(null)
  const [articles, setArticles] = useState(initialArticles)
  const [loadingSources, setLoadingSources] = useState(false)
  const [editableContent, setEditableContent] = useState({
    // Header content
    headerText: safeBulletinConfig.headerText || "",
    issueNumber: safeBulletinConfig.issueNumber || "",
    publicationDate: safeBulletinConfig.publicationDate || "",
    headerImage: safeBulletinConfig.headerImage || "",
    publisherLogo: safeBulletinConfig.publisherLogo || "",
    footerImage: safeBulletinConfig.footerImage || "",

    // Main content
    greetingMessage: safeBulletinConfig.greetingMessage || "",
    keyTrends: safeBulletinConfig.generatedContent?.keyTrends || "",
    executiveSummary: safeBulletinConfig.generatedContent?.executiveSummary || "",
    keyTakeaways: safeBulletinConfig.generatedContent?.keyTakeaways || "",

    // Regional sections
    euSection: {
      title: safeBulletinConfig.euSection?.title || "",
      introduction: safeBulletinConfig.euSection?.introduction || "",
      trends: safeBulletinConfig.euSection?.trends || "",
    },
    usSection: {
      title: safeBulletinConfig.usSection?.title || "",
      introduction: safeBulletinConfig.usSection?.introduction || "",
      trends: safeBulletinConfig.usSection?.trends || "",
    },
    globalSection: {
      title: safeBulletinConfig.globalSection?.title || "",
      introduction: safeBulletinConfig.globalSection?.introduction || "",
      trends: safeBulletinConfig.globalSection?.trends || "",
    },
  })
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null)

  const countries = Object.keys(articlesByCountry)

  const themeColors = {
    blue: "#1976D2",
    green: "#388E3C",
    red: "#D32F2F",
  }

  // Automatically fetch source data for all articles on initial load
  useEffect(() => {
    const fetchMissingSources = async () => {
      const articlesNeedingSource = articles.filter(
        (article) =>
          article.news_id && (!article.source || article.source.length === 0 || !article.source[0]?.source_alias),
      )

      if (articlesNeedingSource.length === 0) return

      setLoadingSources(true)

      try {
        for (const article of articlesNeedingSource) {
          try {
            const response = await fetch(`/api/internal/news/${article.news_id}/details`)

            if (response.ok) {
              const data = await response.json()

              if (data.data?.source?.[0]) {
                handleArticleUpdate(article.news_id, {
                  source: [
                    {
                      id: article.source?.[0]?.id,
                      source_alias: data.data.source[0].source_alias || "",
                      source_url: data.data.source[0].source_url || "",
                      source_file_key: article.source?.[0]?.source_file_key,
                    },
                  ],
                })
              }
            }
          } catch (error) {
            console.error(`Error fetching source for article ${article.news_id}:`, error)
          }
        }
      } finally {
        setLoadingSources(false)
      }
    }

    if (articles.length > 0) {
      fetchMissingSources()
    }
  }, [articles.length])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatConfigDate = (dateString: string) => {
    if (!dateString) return "Current Month"
    return new Date(dateString + "-01").toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
  }

  const handleHeaderSave = (headerData: {
    headerText: string
    issueNumber: string
    publicationDate: string
    headerImage: string
    publisherLogo: string
  }) => {
    setEditableContent((prev) => ({
      ...prev,
      ...headerData,
    }))
  }

  const handleArticleUpdate = (articleId: string, updatedArticle: any) => {
    setArticles((prev) =>
      prev.map((article) => (article.news_id === articleId ? { ...article, ...updatedArticle } : article)),
    )
  }

  const handleContentChange = (section: string, field: string, value: string) => {
    setEditableContent((prev) => {
      if (!field) {
        return {
          ...prev,
          [section]: value,
        }
      }

      if (section.includes("Section")) {
        const sectionKey = section as "euSection" | "usSection" | "globalSection"
        return {
          ...prev,
          [sectionKey]: {
            ...prev[sectionKey],
            [field]: value,
          },
        }
      } else {
        return {
          ...prev,
          [section]: value,
        }
      }
    })
  }

  const handleEditToggle = (sectionId: string) => {
    setIsEditing(isEditing === sectionId ? null : sectionId)
  }

  const handleSave = (sectionId: string) => {
    setIsEditing(null)
    console.log(`Saved content for ${sectionId}:`, editableContent)
  }

  // Formatting helper functions
  const applyFormatting = (text: string, formatType: "bold" | "italic"): string => {
    const textarea = document.activeElement as HTMLTextAreaElement
    if (!textarea || textarea.tagName !== "TEXTAREA") return text

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = text.substring(start, end)

    if (!selectedText) return text

    let formattedText = ""
    if (formatType === "bold") {
      formattedText = `**${selectedText}**`
    } else if (formatType === "italic") {
      formattedText = `*${selectedText}*`
    }

    const newText = text.substring(0, start) + formattedText + text.substring(end)

    setTimeout(() => {
      textarea.selectionStart = start + formattedText.length
      textarea.selectionEnd = start + formattedText.length
      textarea.focus()
    }, 0)

    return newText
  }

  const handleBold = () => {
    if (!isEditing) return

    const [section, field] = isEditing.split("-")
    const currentContent = field
      ? editableContent[section as keyof typeof editableContent]?.[
          field as keyof (typeof editableContent)[keyof typeof editableContent]
        ]
      : editableContent[section as keyof typeof editableContent]

    if (typeof currentContent === "string") {
      const newContent = applyFormatting(currentContent, "bold")
      handleContentChange(section, field, newContent)
    }
  }

  const handleItalic = () => {
    if (!isEditing) return

    const [section, field] = isEditing.split("-")
    const currentContent = field
      ? editableContent[section as keyof typeof editableContent]?.[
          field as keyof (typeof editableContent)[keyof typeof editableContent]
        ]
      : editableContent[section as keyof typeof editableContent]

    if (typeof currentContent === "string") {
      const newContent = applyFormatting(currentContent, "italic")
      handleContentChange(section, field, newContent)
    }
  }

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && isEditing) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault()
            handleBold()
            break
          case "i":
            e.preventDefault()
            handleItalic()
            break
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isEditing])

  const handleRegenerate = async (sectionId: string) => {
    setIsRegenerating(sectionId)
    try {
      const [section, field] = sectionId.split("-")
      const typeMapping: Record<string, string> = {
        headerText: "header_text",
        issueNumber: "issue_number",
        greetingMessage: "greeting",
        keyTrends: "key_trends",
        executiveSummary: "executive_summary",
        keyTakeaways: "key_takeaways",
        "euSection-title": "section_title",
        "euSection-introduction": "section_intro",
        "euSection-trends": "section_trends",
        "usSection-title": "section_title",
        "usSection-introduction": "section_intro",
        "usSection-trends": "section_trends",
        "globalSection-title": "section_title",
        "globalSection-introduction": "section_intro",
        "globalSection-trends": "section_trends",
      }

      const apiType = typeMapping[sectionId]
      if (!apiType) {
        console.error("Unknown section type:", sectionId)
        return
      }

      let regionalArticles = []
      let region = ""

      if (section.includes("Section")) {
        region = section.replace("Section", "").toUpperCase()
        regionalArticles = getArticlesByJurisdiction(region)
      } else {
        regionalArticles = articles
      }

      const requestBody: any = {
        type: apiType,
        articles: regionalArticles,
        currentDate: safeBulletinConfig.publicationDate || new Date().toISOString().split("T")[0],
        customInstructions: safeBulletinConfig.customInstructions || "",
      }

      if (region) {
        requestBody.region = region
      }

      if (apiType === "greeting") {
        requestBody.previousGreeting = safeBulletinConfig.previousGreeting || ""
      }

      const response = await fetch("/api/generate-bulletin-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error("Failed to regenerate content")
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      setEditableContent((prev) => {
        if (section.includes("Section")) {
          const sectionKey = section as "euSection" | "usSection" | "globalSection"
          return {
            ...prev,
            [sectionKey]: {
              ...prev[sectionKey],
              [field]: data.content,
            },
          }
        } else {
          return {
            ...prev,
            [section]: data.content,
          }
        }
      })
    } catch (error) {
      console.error("Error regenerating content:", error)
    } finally {
      setIsRegenerating(null)
    }
  }

  const handleRegenerateArticle = async (articleId: string) => {
    setRegeneratingArticle(articleId)
    try {
      const article = articles.find((a) => a.news_id === articleId)
      if (!article) return

      const response = await fetch("/api/generate-article-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          articleContent: article.news_content || article.news_summary,
          prompt:
            "Generate a concise, professional summary focusing on key ESG-related aspects and main points. Include key deadlines, dates, and the issuing authority.",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to regenerate article summary")
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      handleArticleUpdate(articleId, {
        news_summary: data.summary,
      })
    } catch (error) {
      console.error("Error regenerating article summary:", error)
    } finally {
      setRegeneratingArticle(null)
    }
  }

  const formatBoldText = (text: string) => {
    if (!text) return ""

    const sentences = text.split(/(?<=[.!?])\s+/)

    return (
      <div className="text-justify leading-relaxed">
        {sentences.map((sentence, index) => {
          const formattedSentence = sentence.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, partIndex) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              const boldText = part.slice(2, -2)
              return (
                <strong key={partIndex} className="font-bold">
                  {boldText}
                </strong>
              )
            } else if (part.startsWith("*") && part.endsWith("*") && part.length > 1) {
              const italicText = part.slice(1, -1)
              return (
                <em key={partIndex} className="italic">
                  {italicText}
                </em>
              )
            }
            return part
          })

          if (index === 0) {
            return (
              <span key={index} className="inline-block">
                <span className="inline-block w-8">{"\u00A0"}</span>
                {formattedSentence}
              </span>
            )
          }

          return <span key={index}> {formattedSentence}</span>
        })}
      </div>
    )
  }

  const getArticlesByJurisdiction = (jurisdiction: string) => {
    return articles.filter((article) => {
      if (!article.jurisdictions || article.jurisdictions.length === 0) {
        return jurisdiction === "GLOBAL"
      }

      return article.jurisdictions.some((j) => {
        const jName = j.name?.toLowerCase() || ""
        const jCode = j.code?.toLowerCase() || ""

        switch (jurisdiction.toUpperCase()) {
          case "EU":
            return (
              jName.includes("eu") || jName.includes("europe") || jName.includes("european") || jCode.includes("eu")
            )
          case "US":
            return (
              jName.includes("us") ||
              jName.includes("united states") ||
              jName.includes("america") ||
              jCode.includes("us")
            )
          case "GLOBAL":
            return !(
              jName.includes("eu") ||
              jName.includes("europe") ||
              jName.includes("us") ||
              jName.includes("united states")
            )
          default:
            return jName.includes(jurisdiction.toLowerCase()) || jCode.includes(jurisdiction.toLowerCase())
        }
      })
    })
  }

  const handleDownloadPDF = () => {
    window.print()
  }

  const getMapCountries = () => {
    const countrySet = new Set<string>()

    articles.forEach((article) => {
      article.jurisdictions?.forEach((jurisdiction) => {
        const countryName = jurisdiction.name
        if (countryName && countryName !== "International") {
          countrySet.add(countryName)
        }
      })
    })

    return Array.from(countrySet)
  }

  const mapCountries = getMapCountries()

  const handleMappingConfirm = (mappings: Record<string, string>) => {
    setCountryMappings(mappings)
    setShowMappingModal(false)
  }

  // Direct image upload handler for article images only
  const handleArticleImageUpload = (articleId: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      handleArticleUpdate(articleId, { imageUrl: result })
    }
    reader.readAsDataURL(file)
  }

  const renderEditableText = (content: string, sectionId: string, placeholder: string, rows = 4) => {
    if (isEditing === sectionId) {
      return (
        <div className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => {
              const section = sectionId.split("-")[0]
              const field = sectionId.split("-")[1]
              handleContentChange(section, field, e.target.value)
            }}
            rows={rows}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder={placeholder}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => handleSave(sectionId)}
              className="bg-green-600 hover:bg-green-700 text-white text-sm"
            >
              Save
            </Button>
            <Button onClick={() => setIsEditing(null)} variant="outline" className="text-sm">
              Cancel
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Use <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl+B</kbd> for bold,{" "}
            <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl+I</kbd> for italic.
          </p>
        </div>
      )
    }

    return (
      <div className="group relative">
        <div className="text-justify leading-relaxed whitespace-pre-wrap">{formatBoldText(content)}</div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Button
            onClick={() => handleEditToggle(sectionId)}
            variant="outline"
            size="sm"
            className="bg-white/90 hover:bg-white"
          >
            Edit
          </Button>
          <Button
            onClick={() => handleRegenerate(sectionId)}
            disabled={isRegenerating === sectionId}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isRegenerating === sectionId ? "Regenerating..." : "Regenerate"}
          </Button>
        </div>
      </div>
    )
  }

  const renderEditableTitle = (title: string, sectionId: string, placeholder: string) => {
    if (isEditing === sectionId) {
      return (
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => {
              const section = sectionId.split("-")[0]
              const field = sectionId.split("-")[1]
              handleContentChange(section, field, e.target.value)
            }}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-3xl font-bold"
            placeholder={placeholder}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => handleSave(sectionId)}
              className="bg-green-600 hover:bg-green-700 text-white text-sm"
            >
              Save
            </Button>
            <Button onClick={() => setIsEditing(null)} variant="outline" className="text-sm">
              Cancel
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="group relative mb-8">
        <h2 className="text-5xl lg:text-6xl font-black mb-4 text-gray-900 border-b-4 pb-4 print:text-4xl print:mb-3 tracking-tight leading-tight">
          {title || placeholder}
        </h2>
        <div className="absolute top-4 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Button
            onClick={() => handleEditToggle(sectionId)}
            variant="outline"
            size="sm"
            className="bg-white/90 hover:bg-white"
          >
            Edit
          </Button>
          <Button
            onClick={() => handleRegenerate(sectionId)}
            disabled={isRegenerating === sectionId}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isRegenerating === sectionId ? "Regenerating..." : "Regenerate"}
          </Button>
        </div>
      </div>
    )
  }

  const renderArticle = (article: any) => {
    const currentArticle = articles.find((a) => a.news_id === article.news_id) || article

    // Handler for removing article image
    const handleRemoveArticleImage = (articleId: string) => {
      handleArticleUpdate(articleId, { imageUrl: "" })
    }

    return (
      <div
        key={currentArticle.news_id}
        className="border-l-4 pl-6 py-2 group relative"
        style={{ borderColor: themeColors[theme] }}
      >
        {/* Edit/Regenerate buttons - shown on hover */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 print:hidden">
          <Button
            onClick={() => {
              setEditingArticle(currentArticle)
              setShowArticleEditModal(true)
            }}
            variant="outline"
            size="sm"
            className="bg-white/90 hover:bg-white"
          >
            Edit
          </Button>
          <Button
            onClick={() => handleRegenerateArticle(currentArticle.news_id)}
            disabled={regeneratingArticle === currentArticle.news_id}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {regeneratingArticle === currentArticle.news_id ? "Regenerating..." : "Regenerate"}
          </Button>
        </div>

        <div className="flex items-start gap-3 mb-2 print:mb-1">
          <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded print:text-2xs">
            {currentArticle.jurisdictions?.[0]?.code || "GLOBAL"}
          </span>
        </div>
        <h3 className="text-xl font-bold mb-3 text-gray-800 print:text-lg print:mb-2">{currentArticle.news_title}</h3>

        {/* Article Image - Using the new component with remove functionality */}
        <ArticleImageDisplay
          imageUrl={currentArticle.imageUrl}
          alt={currentArticle.news_title}
          onImageUpload={(file) => handleArticleImageUpload(currentArticle.news_id, file)}
          editable={true}
        />

        <div className="text-gray-700 mb-4 print:text-sm">{formatBoldText(currentArticle.news_summary)}</div>

        {/* Source Information - Use currentArticle instead of article */}
        {currentArticle.source && currentArticle.source.length > 0 && (
          <div className="mb-3 print:mb-2">
            <div className="text-sm text-gray-600 print:text-xs">
              <strong>Source:</strong>{" "}
              {currentArticle.source[0].source_url ? (
                <a
                  href={currentArticle.source[0].source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline print:text-black print:no-underline"
                >
                  {currentArticle.source[0].source_url || "Original Source"}
                </a>
              ) : (
                <span>{currentArticle.source[0].source_alias || "Original Source"}</span>
              )}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-500 print:text-xs">Published: {formatDate(currentArticle.published_at)}</div>
      </div>
    )
  }

  const renderRegionalSection = (region: "euSection" | "usSection" | "globalSection") => {
    const sectionConfig = safeBulletinConfig[region]
    const sectionContent = editableContent[region]

    let regionalArticles = []
    switch (region) {
      case "euSection":
        regionalArticles = getArticlesByJurisdiction("EU")
        break
      case "usSection":
        regionalArticles = getArticlesByJurisdiction("US")
        break
      case "globalSection":
        regionalArticles = getArticlesByJurisdiction("GLOBAL")
        break
    }

    const hasContent =
      sectionContent.title ||
      sectionContent.introduction ||
      sectionContent.trends ||
      regionalArticles.length > 0 ||
      sectionConfig.enabled

    if (!hasContent) return null

    const sectionHeaders = {
      euSection: "European Union Regulatory Developments",
      usSection: "United States Regulatory Developments",
      globalSection: "Global Regulatory Developments",
    }

    return (
      <section className="print:min-h-[calc(29.7cm-2cm)] print:break-after-page mb-16">
        {(sectionContent.title || regionalArticles.length > 0) &&
          renderEditableTitle(sectionContent.title, `${region}-title`, sectionHeaders[region])}

        {sectionContent.introduction && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-xl border-l-8 border-purple-500 mb-8 print:p-4 print:mb-6">
            {renderEditableText(sectionContent.introduction, `${region}-introduction`, "Section introduction...", 4)}
          </div>
        )}

        {sectionContent.trends && (
          <div className="mb-8 print:mb-6">
            <h3 className="text-3xl font-black mb-4 text-gray-800 print:text-xl print:mb-3 tracking-tight">
              {region.replace("Section", "")} Key Trends
            </h3>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-xl border-l-8 border-green-500 print:p-4">
              {renderEditableText(sectionContent.trends, `${region}-trends`, "Regional trends...", 6)}
            </div>
          </div>
        )}

        {regionalArticles.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:gap-6">{regionalArticles.map(renderArticle)}</div>
        )}
      </section>
    )
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

      <HeaderEditModal
        isOpen={showHeaderEditModal}
        onClose={() => setShowHeaderEditModal(false)}
        onSave={handleHeaderSave}
        currentData={{
          headerText: editableContent.headerText,
          issueNumber: editableContent.issueNumber,
          publicationDate: editableContent.publicationDate,
          headerImage: editableContent.headerImage,
          publisherLogo: editableContent.publisherLogo,
        }}
      />

      {editingArticle && (
        <ArticleEditModal
          isOpen={showArticleEditModal}
          onClose={() => setShowArticleEditModal(false)}
          onSave={handleArticleUpdate}
          article={editingArticle}
        />
      )}

      <div className="container mx-auto px-4 py-8 print:p-0 print:m-0">
        <div className="flex justify-between items-center mb-8 print:hidden">
          <Button onClick={onStartOver} variant="outline" className="print:hidden bg-transparent">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19V2m0 0H5.18C4.08 2 3 2.94 3 4.04V12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7.82"></path>
              <path d="M12 19l-7-7 7-7"></path>
            </svg>
            Start Over
          </Button>
          <div className="flex gap-3">
            <Button onClick={() => setShowHeaderEditModal(true)} variant="outline">
              Edit Header
            </Button>
            <Button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 17.5v-10"></path>
                <path d="m8 10 4 4 4-4"></path>
                <path d="M7 22h10"></path>
              </svg>
              Download PDF
            </Button>
          </div>
        </div>

        {/* Header Section */}
        <header className="mb-16 print:mb-8 text-center relative">
          <div className="absolute top-4 right-4 print:hidden">
            {editableContent.headerImage && (
              <button
                onClick={() => handleContentChange("headerImage", "", "")}
                className="text-red-500 hover:text-red-700 font-medium text-sm underline"
              >
                Remove Header Image
              </button>
            )}
          </div>
          {editableContent.headerImage && (
            <div className="w-full h-96 overflow-hidden relative print:h-48">
              <img
                src={editableContent.headerImage || "/placeholder.svg"}
                alt="Header Background"
                className="w-full h-full object-cover filter blur-sm brightness-75"
              />
            </div>
          )}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center px-4 ${editableContent.headerImage ? "" : "py-16"}`}
          >
            <div className="relative group w-full">
              <h1 className="text-5xl lg:text-6xl font-black mb-4 text-white print:text-4xl print:mb-3 tracking-tight leading-tight">
                {editableContent.headerText || "Bulletin Header"}
              </h1>
              <div className="absolute top-1/2 -translate-y-1/2 -right-8 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 print:hidden">
                <Button
                  onClick={() => setShowHeaderEditModal(true)}
                  variant="outline"
                  size="sm"
                  className="bg-white/90 hover:bg-white"
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="text-lg text-white print:text-base print:mt-2">
              Issue {editableContent.issueNumber || "#N/A"} | Published{" "}
              {formatConfigDate(editableContent.publicationDate)}
            </div>
            {editableContent.publisherLogo && (
              <div className="mt-6 print:mt-4">
                <img
                  src={editableContent.publisherLogo || "/placeholder.svg"}
                  alt="Publisher Logo"
                  className="h-16 print:h-10"
                />
              </div>
            )}
          </div>
        </header>

        <main>
          {/* Greeting Message */}
          {editableContent.greetingMessage && (
            <section className="mb-12 print:mb-6">
              <div className="text-justify leading-relaxed whitespace-pre-wrap text-lg text-gray-700 print:text-base">
                {formatBoldText(editableContent.greetingMessage)}
              </div>
            </section>
          )}

          {/* Key Trends, Executive Summary, Key Takeaways */}
          {(safeBulletinConfig.keyTrends || safeBulletinConfig.executiveSummary || safeBulletinConfig.keyTakeaways) && (
            <section className="mb-12 print:mb-6 grid grid-cols-1 lg:grid-cols-3 gap-8 print:gap-4">
              {safeBulletinConfig.keyTrends && (
                <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500 print:p-4">
                  <h3 className="text-2xl font-bold mb-3 text-blue-800 print:text-xl">Key Trends</h3>
                  {renderEditableText(editableContent.keyTrends, "keyTrends", "Key trends content...")}
                </div>
              )}
              {safeBulletinConfig.executiveSummary && (
                <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-green-500 print:p-4">
                  <h3 className="text-2xl font-bold mb-3 text-green-800 print:text-xl">Executive Summary</h3>
                  {renderEditableText(
                    editableContent.executiveSummary,
                    "executiveSummary",
                    "Executive summary content...",
                  )}
                </div>
              )}
              {safeBulletinConfig.keyTakeaways && (
                <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-red-500 print:p-4">
                  <h3 className="text-2xl font-bold mb-3 text-red-800 print:text-xl">Key Takeaways</h3>
                  {renderEditableText(editableContent.keyTakeaways, "keyTakeaways", "Key takeaways content...")}
                </div>
              )}
            </section>
          )}

          {/* Interactive Map */}
          {safeBulletinConfig.interactiveMap && mapCountries.length > 0 && (
            <section className="mb-12 print:mb-6">
              <h2 className="text-4xl font-black mb-6 text-center text-gray-900 print:text-3xl print:mb-4">
                Global Coverage
              </h2>
              <WorldMap countryMappings={countryMappings} primaryColor={themeColors[theme]} />
            </section>
          )}

          {/* EU Section */}
          {renderRegionalSection("euSection")}

          {/* US Section */}
          {renderRegionalSection("usSection")}

          {/* Global Section */}
          {renderRegionalSection("globalSection")}
        </main>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t print:mt-4 print:pt-2 print:border-t-2">
          {editableContent.footerImage && (
            <div className="w-full mb-4 print:mb-2">
              <img
                src={editableContent.footerImage || "/placeholder.svg"}
                alt="Footer Image"
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          <p className="text-center text-sm text-gray-500 print:text-xs">
            © {new Date().getFullYear()} [Your Company Name]. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  )
}
