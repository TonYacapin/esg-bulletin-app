"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import type { BulletinData } from "./bulletin-generator"
import html2pdf from "html2pdf.js"

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
  const bulletinRef = useRef<HTMLDivElement>(null)
  const [editableContent, setEditableContent] = useState({
    headerText: data.bulletinConfig?.headerText || "ESG DISCLOSURE & REPORTING BULLETIN",
    issueNumber: data.bulletinConfig?.issueNumber || "Issue #23",
    publicationDate:
      data.bulletinConfig?.publicationDate ||
      new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" }),
    greetingMessage: data.bulletinConfig?.greetingMessage || "",
  })

  const themeColors: Record<string, string> = {
    blue: "#1e40af",
    green: "#15803d",
    red: "#991b1b",
  }

  const regionLabels: Record<string, string> = {
    "European Union": "EU",
    "United States": "US",
    "United Kingdom": "UK",
    Australia: "AU",
    Singapore: "SG",
    California: "CA",
    Africa: "AF",
  }

  const regionEmojis: Record<string, string> = {
    "European Union": "🇪🇺",
    "United States": "🇺🇸",
    "United Kingdom": "🇬🇧",
    Australia: "🇦🇺",
    Singapore: "🇸🇬",
    California: "🇺🇸",
    Africa: "🌍",
  }

  const handleDownloadPDF = async () => {
    if (!bulletinRef.current) return

    const element = bulletinRef.current
    const opt = {
      margin: 10,
      filename: `ESG-Bulletin-${editableContent.issueNumber}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    }

    html2pdf().set(opt).from(element).save()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Controls */}
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
            style={{ backgroundColor: themeColors[data.theme] }}
          >
            Download PDF
          </Button>
        </div>

        {/* Magazine-Style Bulletin */}
        <div ref={bulletinRef} className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* HEADER SECTION */}
          <div
            className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-12 text-center border-b-4"
            style={{ borderColor: themeColors[data.theme] }}
          >
            <h1 className="text-5xl font-bold mb-2 tracking-tight">{editableContent.headerText}</h1>
            <div className="flex justify-center items-center gap-4 mt-6 text-lg">
              <span className="font-semibold">{editableContent.issueNumber}</span>
              <span className="text-gray-400">|</span>
              <span>{editableContent.publicationDate}</span>
            </div>
          </div>

          {/* GREETING MESSAGE */}
          {editableContent.greetingMessage && (
            <div className="p-12 bg-gradient-to-r from-blue-50 to-gray-50 border-b">
              <p className="text-gray-700 text-lg leading-relaxed text-justify">{editableContent.greetingMessage}</p>
            </div>
          )}

          {/* GLOBAL COVERAGE MAP */}
          <div className="p-12 border-b">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Global Coverage Map</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {Object.entries(data.articlesByCountry).map(([country, articles]) => (
                <div key={country} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="text-2xl mb-2">{regionEmojis[country] || "🌐"}</div>
                  <div className="font-bold text-gray-900">{regionLabels[country] || country}</div>
                  <div className="text-sm text-gray-600">{country}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    {articles.length} article{articles.length !== 1 ? "s" : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ARTICLES BY REGION */}
          <div className="p-12">
            {Object.entries(data.articlesByCountry).map(([country, articles], regionIndex) => (
              <div key={country} className="mb-12">
                {/* Region Header */}
                <div
                  className="flex items-center gap-3 mb-8 pb-4 border-b-2"
                  style={{ borderColor: themeColors[data.theme] }}
                >
                  <span className="text-3xl">{regionEmojis[country] || "🌐"}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{country}</h3>
                    <p className="text-sm text-gray-600">Regional Developments</p>
                  </div>
                </div>

                {/* Articles Grid */}
                <div className="space-y-8">
                  {(articles as any[]).map((article, idx) => (
                    <div key={idx} className="border-l-4 pl-6" style={{ borderColor: themeColors[data.theme] }}>
                      {/* Article Header */}
                      <div className="mb-3">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          {article.news_title || article.original_title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="font-semibold">{regionLabels[country] || country}</span>
                          <span>•</span>
                          <span>
                            {new Date(article.published_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Article Summary */}
                      <p className="text-gray-700 leading-relaxed mb-3">
                        {article.news_summary || article.news_content?.substring(0, 300) + "..."}
                      </p>

                      {/* Article Content */}
                      {article.news_content && (
                        <div className="text-gray-600 text-sm leading-relaxed">
                          {article.news_content.substring(0, 500)}
                          {article.news_content.length > 500 && "..."}
                        </div>
                      )}

                      {/* Source */}
                      {article.type && (
                        <div className="mt-3 text-xs text-gray-500">
                          <span className="inline-block bg-gray-100 px-3 py-1 rounded">{article.type}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <div
            className="bg-gray-900 text-white p-12 text-center border-t-4"
            style={{ borderColor: themeColors[data.theme] }}
          >
            <div className="flex justify-center gap-8 mb-6 text-lg">
              <span>info@example.com</span>
              <span>•</span>
              <span>Subscribe</span>
              <span>•</span>
              <span>About</span>
            </div>
            <p className="text-gray-400 text-sm">
              Generated on {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
            margin: 0;
            padding: 0;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  )
}
