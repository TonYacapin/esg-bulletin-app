"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { WorldMap } from "./world-map"
import "./bulletin-output.css"

// Pexels Types
interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
  liked: boolean;
}

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

// Source data interface
interface SourceData {
  id?: string
  source_alias: string
  source_url: string
  source_file_key?: string
}

// Source Edit Modal Component
interface SourceEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (sourceData: SourceData) => void
  source?: SourceData | null
  articleTitle?: string
}

function SourceEditModal({
  isOpen,
  onClose,
  onSave,
  source,
  articleTitle
}: SourceEditModalProps) {
  const [formData, setFormData] = useState<SourceData>({
    source_alias: '',
    source_url: ''
  })

  useEffect(() => {
    if (isOpen) {
      if (source) {
        setFormData({
          source_alias: source.source_alias || '',
          source_url: source.source_url || '',
          source_file_key: source.source_file_key
        })
      } else {
        setFormData({
          source_alias: '',
          source_url: ''
        })
      }
    }
  }, [isOpen, source])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Auto-generate a simple alias from the URL domain
    let sourceAlias = formData.source_alias;
    if (!sourceAlias.trim() && formData.source_url.trim()) {
      try {
        const url = new URL(formData.source_url);
        sourceAlias = url.hostname.replace('www.', '');
      } catch {
        sourceAlias = 'Source';
      }
    }

    if (!formData.source_url.trim()) {
      alert('Please enter a source URL')
      return
    }

    // Validate URL format
    try {
      new URL(formData.source_url)
    } catch {
      alert('Please enter a valid URL')
      return
    }

    onSave({
      ...formData,
      source_alias: sourceAlias
    })
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
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {source ? 'Edit Source' : 'Add Source'}
          </h2>
          {articleTitle && (
            <p className="text-sm text-gray-600 mt-1">
              For: {articleTitle}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Source URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source URL *
            </label>
            <input
              type="url"
              value={formData.source_url}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                source_url: e.target.value
              }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/article"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4"
            >
              {source ? 'Update Source' : 'Add Source'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
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
  showRemoveButton = true
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
      if (file.type.startsWith('image/')) {
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
        <div className="w-full aspect-[4/3] max-w-md mx-auto">
          <img
            src={previewUrl}
            alt="Article"
            className="w-full h-full object-cover rounded-lg border shadow-sm print:border print:rounded print:object-cover"
            style={{ aspectRatio: '4/3' }}
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
            <div className="w-full aspect-[4/3] max-w-md mx-auto">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg border shadow-sm print:border print:rounded print:object-cover"
                style={{ aspectRatio: '4/3' }}
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
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        ${className}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />

      {previewUrl ? (
        <div className="space-y-2 relative">
          <div className="w-full aspect-[4/3] max-w-md mx-auto">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg border shadow-sm print:border print:rounded print:object-cover"
              style={{ aspectRatio: '4/3' }}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
  onPexelsImageSelect?: (imageUrl: string) => void
  onRemoveImage?: () => void
  editable?: boolean
  className?: string
  articleId?: string
  isDragOver?: boolean
  onDragOver?: (e: React.DragEvent) => void
  onDragLeave?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
}

function ArticleImageDisplay({
  imageUrl,
  alt,
  onImageUpload,
  onPexelsImageSelect,
  onRemoveImage,
  editable = true,
  className = "",
  articleId,
  isDragOver = false,
  onDragOver,
  onDragLeave,
  onDrop
}: ArticleImageDisplayProps) {
  const [imageError, setImageError] = useState(false)

  const handleRemove = () => {
    if (onRemoveImage) {
      onRemoveImage()
    }
    setImageError(false)
  }

  // If image exists and loaded successfully, show it in proper aspect ratio
  if (imageUrl && !imageError) {
    return (
      <div className={`relative mb-2 print:mb-1 ${className}`}>
        <div className="w-full">
          <img
            src={imageUrl}
            alt={alt}
            className="w-full max-w-md mx-auto rounded-lg border shadow-sm print:border print:rounded print:object-cover"
            onError={() => setImageError(true)}
            style={{
              aspectRatio: '4/3',
              objectFit: 'cover'
            }}
          />
          {/* Remove button - only show when editable and onRemoveImage is provided */}
          {editable && onRemoveImage && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors print:hidden"
              title="Remove image"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    )
  }

  // If no image or image failed to load, and editing is allowed, show upload interface
  if (editable && (onImageUpload || onPexelsImageSelect)) {
    return (
      <div
        className={`
          border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors mb-2
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          print:hidden ${className}
        `}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {onImageUpload && (
          <div className="space-y-3">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-600">Drag & drop article image or click to browse</p>
            <p className="text-sm text-gray-500">Supports JPG, PNG, GIF</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const files = e.target.files
                if (files && files.length > 0) {
                  onImageUpload(files[0])
                }
              }}
              className="hidden"
              id={`file-upload-${articleId}`}
            />
            <Button
              onClick={() => document.getElementById(`file-upload-${articleId}`)?.click()}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Browse Files
            </Button>
          </div>
        )}

        {onPexelsImageSelect && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Or drag & drop from Stock image search</p>
            <p className="text-xs text-gray-500">Search for stock images and drag them here</p>
          </div>
        )}
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

function HeaderEditModal({
  isOpen,
  onClose,
  onSave,
  currentData
}: HeaderEditModalProps) {
  const [formData, setFormData] = useState(currentData)
  const [showPexelsSearch, setShowPexelsSearch] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData(currentData)
    }
  }, [isOpen, currentData])

  const handleImageUpload = (field: 'headerImage' | 'publisherLogo', file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setFormData(prev => ({ ...prev, [field]: result }))
    }
    reader.readAsDataURL(file)
  }

  // NEW: Handle Pexels image selection for header
  const handlePexelsImageSelect = (image: PexelsPhoto) => {
    setFormData(prev => ({ 
      ...prev, 
      headerImage: image.src.large2x || image.src.large 
    }))
    setShowPexelsSearch(false)
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
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Edit Header Content</h2>
          <p className="text-gray-600 mt-2">
            Update your bulletin header information and images
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Header Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Header Title
            </label>
            <input
              type="text"
              value={formData.headerText}
              onChange={(e) => setFormData(prev => ({ ...prev, headerText: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ESG BULLETIN"
            />
          </div>

          {/* Issue Number and Publication Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Number
              </label>
              <input
                type="text"
                value={formData.issueNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, issueNumber: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Issue #10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publication Date
              </label>
              <input
                type="month"
                value={formData.publicationDate}
                onChange={(e) => setFormData(prev => ({ ...prev, publicationDate: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Header Background Image - UPDATED WITH PEXELS */}
          <div className="bg-black/5 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Header Background Image
              </label>
              <div className="flex gap-2">
               
                {formData.headerImage && (
                  <Button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, headerImage: '' }))}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                  >
                    Remove Image
                  </Button>
                )}
              </div>
            </div>
            <DragDropImageUpload
              onImageUpload={(file) => handleImageUpload('headerImage', file)}
              currentImage={formData.headerImage}
              placeholder="Drag & drop header background image or click to browse"
              className="h-100"
            />
          </div>

          {/* Publisher Logo */}
          <div className="bg-black/5 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Publisher Logo
            </label>
            <DragDropImageUpload
              onImageUpload={(file) => handleImageUpload('publisherLogo', file)}
              currentImage={formData.publisherLogo}
              placeholder="Drag & drop publisher logo or click to browse"
              className="h-100"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              Save Changes
            </Button>
          </div>
        </form>

        {/* Pexels Search Modal for Header */}
        {showPexelsSearch && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b flex justify-between items-center bg-white">
                <h3 className="text-lg font-semibold">Search Header Background Images</h3>
                <button
                  onClick={() => setShowPexelsSearch(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <PexelsImageSearch
                  onImageSelect={handlePexelsImageSelect}
                  onClose={() => setShowPexelsSearch(false)}
                  isOpen={true}
                  bulletinContent={null}
                  currentArticleId="header"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface ArticleEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (articleId: string, updatedArticle: any) => void
  article: any
  onOpenSourceModal: (article: any, source?: SourceData | null) => void
  onOpenPexelsSearch: (articleId: string) => void
}

function ArticleEditModal({
  isOpen,
  onClose,
  onSave,
  article,
  onOpenSourceModal,
  onOpenPexelsSearch
}: ArticleEditModalProps) {
  const [editedArticle, setEditedArticle] = useState({
    news_title: article?.news_title || '',
    news_summary: article?.news_summary || '',
    imageUrl: article?.imageUrl || '',
    source: article?.source || []
  })

  const [loadingSource, setLoadingSource] = useState(false)
  const [sourceError, setSourceError] = useState<string | null>(null)

  // Sync with parent article state when modal opens or article changes
  useEffect(() => {
    if (isOpen && article) {
      setEditedArticle({
        news_title: article.news_title || '',
        news_summary: article.news_summary || '',
        imageUrl: article.imageUrl || '',
        source: article.source || [] // This ensures we get the updated sources from parent
      })

      // Reset error state
      setSourceError(null)

      // If article doesn't have source data but has news_id, fetch it
      if (article.news_id && (!article.source || article.source.length === 0 || !article.source[0]?.source_alias)) {
        fetchSourceData(article.news_id)
      }
    }
  }, [isOpen, article]) // Add article to dependencies

  const fetchSourceData = async (newsId: string) => {
    try {
      setLoadingSource(true)
      setSourceError(null)

      const response = await fetch(`/api/internal/news/${newsId}/details`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Update the source fields with the fetched data
      if (data.data?.source?.[0]) {
        setEditedArticle(prev => ({
          ...prev,
          source: [{
            id: article.source?.[0]?.id,
            source_alias: data.data.source[0].source_alias || '',
            source_url: data.data.source[0].source_url || '',
            source_file_key: article.source?.[0]?.source_file_key
          }]
        }))
      } else {
        setSourceError('No source data found for this article')
      }
    } catch (error) {
      console.error('Error fetching source data:', error)
      setSourceError(error instanceof Error ? error.message : 'Failed to fetch source data')
    } finally {
      setLoadingSource(false)
    }
  }

  const handleImageUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setEditedArticle(prev => ({ ...prev, imageUrl: result }))
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setEditedArticle(prev => ({ ...prev, imageUrl: '' }))
  }

  // Source management functions - use the passed handler
  const handleAddSource = () => {
    onOpenSourceModal(article)
  }

  const handleEditSource = (source: SourceData) => {
    onOpenSourceModal(article, source)
  }

  const handleDeleteSource = (sourceIndex: number) => {
    const updatedSources = editedArticle.source.filter((_, index) => index !== sourceIndex)
    setEditedArticle(prev => ({
      ...prev,
      source: updatedSources
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    onSave(article.news_id, {
      news_title: editedArticle.news_title,
      news_summary: editedArticle.news_summary,
      imageUrl: editedArticle.imageUrl,
      source: editedArticle.source
    })
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Formatting helper functions for article modal
  const applyFormatting = (text: string, formatType: 'bold' | 'italic'): string => {
    const textarea = document.activeElement as HTMLTextAreaElement
    if (!textarea || textarea.tagName !== 'TEXTAREA') return text

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = text.substring(start, end)

    if (!selectedText) return text

    let formattedText = ''
    if (formatType === 'bold') {
      formattedText = `**${selectedText}**`
    } else if (formatType === 'italic') {
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
    const newSummary = applyFormatting(editedArticle.news_summary, 'bold')
    setEditedArticle(prev => ({ ...prev, news_summary: newSummary }))
  }

  const handleItalic = () => {
    const newSummary = applyFormatting(editedArticle.news_summary, 'italic')
    setEditedArticle(prev => ({ ...prev, news_summary: newSummary }))
  }

  // Keyboard shortcut handler for article modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && isOpen) {
        const activeElement = document.activeElement
        if (activeElement && activeElement.tagName === 'TEXTAREA') {
          switch (e.key.toLowerCase()) {
            case 'b':
              e.preventDefault()
              handleBold()
              break
            case 'i':
              e.preventDefault()
              handleItalic()
              break
          }
        }
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, editedArticle.news_summary])

  if (!isOpen || !article) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Edit News Article</h2>
          <p className="text-gray-600 mt-2">
            Update the article title, summary, image, and source
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Article Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Article Title
            </label>
            <input
              type="text"
              value={editedArticle.news_title}
              onChange={(e) => setEditedArticle(prev => ({ ...prev, news_title: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter article title"
            />
          </div>

          {/* Article Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Article Summary
            </label>
            <textarea
              value={editedArticle.news_summary}
              onChange={(e) => setEditedArticle(prev => ({ ...prev, news_summary: e.target.value }))}
              rows={8}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter article summary"
            />
            <p className="text-xs text-gray-500 mt-2">
              Use <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl+B</kbd> for bold, <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl+I</kbd> for italic
            </p>
          </div>

          {/* Source Information */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  Source Information
                </label>
                {loadingSource && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    Loading source data...
                  </span>
                )}
              </div>
              <Button
                type="button"
                onClick={handleAddSource}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Source
              </Button>
            </div>

            {sourceError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">
                      Error loading source
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      {sourceError}
                    </p>
                    <button
                      type="button"
                      onClick={() => fetchSourceData(article.news_id)}
                      className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium underline transition-colors"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {editedArticle.source?.map((source, index) => (
              <div
                key={source.id || index}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <div className="text-sm text-gray-600 truncate font-medium">
                      {source.source_url}
                    </div>
                  </div>
                  {source.source_alias && source.source_alias !== 'Source' && (
                    <div className="text-xs text-gray-500 ml-6">
                      {source.source_alias}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 self-end sm:self-center">
                  <Button
                    type="button"
                    onClick={() => handleEditSource(source)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleDeleteSource(index)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400 flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </Button>
                </div>
              </div>
            ))}

            {(!editedArticle.source || editedArticle.source.length === 0) && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <p className="text-gray-500 text-sm mb-2">No sources added yet</p>
                <p className="text-gray-400 text-xs mb-4 max-w-sm mx-auto">
                  Add source URLs to provide references for this article
                </p>
                <Button
                  type="button"
                  onClick={handleAddSource}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 hover:border-gray-400"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add First Source
                </Button>
              </div>
            )}
          </div>

          {/* Article Image */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Article Image
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => onOpenPexelsSearch(article.news_id)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Stock Images
                </Button>
                {editedArticle.imageUrl && (
                  <Button
                    type="button"
                    onClick={handleRemoveImage}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                  >
                    Remove Image
                  </Button>
                )}
              </div>
            </div>

            <ArticleImageDisplay
              imageUrl={editedArticle.imageUrl}
              alt={editedArticle.news_title}
              onImageUpload={handleImageUpload}
              onPexelsImageSelect={(imageUrl) => setEditedArticle(prev => ({ ...prev, imageUrl }))}
              onRemoveImage={handleRemoveImage}
              editable={true}
              className="h-120"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Updated Pexels Image Search Component with split-screen layout
interface PexelsImageSearchProps {
  onImageSelect: (image: PexelsPhoto) => void;
  currentArticleId?: string;
  onClose: () => void;
  isOpen: boolean;
  bulletinContent: React.ReactNode;
}

function PexelsImageSearch({
  onImageSelect,
  currentArticleId,
  onClose,
  isOpen,
  bulletinContent
}: PexelsImageSearchProps) {
  const [query, setQuery] = useState<string>('');
  const [images, setImages] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const dragItem = useRef<PexelsPhoto | null>(null);

  const searchImages = async (searchQuery: string, page: number = 1): Promise<void> => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/pexels/search?query=${encodeURIComponent(searchQuery)}&page=${page}&per_page=15`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      setImages(data.photos || []);
    } catch (err) {
      setError('Error fetching images. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    searchImages(query);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, image: PexelsPhoto): void => {
    dragItem.current = image;
    e.dataTransfer.setData('text/plain', JSON.stringify(image));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = (): void => {
    dragItem.current = null;
  };

  const handleImageClick = (image: PexelsPhoto): void => {
    onImageSelect(image);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-white">
      {/* Pexels Search Panel - Left Side */}
      <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b bg-white flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {currentArticleId === 'header' ? 'Search Header Background Images' : 'Search Article Images'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                currentArticleId === 'header' 
                  ? "Search for header background images (e.g., abstract, gradient, corporate...)"
                  : "Search for images (e.g., sustainability, renewable energy, ESG...)"
              }
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200"
                draggable
                onDragStart={(e) => handleDragStart(e, image)}
                onDragEnd={handleDragEnd}
                onClick={() => handleImageClick(image)}
              >
                <img
                  src={image.src.medium}
                  alt={image.alt || 'Pexels image'}
                  className={`w-full object-cover group-hover:scale-105 transition-transform duration-200 ${
                    currentArticleId === 'header' ? 'h-32' : 'h-48'
                  }`}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-center p-4">
                    <p className="font-medium">Click to select</p>
                    <p className="text-sm mt-1">or drag to {currentArticleId === 'header' ? 'header' : 'article'}</p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <p className="text-white text-sm truncate">
                    by {image.photographer}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {images.length === 0 && !loading && query && (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg">No images found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          )}

          {!query && !loading && (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-lg">Search for images</p>
              <p className="text-sm mt-1">Enter keywords above to find relevant images</p>
            </div>
          )}
        </div>
      </div>

      {/* Bulletin Output Panel - Right Side */}
      <div className="w-1/2 bg-gray-50 overflow-y-auto">
        <div className="p-4">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <h3 className="text-lg font-semibold mb-4">Bulletin Preview</h3>
            <p className="text-gray-600 text-sm">
              {currentArticleId === 'header' 
                ? "Drag and drop images from the left panel to the header background area."
                : "Drag and drop images from the left panel to any article image area in the bulletin."
              }
            </p>
          </div>

          {/* Render the bulletin content passed from parent */}
          {bulletinContent}
        </div>
      </div>
    </div>
  );
};

export function BulletinOutput({ data, onStartOver }: BulletinOutputProps) {
  const { theme, articles: initialArticles, articlesByCountry, bulletinConfig } = data

  // Create a safe bulletin config with fallbacks
  const safeBulletinConfig = bulletinConfig || {
    headerText: "ESG BULLETIN",
    issueNumber: "",
    publicationDate: new Date().toISOString().split('T')[0],
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
      keyTakeaways: ""
    }
  }

  const [showMappingModal, setShowMappingModal] = useState(true)
  const [showHeaderEditModal, setShowHeaderEditModal] = useState(false)
  const [showArticleEditModal, setShowArticleEditModal] = useState(false)
  const [showSourceModal, setShowSourceModal] = useState(false)
  const [isPexelsSearchOpen, setIsPexelsSearchOpen] = useState(false)
  const [countryMappings, setCountryMappings] = useState<Record<string, string>>({})
  const [editingArticle, setEditingArticle] = useState<any>(null)
  const [editingSource, setEditingSource] = useState<SourceData | null>(null)
  const [sourceModalArticle, setSourceModalArticle] = useState<any>(null)
  const [pexelsTargetArticle, setPexelsTargetArticle] = useState<string | null>(null)
  const [articles, setArticles] = useState(initialArticles)
  const [dragOverArticle, setDragOverArticle] = useState<string | null>(null)

  // NEW: Drag and drop state for header
  const [isHeaderDragOver, setIsHeaderDragOver] = useState(false)

  // NEW: Unified loading state management
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());
  const isLoading = pendingOperations.size > 0;

  // Helper functions to manage pending operations
  const addPendingOperation = (operationId: string) => {
    setPendingOperations(prev => new Set(prev).add(operationId));
  };

  const removePendingOperation = (operationId: string) => {
    setPendingOperations(prev => {
      const newSet = new Set(prev);
      newSet.delete(operationId);
      return newSet;
    });
  };

  const [editableContent, setEditableContent] = useState({
    // Header content
    headerText: safeBulletinConfig.headerText || "",
    issueNumber: safeBulletinConfig.issueNumber || "",
    publicationDate: safeBulletinConfig.publicationDate || "",
    headerImage: safeBulletinConfig.headerImage || "",
    publisherLogo: safeBulletinConfig.publisherLogo || "https://scorealytics.com/uploads/SCORE_logo_white_6c91d9768d.svg",
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
      trends: safeBulletinConfig.euSection?.trends || ""
    },
    usSection: {
      title: safeBulletinConfig.usSection?.title || "",
      introduction: safeBulletinConfig.usSection?.introduction || "",
      trends: safeBulletinConfig.usSection?.trends || ""
    },
    globalSection: {
      title: safeBulletinConfig.globalSection?.title || "",
      introduction: safeBulletinConfig.globalSection?.introduction || "",
      trends: safeBulletinConfig.globalSection?.trends || ""
    }
  })
  const [isEditing, setIsEditing] = useState<string | null>(null)

  // Add this ref to track if we've already regenerated on load
  const hasRegeneratedOnLoad = useRef(false)

  // Create article IDs for linking
  const articleIds = useRef(new Map())

  // Generate unique IDs for articles
  useEffect(() => {
    articles.forEach((article, index) => {
      if (article.news_id) {
        articleIds.current.set(article.news_id, `article-${article.news_id}`)
      } else {
        articleIds.current.set(index, `article-${index}`)
      }
    })
  }, [articles])

  const countries = Object.keys(articlesByCountry)

  const themeColors = {
    blue: "#1976D2",
    green: "#388E3C",
    red: "#D32F2F",
  }

  // NEW: Drag and drop handlers for header background
  const handleHeaderDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsHeaderDragOver(true)
  }

  const handleHeaderDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsHeaderDragOver(false)
  }

  const handleHeaderDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsHeaderDragOver(false)

    try {
      const imageData: PexelsPhoto = JSON.parse(e.dataTransfer.getData('text/plain'))
      setEditableContent(prev => ({
        ...prev,
        headerImage: imageData.src.large2x || imageData.src.large
      }))
    } catch (error) {
      console.error('Error parsing dropped Pexels image for header:', error)
    }
  }

  // Automatically fetch source data for all articles on initial load
  useEffect(() => {
    const fetchMissingSources = async () => {
      const articlesNeedingSource = articles.filter(article =>
        article.news_id && (!article.source || article.source.length === 0 || !article.source[0]?.source_alias)
      );

      if (articlesNeedingSource.length === 0) return;

      // Add source loading operations
      const sourceOperations = articlesNeedingSource.map(article => `source-${article.news_id}`);
      setPendingOperations(prev => new Set([...prev, ...sourceOperations]));

      try {
        for (const article of articlesNeedingSource) {
          const operationId = `source-${article.news_id}`;
          try {
            const response = await fetch(`/api/internal/news/${article.news_id}/details`);

            if (response.ok) {
              const data = await response.json();

              if (data.data?.source?.[0]) {
                handleArticleUpdate(article.news_id, {
                  source: [{
                    id: article.source?.[0]?.id,
                    source_alias: data.data.source[0].source_alias || '',
                    source_url: data.data.source[0].source_url || '',
                    source_file_key: article.source?.[0]?.source_file_key
                  }]
                });
              }
            }
          } catch (error) {
            console.error(`Error fetching source for article ${article.news_id}:`, error);
          } finally {
            removePendingOperation(operationId);
          }
        }
      } finally {
        // Clean up any remaining source operations
        articlesNeedingSource.forEach(article => {
          removePendingOperation(`source-${article.news_id}`);
        });
      }
    };

    if (articles.length > 0) {
      fetchMissingSources();
    }
  }, [articles.length]);

  // Automatically regenerate greeting and articles on page load - ALWAYS regenerate
  useEffect(() => {
    const regenerateAllContent = async () => {
      console.log('Starting automatic regeneration of ALL content...');

      // Create operation IDs for all content
      const allOperations = new Set<string>();

      // Add greeting message operation
      allOperations.add('regenerate-greetingMessage');

      // Add all articles operations
      articles.forEach(article => {
        allOperations.add(`article-${article.news_id}`);
      });

      setPendingOperations(allOperations);

      try {
        // Regenerate greeting message
        console.log('Regenerating greeting message...');
        await handleRegenerate('greetingMessage');

        // Regenerate all articles sequentially
        console.log(`Regenerating ALL ${articles.length} articles...`);
        for (const article of articles) {
          console.log(`Regenerating article: ${article.news_title}`);
          await handleRegenerateArticle(article.news_id);
          // Add a small delay between requests to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('Automatic regeneration of ALL content completed');
      } catch (error) {
        console.error('Error during automatic regeneration:', error);
      }
      // Note: We don't clear pendingOperations here because each individual
      // operation will remove itself when completed
    };

    if (articles.length > 0 && !hasRegeneratedOnLoad.current) {
      hasRegeneratedOnLoad.current = true;
      setTimeout(() => {
        regenerateAllContent();
      }, 1000);
    }
  }, [articles.length]);

  // Source modal handlers
  const handleOpenSourceModal = (article: any, source: SourceData | null = null) => {
    setSourceModalArticle(article)
    setEditingSource(source)
    setShowSourceModal(true)
  }

  const handleSaveSource = (sourceData: SourceData) => {
    if (!sourceModalArticle) return

    const articleId = sourceModalArticle.news_id
    const article = articles.find(a => a.news_id === articleId)
    if (!article) return

    let updatedSources: SourceData[]

    if (editingSource) {
      // Update existing source
      updatedSources = article.source.map(source =>
        source === editingSource ? { ...source, ...sourceData } : source
      )
    } else {
      // Add new source
      const newSource = {
        ...sourceData,
        id: `temp-${Date.now()}`
      }
      updatedSources = [...(article.source || []), newSource]
    }

    // Update the articles state
    handleArticleUpdate(articleId, {
      source: updatedSources
    })

    // If we're editing the same article in the article modal, update that too
    if (editingArticle && editingArticle.news_id === articleId) {
      setEditingArticle(prev => ({
        ...prev,
        source: updatedSources
      }))
    }

    setShowSourceModal(false)
    setEditingSource(null)
    setSourceModalArticle(null)
  }

  // Updated Pexels handlers for split-screen
  const handleOpenPexelsSearch = (articleId?: string) => {
    setPexelsTargetArticle(articleId || null)
    setIsPexelsSearchOpen(true)
  }

  const handlePexelsImageSelect = (image: PexelsPhoto) => {
    if (pexelsTargetArticle === 'header') {
      // Handle header image selection
      setEditableContent(prev => ({
        ...prev,
        headerImage: image.src.large2x || image.src.large
      }))
    } else if (pexelsTargetArticle) {
      // Handle article image selection
      handleArticleUpdate(pexelsTargetArticle, {
        imageUrl: image.src.large2x || image.src.large
      })
    }
    // Keep Pexels search open for multiple image selections
  }

  const handleClosePexelsSearch = () => {
    setIsPexelsSearchOpen(false)
    setPexelsTargetArticle(null)
  }

  // Drag and drop handlers for articles
  const handleArticleDragOver = (e: React.DragEvent, articleId: string) => {
    e.preventDefault()
    setDragOverArticle(articleId)
  }

  const handleArticleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverArticle(null)
  }

  const handleArticleDrop = (e: React.DragEvent, articleId: string) => {
    e.preventDefault()
    setDragOverArticle(null)

    try {
      const imageData: PexelsPhoto = JSON.parse(e.dataTransfer.getData('text/plain'))
      handleArticleUpdate(articleId, {
        imageUrl: imageData.src.large2x || imageData.src.large
      })
    } catch (error) {
      console.error('Error parsing dropped Pexels image:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatConfigDate = (dateString: string) => {
    if (!dateString) return "Current Month"
    return new Date(dateString + '-01').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  const handleHeaderSave = (headerData: {
    headerText: string
    issueNumber: string
    publicationDate: string
    headerImage: string
    publisherLogo: string
  }) => {
    setEditableContent(prev => ({
      ...prev,
      ...headerData
    }))
  }

  const handleArticleUpdate = (articleId: string, updatedArticle: any) => {
    setArticles(prev =>
      prev.map(article =>
        article.news_id === articleId
          ? { ...article, ...updatedArticle }
          : article
      )
    )
  }

  const handleContentChange = (section: string, field: string, value: string) => {
    setEditableContent(prev => {
      if (!field) {
        return {
          ...prev,
          [section]: value
        }
      }

      if (section.includes('Section')) {
        const sectionKey = section as 'euSection' | 'usSection' | 'globalSection'
        return {
          ...prev,
          [sectionKey]: {
            ...prev[sectionKey],
            [field]: value
          }
        }
      } else {
        return {
          ...prev,
          [section]: value
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
  const applyFormatting = (text: string, formatType: 'bold' | 'italic'): string => {
    const textarea = document.activeElement as HTMLTextAreaElement
    if (!textarea || textarea.tagName !== 'TEXTAREA') return text

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = text.substring(start, end)

    if (!selectedText) return text

    let formattedText = ''
    if (formatType === 'bold') {
      formattedText = `**${selectedText}**`
    } else if (formatType === 'italic') {
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

    const [section, field] = isEditing.split('-')
    const currentContent = field
      ? editableContent[section as keyof typeof editableContent]?.[field as keyof typeof editableContent[keyof typeof editableContent]]
      : editableContent[section as keyof typeof editableContent]

    if (typeof currentContent === 'string') {
      const newContent = applyFormatting(currentContent, 'bold')
      handleContentChange(section, field, newContent)
    }
  }

  const handleItalic = () => {
    if (!isEditing) return

    const [section, field] = isEditing.split('-')
    const currentContent = field
      ? editableContent[section as keyof typeof editableContent]?.[field as keyof typeof editableContent[keyof typeof editableContent]]
      : editableContent[section as keyof typeof editableContent]

    if (typeof currentContent === 'string') {
      const newContent = applyFormatting(currentContent, 'italic')
      handleContentChange(section, field, newContent)
    }
  }

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && isEditing) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault()
            handleBold()
            break
          case 'i':
            e.preventDefault()
            handleItalic()
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isEditing])

  // UPDATED: Unified handleRegenerate function
  const handleRegenerate = async (sectionId: string) => {
    const operationId = `regenerate-${sectionId}`;
    addPendingOperation(operationId);

    try {
      const [section, field] = sectionId.split('-');
      const typeMapping: Record<string, string> = {
        'headerText': 'header_text',
        'issueNumber': 'issue_number',
        'greetingMessage': 'greeting',
        'keyTrends': 'key_trends',
        'executiveSummary': 'executive_summary',
        'keyTakeaways': 'key_takeaways',
        'euSection-title': 'section_title',
        'euSection-introduction': 'section_intro',
        'euSection-trends': 'section_trends',
        'usSection-title': 'section_title',
        'usSection-introduction': 'section_intro',
        'usSection-trends': 'section_trends',
        'globalSection-title': 'section_title',
        'globalSection-introduction': 'section_intro',
        'globalSection-trends': 'section_trends'
      };

      const apiType = typeMapping[sectionId];
      if (!apiType) {
        console.error('Unknown section type:', sectionId);
        return;
      }

      let regionalArticles = [];
      let region = '';

      if (section.includes('Section')) {
        region = section.replace('Section', '').toUpperCase();
        regionalArticles = getArticlesByJurisdiction(region);
      } else {
        regionalArticles = articles;
      }

      const requestBody: any = {
        type: apiType,
        articles: regionalArticles,
        currentDate: safeBulletinConfig.publicationDate || new Date().toISOString().split('T')[0],
        customInstructions: safeBulletinConfig.customInstructions || ''
      };

      if (region) {
        requestBody.region = region;
      }

      if (apiType === 'greeting') {
        requestBody.previousGreeting = safeBulletinConfig.previousGreeting || '';
      }

      const response = await fetch('/api/generate-bulletin-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate content');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setEditableContent(prev => {
        if (section.includes('Section')) {
          const sectionKey = section as 'euSection' | 'usSection' | 'globalSection';
          return {
            ...prev,
            [sectionKey]: {
              ...prev[sectionKey],
              [field]: data.content
            }
          };
        } else {
          return {
            ...prev,
            [section]: data.content
          };
        }
      });

    } catch (error) {
      console.error('Error regenerating content:', error);
    } finally {
      removePendingOperation(operationId);
    }
  };

  // UPDATED: Unified handleRegenerateArticle function
  const handleRegenerateArticle = async (articleId: string) => {
    const operationId = `article-${articleId}`;
    addPendingOperation(operationId);

    try {
      const article = articles.find(a => a.news_id === articleId)
      if (!article) return

      const response = await fetch('/api/generate-article-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleContent: article.news_content || article.news_summary,
          prompt: "Generate a concise, professional summary focusing on key ESG-related aspects and main points. Include key deadlines, dates, and the issuing authority."
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate article summary')
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      handleArticleUpdate(articleId, {
        news_summary: data.summary
      })

    } catch (error) {
      console.error('Error regenerating article summary:', error)
    } finally {
      removePendingOperation(operationId);
    }
  }

  const formatBoldText = (text: string) => {
    if (!text) return "";

    return (
      <div className="leading-relaxed">
        {text.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, index) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            const boldText = part.slice(2, -2);
            return (
              <strong key={index} className="font-bold">
                {boldText}
              </strong>
            );
          } else if (part.startsWith("*") && part.endsWith("*") && part.length > 1) {
            const italicText = part.slice(1, -1);
            return (
              <em key={index} className="italic">
                {italicText}
              </em>
            );
          }
          return part;
        })}
      </div>
    );
  }

  const getArticlesByJurisdiction = (jurisdiction: string) => {
    return articles.filter(article => {
      if (!article.jurisdictions || article.jurisdictions.length === 0) {
        return jurisdiction === 'GLOBAL';
      }

      return article.jurisdictions.some(j => {
        const jName = j.name?.toLowerCase() || '';
        const jCode = j.code?.toLowerCase() || '';

        switch (jurisdiction.toUpperCase()) {
          case 'EU':
            return jName.includes('eu') ||
              jName.includes('europe') ||
              jName.includes('european') ||
              jCode.includes('eu');
          case 'US':
            return jName.includes('us') ||
              jName.includes('united states') ||
              jName.includes('america') ||
              jCode.includes('us');
          case 'GLOBAL':
            return !(jName.includes('eu') || jName.includes('europe') ||
              jName.includes('us') || jName.includes('united states'));
          default:
            return jName.includes(jurisdiction.toLowerCase()) ||
              jCode.includes(jurisdiction.toLowerCase());
        }
      });
    });
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

    return Array.from(countrySet);
  }

  const mapCountries = getMapCountries();

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

  const handleRemoveArticleImage = (articleId: string) => {
    handleArticleUpdate(articleId, { imageUrl: "" })
  }

  // Get article ID for linking
  const getArticleId = (article: any, index: number) => {
    if (article.news_id) {
      return `article-${article.news_id}`
    }
    return `article-${index}`
  }

  const renderEditableText = (content: string, sectionId: string, placeholder: string, rows: number = 4) => {
    if (isEditing === sectionId) {
      return (
        <div className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => {
              const section = sectionId.split('-')[0];
              const field = sectionId.split('-')[1];
              handleContentChange(section, field, e.target.value);
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
            <Button
              onClick={() => setIsEditing(null)}
              variant="outline"
              className="text-sm"
            >
              Cancel
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Use <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl+B</kbd> for bold, <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl+I</kbd> for italic.
          </p>
        </div>
      );
    }

    return (
      <div className="group relative">
        <div className="leading-relaxed whitespace-pre-wrap">
          {formatBoldText(content)}
        </div>
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
            disabled={pendingOperations.has(`regenerate-${sectionId}`)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {pendingOperations.has(`regenerate-${sectionId}`) ? 'Regenerating...' : 'Regenerate'}
          </Button>
        </div>
      </div>
    );
  };

  const renderEditableTitle = (title: string, sectionId: string, placeholder: string) => {
    if (isEditing === sectionId) {
      return (
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => {
              const section = sectionId.split('-')[0];
              const field = sectionId.split('-')[1];
              handleContentChange(section, field, e.target.value);
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
            <Button
              onClick={() => setIsEditing(null)}
              variant="outline"
              className="text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="group relative">
        <h2 className="text-4xl font-bold mb-6 text-gray-900 border-b pb-2 print:text-3xl print:mb-4">
          {title || placeholder}
        </h2>
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
            disabled={pendingOperations.has(`regenerate-${sectionId}`)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {pendingOperations.has(`regenerate-${sectionId}`) ? 'Regenerating...' : 'Regenerate'}
          </Button>
        </div>
      </div>
    );
  };

  const renderArticle = (article: any, index: number) => {
    const currentArticle = articles.find(a => a.news_id === article.news_id) || article;
    const articleId = getArticleId(currentArticle, index);

    const handleAddSourceClick = () => {
      handleOpenSourceModal(currentArticle);
    };

    return (
      <div
        id={articleId}
        key={currentArticle.news_id}
        className="article-container mb-4 print:mb-3 break-inside-avoid-page print:min-h-0"
      >
        <div className="border-l-4 pl-4 py-1 group relative" style={{ borderColor: themeColors[theme] }}>
          {/* Edit/Regenerate buttons - shown on hover */}
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 print:hidden">
            <Button
              onClick={() => {
                setEditingArticle(currentArticle)
                setShowArticleEditModal(true)
              }}
              variant="outline"
              size="sm"
              className="bg-white/90 hover:bg-white text-xs"
            >
              Edit
            </Button>
            <Button
              onClick={() => handleRegenerateArticle(currentArticle.news_id)}
              disabled={pendingOperations.has(`article-${currentArticle.news_id}`)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
            >
              {pendingOperations.has(`article-${currentArticle.news_id}`) ? 'Regenerating...' : 'Regenerate'}
            </Button>
            {/* Updated Pexels button */}
            <Button
              onClick={() => handleOpenPexelsSearch(currentArticle.news_id)}
              variant="outline"
              size="sm"
              className="bg-white/90 hover:bg-white text-xs"
            >
              Search Images
            </Button>
          </div>

          {/* Content container with reduced spacing */}
          <div className="space-y-1 print:space-y-0.5">

            {/* Article header and jurisdiction */}
            <div className="flex items-start gap-2 mb-1 print:mb-0.5">
              <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5 rounded print:text-2xs">
                {currentArticle.jurisdictions?.[0]?.code || 'GLOBAL'}
              </span>
            </div>

            {/* Article title */}
            <h3 className="text-lg font-bold text-gray-800 print:text-base print:mb-0.5 print:leading-tight">{currentArticle.news_title}</h3>

            {/* Article image - positioned at top with reduced spacing */}
            {currentArticle.imageUrl && (
              <div className="my-1 print:my-0.5">
                <ArticleImageDisplay
                  imageUrl={currentArticle.imageUrl}
                  alt={currentArticle.news_title}
                  onImageUpload={(file) => handleArticleImageUpload(currentArticle.news_id, file)}
                  onPexelsImageSelect={(imageUrl) => handleArticleUpdate(currentArticle.news_id, { imageUrl })}
                  onRemoveImage={() => handleRemoveArticleImage(currentArticle.news_id)}
                  editable={true}
                />
              </div>
            )}

            <div
              className="text-gray-700 mb-2 print:text-sm print:mb-1 print:leading-snug"
              style={{ textAlign: "justify" }}
            >
              {formatBoldText(currentArticle.news_summary)}
            </div>
            {/* Source Information */}
            {currentArticle.source && currentArticle.source.length > 0 && (
              <div className="mb-1 print:mb-0.5">
                <div className="flex items-center gap-1 mb-0.5">
                  <strong className="text-sm text-gray-600 print:text-xs">Source:</strong>
                  <Button
                    onClick={() => handleOpenSourceModal(currentArticle)}
                    variant="outline"
                    size="sm"
                    className="print:hidden text-xs"
                  >
                    Manage Sources
                  </Button>
                </div>
                {currentArticle.source.map((source: SourceData, index: number) => (
                  <div key={source.id || index} className="text-sm text-gray-600 print:text-xs ml-1">
                    {source.source_url ? (
                      <a
                        href={source.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline print:text-black print:no-underline print-source-link break-all"
                      >
                        {source.source_url}
                      </a>
                    ) : (
                      <span>Original Source</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add Source button for articles without sources */}
            {(!currentArticle.source || currentArticle.source.length === 0) && (
              <div className="mb-1">
                <Button
                  onClick={handleAddSourceClick}
                  variant="outline"
                  size="sm"
                  className="print:hidden text-xs"
                >
                  Add Source
                </Button>
              </div>
            )}
            {/* Publication date card */}
            <div className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-lg shadow-sm inline-block print:text-2xs">
              {formatDate(currentArticle.published_at)}
            </div>

            {/* Upload interface for articles without images - with drag and drop support */}
            {!currentArticle.imageUrl && (
              <div className="mt-2 print:hidden">
                <ArticleImageDisplay
                  imageUrl={currentArticle.imageUrl}
                  alt={currentArticle.news_title}
                  onImageUpload={(file) => handleArticleImageUpload(currentArticle.news_id, file)}
                  onPexelsImageSelect={(imageUrl) => handleArticleUpdate(currentArticle.news_id, { imageUrl })}
                  onRemoveImage={() => handleRemoveArticleImage(currentArticle.news_id)}
                  editable={true}
                  articleId={currentArticle.news_id}
                  isDragOver={dragOverArticle === currentArticle.news_id}
                  onDragOver={(e) => handleArticleDragOver(e, currentArticle.news_id)}
                  onDragLeave={handleArticleDragLeave}
                  onDrop={(e) => handleArticleDrop(e, currentArticle.news_id)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderRegionalSection = (region: 'euSection' | 'usSection' | 'globalSection') => {
    const sectionConfig = safeBulletinConfig[region];
    const sectionContent = editableContent[region];

    let regionalArticles = [];
    switch (region) {
      case 'euSection':
        regionalArticles = getArticlesByJurisdiction('EU');
        break;
      case 'usSection':
        regionalArticles = getArticlesByJurisdiction('US');
        break;
      case 'globalSection':
        regionalArticles = getArticlesByJurisdiction('GLOBAL');
        break;
    }

    // Show section if there's content OR articles OR the section is enabled
    const hasContent = sectionContent.title ||
      sectionContent.introduction ||
      sectionContent.trends ||
      regionalArticles.length > 0 ||
      sectionConfig.enabled;

    if (!hasContent) return null;

    return (
      regionalArticles.length > 0 && (
        <section className="print:break-after-page">
          {(sectionContent.title || regionalArticles.length > 0) && renderEditableTitle(
            sectionContent.title,
            `${region}-title`,
            `${region.replace('Section', '').toUpperCase()} Regulatory Developments`
          )}

          {sectionContent.introduction && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4 print:p-3 print:mb-3 print:bg-gray-100 print:border">
              {renderEditableText(
                sectionContent.introduction,
                `${region}-introduction`,
                "Section introduction...",
                3
              )}
            </div>
          )}

          {sectionContent.trends && (
            <div className="mb-6 print:mb-4">
              <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden print:shadow-none">

                {/* CARD HEADER */}
                <div className="border-b border-neutral-200 bg-neutral-50 px-5 py-3 print:px-3 print:py-2">
                  <h3 className="text-base font-semibold text-neutral-800">
                    {region.replace("Section", "").toUpperCase()} • Key Trends
                  </h3>
                </div>

                {/* CARD BODY */}
                <div className="p-5 print:p-3">
                  {renderEditableText(
                    sectionContent.trends,
                    `${region}-trends`,
                    "Describe the key regional trends...",
                    4
                  )}
                </div>

              </div>
            </div>
          )}

        <div
  className={
    `m-4 gap-6 print:gap-3 grid grid-cols-1 ` +
    (regionalArticles.length > 1 
      ? "lg:grid-cols-2 print:grid-cols-2" 
      : "")
  }
>
  {regionalArticles.map((article, index) => (
    <div
      key={index}
      className={
        regionalArticles.length % 2 === 1 && index === regionalArticles.length - 1
          ? "lg:col-span-2 print:col-span-2"
          : ""
      }
    >
      {renderArticle(article, index)}
    </div>
  ))}
</div>


        </section>
      )
    );
  };

  // Custom WorldMap component with interactive legend
  const InteractiveWorldMap = ({
    countries,
    primaryColor,
    articlesByCountry,
    mappedCountries,
    theme,
    interactive = false,
    showLegend = true
  }: any) => {
    // Create a mapping of country names to article IDs
    const countryToArticleMap = useRef(new Map());

    // Populate the mapping
    useEffect(() => {
      countries.forEach((country: string) => {
        const articles = articlesByCountry[country] || [];
        if (articles.length > 0) {
          const firstArticle = articles[0];
          const articleId = getArticleId(firstArticle, 0); // This uses the getArticleId from parent
          countryToArticleMap.current.set(country, articleId);
        }
      });
    }, [countries, articlesByCountry]);

    const handleLegendClick = (country: string) => {
      const articleId = countryToArticleMap.current.get(country);
      if (articleId) {
        const element = document.getElementById(articleId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 print:p-3 print:border">
        <WorldMap
          countries={countries}
          primaryColor={primaryColor}
          articlesByCountry={articlesByCountry}
          mappedCountries={mappedCountries}
          theme={theme}
          interactive={interactive}
          showLegend={showLegend}
          onLegendClick={handleLegendClick}
          getArticleId={getArticleId} // Pass the function to WorldMap
        />
      </div>
    );
  };

  // Main bulletin content renderer - used in both normal view and split-screen
  const renderBulletinContent = () => (
    <div className="print:block print:bg-white print:p-0 print:max-w-none">
      {/* HEADER SECTION - UPDATED WITH DRAG AND DROP */}
      <div 
        className={`relative mb-6 border-b pb-4 overflow-hidden print:mb-3 print:pb-2 ${
          isHeaderDragOver ? 'ring-2 ring-blue-500 bg-blue-50' : ''
        }`}
        onDragOver={handleHeaderDragOver}
        onDragLeave={handleHeaderDragLeave}
        onDrop={handleHeaderDrop}
      >
        {/* Header Background Image Container */}
        <div className="absolute inset-0 z-0 print:absolute print:inset-0 print:z-0 h-40">
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50 print:bg-black/30 z-10"></div>

          {/* Header Background Image */}
          <div className="relative w-full h-full z-0">
            {editableContent.headerImage ? (
              <img
                src={editableContent.headerImage}
                alt="Header Background"
                className="w-full h-full object-cover print:h-40 print:object-cover print:rounded-none"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center print:bg-gray-300 h-40">
                <span className="text-gray-500 print:text-gray-700">
                  {isHeaderDragOver ? 'Drop image here' : 'No header image'}
                </span>
              </div>
            )}
          </div>
          
          {/* Drag overlay hint */}
          {isHeaderDragOver && (
            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center z-20">
              <div className="text-white text-center bg-blue-600/90 p-4 rounded-lg">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="font-medium">Drop to set as header background</p>
              </div>
            </div>
          )}
        </div>

        {/* Header Content Container */}
        <div className="relative z-50 text-center flex flex-col items-center print:relative print:z-[100] print:w-full">
          <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-6xl mx-auto px-6 print:px-0 print:max-w-full print:items-center print:relative print:z-[100]">

            {/* Header Title */}
            <div className="relative print:relative print:z-[100] print:flex-1">
              <h1
                className="text-3xl font-bold mb-3 text-white tracking-tight leading-tight text-center sm:text-left break-words print:text-2xl print:mb-1 print:relative print:z-[100]"
                dangerouslySetInnerHTML={{
                  __html: (() => {
                    const header = editableContent.headerText || "ESG BULLETIN";
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
            </div>

            {/* Publisher Logo */}
            <div className="relative print:relative print:z-[100] print:ml-0 print:flex-shrink-0 h-14">
              {editableContent.publisherLogo ? (
                <div className="print:min-w-[80px] print:no-margins print:no-frame h-14">
                  <img
                    src={editableContent.publisherLogo}
                    alt="Publisher Logo"
                    className="h-14 w-auto object-contain mt-1 sm:mt-0 sm:ml-3 print:h-16 print:mt-0 print:ml-0 print:max-h-[60px] print:w-auto print:block print:relative print:z-[100] print:no-margins print:no-frame"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    style={{
                      mixBlendMode: 'normal',
                      filter: 'none'
                    }}
                  />
                </div>
              ) : (
                <div className="h-14 w-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center mt-1 sm:mt-0 sm:ml-3 print:h-16 print:w-24 print:mt-0 print:ml-0 print:bg-white print:border-0 print:relative print:z-[100] print:no-margins print:no-frame">
                  <span className="text-gray-500 text-xs text-center print:text-gray-700">No logo</span>
                </div>
              )}
            </div>
          </div>

          {/* Issue Info */}
          <div className="relative mt-2 flex justify-start w-full max-w-6xl mx-auto px-6 text-sm font-semibold text-white print:px-0 print:max-w-full print:mt-1 print:text-xs print:relative print:z-[100] print:w-full">
            <span className="px-2 py-0.5 rounded print:bg-transparent print:px-0">
              {editableContent.issueNumber || "Issue #10"} |{" "}
              {formatConfigDate(editableContent.publicationDate)}
            </span>
          </div>
        </div>
      </div>

      {/* GREETING MESSAGE */}
      {editableContent.greetingMessage && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-gray-50 p-4 rounded-lg border print:p-3 print:mb-4 print:bg-gray-100 print:border">
          <div className="text-gray-700 leading-relaxed print:text-sm">
            {renderEditableText(
              editableContent.greetingMessage,
              "greetingMessage",
              "Greeting message...",
              3
            )}
          </div>
        </div>
      )}

      {/* INTERACTIVE MAP */}
      {safeBulletinConfig.interactiveMap && (
        <div className="mb-8 print:mb-6 print:break-after-page">
          <InteractiveWorldMap
            countries={mapCountries}
            primaryColor={themeColors[theme]}
            articlesByCountry={articlesByCountry}
            mappedCountries={countryMappings}
            theme={theme}
            interactive={false}
            showLegend={true}
          />
        </div>
      )}

      {/* KEY TRENDS & EXECUTIVE SUMMARY CONTAINER */}
      {(editableContent.keyTrends || editableContent.executiveSummary) && (
        <div className="print:break-after-page">
          {/* KEY TRENDS */}
          {editableContent.keyTrends && (
            <div className="mb-8 print:mb-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b pb-1 print:text-xl print:mb-3">5 Key Trends</h2>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 print:p-3 print:bg-blue-100 print:border">
                {renderEditableText(
                  editableContent.keyTrends,
                  "keyTrends",
                  "Key trends will appear here...",
                  6
                )}
              </div>
            </div>
          )}

          {/* EXECUTIVE SUMMARY */}
          {editableContent.executiveSummary && (
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-gray-50 p-6 rounded-lg border print:p-4 print:mb-6 print:bg-gray-100 print:border">
              <h2 className="text-xl font-bold mb-3 text-gray-900 print:text-lg">Executive Summary</h2>
              <div className="text-gray-700 print:text-sm">
                {renderEditableText(
                  editableContent.executiveSummary,
                  "executiveSummary",
                  "Executive summary will appear here...",
                  8
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* REGIONAL SECTIONS */}
      {renderRegionalSection('euSection')}
      {renderRegionalSection('usSection')}
      {renderRegionalSection('globalSection')}

      {/* KEY TAKEAWAYS & FOOTER CONTAINER */}
      <div className="print:break-before-page">
        {/* KEY TAKEAWAYS */}
        {editableContent.keyTakeaways && (
          <div className="mb-8 bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-lg border print:p-4 print:bg-gray-100 print:border print:mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 print:text-lg print:mb-3">Conclusion & Key Takeaways</h2>
            <div className="text-gray-700 space-y-3 print:text-sm print:space-y-2">
              {renderEditableText(
                editableContent.keyTakeaways,
                "keyTakeaways",
                "Key takeaways will appear here...",
                6
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ALL MODALS AT THE SAME LEVEL */}
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
          publisherLogo: editableContent.publisherLogo
        }}
      />

      <ArticleEditModal
        isOpen={showArticleEditModal}
        onClose={() => {
          setShowArticleEditModal(false)
          setEditingArticle(null)
        }}
        onSave={handleArticleUpdate}
        article={editingArticle}
        onOpenSourceModal={handleOpenSourceModal}
        onOpenPexelsSearch={handleOpenPexelsSearch}
      />

      <SourceEditModal
        isOpen={showSourceModal}
        onClose={() => {
          setShowSourceModal(false)
          setEditingSource(null)
          setSourceModalArticle(null)
        }}
        onSave={handleSaveSource}
        source={editingSource}
        articleTitle={sourceModalArticle?.news_title}
      />

      {/* Single Pexels Search with Split Screen */}
      <PexelsImageSearch
        onImageSelect={handlePexelsImageSelect}
        currentArticleId={pexelsTargetArticle}
        onClose={handleClosePexelsSearch}
        isOpen={isPexelsSearchOpen}
        bulletinContent={renderBulletinContent()}
      />

      {/* Main Bulletin Content - Only show when Pexels is closed */}
      {!isPexelsSearchOpen && (
        <div className="container mx-auto p-8 max-w-7xl bg-white">

          <div className="flex justify-center gap-3 mb-6 print:hidden">
            <Button
              onClick={onStartOver}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-5 rounded"
            >
              Select Other Articles
            </Button>
            <Button
              onClick={() => setShowHeaderEditModal(true)}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-5 rounded"
            >
              Edit Header
            </Button>
            <Button
              onClick={() => handleOpenPexelsSearch()}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-5 rounded"
            >
              Search Images
            </Button>
            <Button
              onClick={handleDownloadPDF}
              className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-5 rounded"
            >
              Download PDF
            </Button>
          </div>
          {/* NEW: Unified loading indicator */}
          {isLoading && (
            <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="text-center max-w-md mx-4">
                {/* Animated spinner */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 border-4 border-blue-200 rounded-full mx-auto"></div>
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                </div>

                {/* Loading text with progress */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                      Summarizing Bulletin Articles
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Summarizing {pendingOperations.size} item{pendingOperations.size !== 1 ? 's' : ''}...
                  </p>


                  {/* Progress dots animation */}
                  <div className="flex justify-center space-x-1 pt-4">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main bulletin content */}
          {renderBulletinContent()}
        </div>
      )}
    </>
  )
}