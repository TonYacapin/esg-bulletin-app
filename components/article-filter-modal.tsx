// components/article-filter-modal.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface ArticleFilters {
  type?: string
  jurisdiction?: string
  dateFrom?: string
  dateTo?: string
  searchQuery?: string
}

interface ArticleFilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: ArticleFilters) => void
  currentFilters: ArticleFilters
  theme: "blue" | "green" | "red"
}

export function ArticleFilterModal({ 
  isOpen, 
  onClose, 
  onApplyFilters, 
  currentFilters, 
  theme 
}: ArticleFilterModalProps) {
  const [filters, setFilters] = useState<ArticleFilters>(currentFilters)
  
  const themeColors = {
    blue: "#1976D2",
    green: "#388E3C",
    red: "#D32F2F",
  }

  // Reset filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setFilters(currentFilters)
    }
  }, [isOpen, currentFilters])

  const handleApply = () => {
    onApplyFilters(filters)
  }

  const handleReset = () => {
    const resetFilters: ArticleFilters = {}
    setFilters(resetFilters)
    onApplyFilters(resetFilters)
  }

  const handleFilterChange = (field: keyof ArticleFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value || undefined
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50  flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: themeColors[theme] }}>
            Filter Articles
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Search Query */}
          <div>
            <Label htmlFor="searchQuery" className="text-sm font-medium text-gray-700 mb-2">
              Search in Articles
            </Label>
            <Input
              type="text"
              id="searchQuery"
              placeholder="Search titles and summaries..."
              value={filters.searchQuery || ""}
              onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
              className="w-full"
            />
          </div>

          {/* Content Type */}
          <div>
            <Label htmlFor="type" className="text-sm font-medium text-gray-700 mb-2">
              Content Type
            </Label>
            <Select 
              value={filters.type || ""} 
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Generic">Generic</SelectItem>
                <SelectItem value="Disclosure">Disclosure</SelectItem>
                <SelectItem value="Regulatory">Regulatory</SelectItem>
                <SelectItem value="Litigation">Litigation</SelectItem>
                <SelectItem value="Enforcement Action">Enforcement Action</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Jurisdiction */}
          <div>
            <Label htmlFor="jurisdiction" className="text-sm font-medium text-gray-700 mb-2">
              Jurisdiction
            </Label>
            <Select 
              value={filters.jurisdiction || ""} 
              onValueChange={(value) => handleFilterChange("jurisdiction", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Jurisdictions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jurisdictions</SelectItem>
                <SelectItem value="EU">European Union</SelectItem>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="UK">United Kingdom</SelectItem>
                <SelectItem value="Global">Global</SelectItem>
                <SelectItem value="Australia">Australia</SelectItem>
                <SelectItem value="Singapore">Singapore</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="dateFrom" className="text-sm font-medium text-gray-700 mb-2">
                From Date
              </Label>
              <Input
                type="date"
                id="dateFrom"
                value={filters.dateFrom || ""}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="dateTo" className="text-sm font-medium text-gray-700 mb-2">
                To Date
              </Label>
              <Input
                type="date"
                id="dateTo"
                value={filters.dateTo || ""}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-gray-300 text-gray-700"
          >
            Reset All
          </Button>
          <div className="space-x-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-300 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              style={{ backgroundColor: themeColors[theme] }}
              className="text-white"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}