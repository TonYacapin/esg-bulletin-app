"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Search,
  Calendar,
  Globe,
  FileText,
  Layout,
  Eye,
  Zap,
  ChevronDown,
  ChevronUp,
  Settings,
  TrendingUp,
  AlertCircle,
  ShieldAlert,
  ServerOff,
  AlertTriangle,
} from "lucide-react"
import type React from "react"
import { validateBulletinForm, getFieldError } from "@/lib/services/validation.service"
import type {
  BulletinFormData,
  BulletinFormFilters,
  BulletinFormProps,
  BackendError,
  ValidationError,
  ErrorInfo,
  HttpErrorCode,
  BulletinTheme,
} from "@/lib/types"

/**
 * Parses backend error response
 */
function parseBackendError(errorString: string | null): BackendError | null {
  if (!errorString) return null

  try {
    if (typeof errorString === "object") {
      return errorString as BackendError
    }
    const parsed = JSON.parse(errorString)
    return parsed
  } catch {
    return {
      code: 500 as HttpErrorCode,
      message: errorString,
    }
  }
}

/**
 * Maps backend error to UI error info
 */
function getErrorMessage(error: BackendError | null): ErrorInfo | null {
  if (!error) return null

  const errorMap: Record<HttpErrorCode, ErrorInfo> = {
    400: {
      title: "Invalid Request",
      description: error.errors?.[0]?.message || error.message || "Please check your input parameters",
      icon: AlertCircle,
      color: "text-amber-600",
      bgColor: "bg-amber-50/50",
      borderColor: "border-amber-200",
    },
    401: {
      title: "Authentication Required",
      description: "Please check your authentication credentials and try again",
      icon: ShieldAlert,
      color: "text-red-600",
      bgColor: "bg-red-50/50",
      borderColor: "border-red-200",
    },
    403: {
      title: "Access Denied",
      description: "You don't have permission to access this resource",
      icon: ShieldAlert,
      color: "text-red-600",
      bgColor: "bg-red-50/50",
      borderColor: "border-red-200",
    },
    404: {
      title: "Resource Not Found",
      description: "The requested resource could not be found",
      icon: AlertCircle,
      color: "text-amber-600",
      bgColor: "bg-amber-50/50",
      borderColor: "border-amber-200",
    },
    422: {
      title: "Validation Failed",
      description: "Please check the form for errors",
      icon: AlertTriangle,
      color: "text-amber-600",
      bgColor: "bg-amber-50/50",
      borderColor: "border-amber-200",
    },
    429: {
      title: "Too Many Requests",
      description: "Please wait a moment before trying again",
      icon: AlertCircle,
      color: "text-amber-600",
      bgColor: "bg-amber-50/50",
      borderColor: "border-amber-200",
    },
    500: {
      title: "Server Error",
      description: "An unexpected error occurred on our servers. Please try again later.",
      icon: ServerOff,
      color: "text-red-600",
      bgColor: "bg-red-50/50",
      borderColor: "border-red-200",
    },
    503: {
      title: "Service Unavailable",
      description: "The service is temporarily unavailable. Please try again later.",
      icon: ServerOff,
      color: "text-amber-600",
      bgColor: "bg-amber-50/50",
      borderColor: "border-amber-200",
    },
  }

  return (
    errorMap[error.code] || {
      title: "Something went wrong",
      description: error.message || "An unexpected error occurred",
      icon: AlertCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-50/50",
      borderColor: "border-gray-200",
    }
  )
}

/**
 * Theme configuration for visual styling
 */
const THEME_CONFIG = {
  blue: {
    color: "#3B82F6",
    light: "bg-blue-50/50",
    border: "border-blue-100",
    gradient: "from-blue-500 to-blue-600",
  },
  green: {
    color: "#10B981",
    light: "bg-emerald-50/50",
    border: "border-emerald-100",
    gradient: "from-emerald-500 to-emerald-600",
  },
  red: {
    color: "#EF4444",
    light: "bg-rose-50/50",
    border: "border-rose-100",
    gradient: "from-rose-500 to-rose-600",
  },
} as const

/**
 * Bulletin form component
 * Handles user input for bulletin generation with validation
 */
export function BulletinForm({ onGenerate, loading, error }: BulletinFormProps) {
  // Form state
  const [theme, setTheme] = useState<BulletinTheme>("blue")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filters, setFilters] = useState<BulletinFormFilters>({
    type_id: "all",
    jurisdiction_id: "all",
    published_at_from: "",
    published_at_to: "",
    updated_at_from: "",
    updated_at_to: "",
  })
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const { toast } = useToast()

  /**
   * Handles form submission with validation
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const formData: BulletinFormData = {
      theme,
      query,
      page,
      limit,
      type_id: filters.type_id !== "all" ? Number.parseInt(filters.type_id) : undefined,
      jurisdiction_id: filters.jurisdiction_id !== "all" ? Number.parseInt(filters.jurisdiction_id) : undefined,
      published_at_from: filters.published_at_from || undefined,
      published_at_to: filters.published_at_to || undefined,
      updated_at_from: filters.updated_at_from || undefined,
      updated_at_to: filters.updated_at_to || undefined,
    }

    const errors = validateBulletinForm(formData)
    setValidationErrors(errors)

    if (errors.length > 0) {
      // Focus on first error field
      const firstErrorField = errors[0].field
      const element = document.getElementById(firstErrorField)
      if (element) {
        element.focus()
      }

      toast({
        title: "Form Validation Error",
        description: `Please check ${errors.length} field${errors.length > 1 ? "s" : ""} with errors`,
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    // Submit form
    onGenerate(formData)
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
    clearFieldError(field)
  }

  // Show backend error as toast
  useEffect(() => {
    if (error) {
      const backendError = parseBackendError(error)
      const errorInfo = getErrorMessage(backendError)

      if (errorInfo) {
        toast({
          title: errorInfo.title,
          description: errorInfo.description,
          variant: "destructive",
          duration: 8000,
        })
      }
    }
  }, [error, toast])

  // Count active filters
  const activeFiltersCount = [
    filters.type_id !== "all",
    filters.jurisdiction_id !== "all",
    filters.published_at_from !== "",
    filters.published_at_to !== "",
    filters.updated_at_from !== "",
    filters.updated_at_to !== "",
  ].filter(Boolean).length

  const backendError = parseBackendError(error)
  const errorInfo = getErrorMessage(backendError)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-light text-gray-900 mb-3 tracking-tight">ESG Bulletin Generator</h1>
          <p className="text-gray-500 text-lg font-light max-w-md mx-auto">
            Create clean, focused ESG reports with global insights
          </p>
        </div>

        <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader
            className={`pb-6 border-b ${
              theme === "blue"
                ? "bg-blue-50/50 border-blue-100"
                : theme === "green"
                  ? "bg-emerald-50/50 border-emerald-100"
                  : "bg-rose-50/50 border-rose-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg bg-gradient-to-r ${
                  theme === "blue"
                    ? "from-blue-500 to-blue-600"
                    : theme === "green"
                      ? "from-emerald-500 to-emerald-600"
                      : "from-rose-500 to-rose-600"
                }`}
              >
                <Layout className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">Bulletin Configuration</CardTitle>
                <CardDescription className="text-gray-500">Customize your ESG insights</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Enhanced Error Display */}
            {errorInfo && (
              <div
                className={`${errorInfo.bgColor} border ${errorInfo.borderColor} text-gray-900 px-4 py-4 rounded-lg mb-6 animate-in fade-in duration-200`}
              >
                <div className="flex items-start gap-3">
                  <errorInfo.icon className={`h-5 w-5 mt-0.5 ${errorInfo.color}`} />
                  <div className="flex-1">
                    <h4 className={`font-semibold text-sm ${errorInfo.color} mb-1`}>{errorInfo.title}</h4>
                    <p className="text-sm text-gray-700">{errorInfo.description}</p>
                    {backendError?.errors && backendError.errors.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {backendError.errors.map((err, index) => (
                          <div key={index} className="text-xs text-gray-600 flex items-center gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            {err.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Frontend Validation Errors Summary */}
            {validationErrors.length > 0 && (
              <div className="bg-amber-50/50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 mt-0.5 text-amber-600" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-amber-700 mb-2">Please fix the following errors:</h4>
                    <ul className="text-sm space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-amber-600 rounded-full"></div>
                          {error.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Theme Selection */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Bulletin Theme *
                </Label>

                {/* Theme Validation Error */}
                {getFieldError(validationErrors, "theme") && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                    {getFieldError(validationErrors, "theme")}
                  </div>
                )}

                <RadioGroup value={theme} onValueChange={handleThemeChange} className="flex gap-3">
                  {(["blue", "green", "red"] as const).map((color) => (
                    <div key={color} className="flex-1">
                      <RadioGroupItem value={color} id={color} className="sr-only" />
                      <Label
                        htmlFor={color}
                        className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                          theme === color
                            ? `shadow-sm bg-white ${
                                color === "blue"
                                  ? "border-blue-500"
                                  : color === "green"
                                    ? "border-emerald-500"
                                    : "border-rose-500"
                              }`
                            : "border-gray-200 hover:border-gray-300 bg-white/50"
                        } ${getFieldError(validationErrors, "theme") ? "border-red-300" : ""}`}
                      >
                        <div
                          className="w-6 h-6 rounded-full mb-3 shadow-sm border"
                          style={{ backgroundColor: THEME_CONFIG[color].color }}
                        />
                        <span className="font-medium text-gray-900 text-sm capitalize">{color}</span>
                        <span className="text-xs text-gray-500 mt-1 text-center">
                          {color === "blue" && "Regulatory"}
                          {color === "green" && "Disclosure"}
                          {color === "red" && "Litigation"}
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <p className="text-xs text-gray-500">
                  Select a theme to define the visual style and focus of your bulletin
                </p>
              </div>

              {/* Search Section */}
              <div className="space-y-3">
                <Label htmlFor="query" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search Content *
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    id="query"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value)
                      clearFieldError("query")
                    }}
                    placeholder="Search topics, keywords, or summaries..."
                    className={`pl-10 py-2.5 text-sm border bg-white/50 transition-colors rounded-lg ${
                      getFieldError(validationErrors, "query")
                        ? "border-red-300 focus:border-red-500 text-red-900"
                        : "border-gray-200 focus:border-gray-400"
                    }`}
                    maxLength={500}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className={getFieldError(validationErrors, "query") ? "text-red-600" : "text-gray-500"}>
                    {getFieldError(validationErrors, "query") ||
                      "Search for ESG-related topics, regulations, or disclosures"}
                  </span>
                  <span className={getFieldError(validationErrors, "query") ? "text-red-600" : "text-gray-500"}>
                    {query.length}/500
                  </span>
                </div>
              </div>

              {/* Quick Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="page" className="text-sm font-medium text-gray-700">
                    Page
                  </Label>
                  <Input
                    type="number"
                    id="page"
                    min="1"
                    max="1000"
                    value={page}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value) || 1
                      setPage(value)
                      clearFieldError("page")
                    }}
                    className={`border bg-white/50 transition-colors rounded-lg text-sm ${
                      getFieldError(validationErrors, "page")
                        ? "border-red-300 focus:border-red-500 text-red-900"
                        : "border-gray-200 focus:border-gray-400"
                    }`}
                  />
                  {getFieldError(validationErrors, "page") && (
                    <p className="text-xs text-red-600">{getFieldError(validationErrors, "page")}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="limit" className="text-sm font-medium text-gray-700">
                    Results
                  </Label>
                  <Select
                    value={limit.toString()}
                    onValueChange={(value) => {
                      const valueNum = Number.parseInt(value)
                      setLimit(valueNum)
                      clearFieldError("limit")
                    }}
                  >
                    <SelectTrigger
                      className={`border bg-white/50 rounded-lg text-sm ${
                        getFieldError(validationErrors, "limit")
                          ? "border-red-300 focus:border-red-500 text-red-900"
                          : "border-gray-200 focus:border-gray-400"
                      }`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 Headlines</SelectItem>
                      <SelectItem value="25">25 Headlines</SelectItem>
                      <SelectItem value="50">50 Headlines</SelectItem>
                      <SelectItem value="100">100 Headlines</SelectItem>
                    </SelectContent>
                  </Select>
                  {getFieldError(validationErrors, "limit") && (
                    <p className="text-xs text-red-600">{getFieldError(validationErrors, "limit")}</p>
                  )}
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="border-t border-gray-100 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors w-full group"
                >
                  <Settings className="h-4 w-4" />
                  <span className="font-medium text-sm">Advanced Filters</span>
                  <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-600">
                    {activeFiltersCount}
                  </Badge>
                  <div className="ml-auto transform transition-transform duration-200 group-hover:scale-110">
                    {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>

                {showAdvanced && (
                  <div className="space-y-6 animate-in fade-in duration-200 mt-6">
                    {/* Date Range Section */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <Label className="font-medium text-sm">Published</Label>
                        </div>
                        <div className="space-y-2">
                          <Input
                            type="date"
                            id="published_at_from"
                            value={filters.published_at_from}
                            onChange={(e) => handleFilterChange("published_at_from", e.target.value)}
                            className={`border bg-white/50 rounded-lg text-sm ${
                              getFieldError(validationErrors, "published_at_from")
                                ? "border-red-300 focus:border-red-500 text-red-900"
                                : "border-gray-200 focus:border-gray-400"
                            }`}
                            max={new Date().toISOString().split("T")[0]}
                          />
                          <Input
                            type="date"
                            id="published_at_to"
                            value={filters.published_at_to}
                            onChange={(e) => handleFilterChange("published_at_to", e.target.value)}
                            className={`border bg-white/50 rounded-lg text-sm ${
                              getFieldError(validationErrors, "published_at_to")
                                ? "border-red-300 focus:border-red-500 text-red-900"
                                : "border-gray-200 focus:border-gray-400"
                            }`}
                            max={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                        {(getFieldError(validationErrors, "published_at_from") ||
                          getFieldError(validationErrors, "published_at_to")) && (
                          <p className="text-xs text-red-600">
                            {getFieldError(validationErrors, "published_at_from") ||
                              getFieldError(validationErrors, "published_at_to")}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <TrendingUp className="h-4 w-4" />
                          <Label className="font-medium text-sm">Updated</Label>
                        </div>
                        <div className="space-y-2">
                          <Input
                            type="date"
                            id="updated_at_from"
                            value={filters.updated_at_from}
                            onChange={(e) => handleFilterChange("updated_at_from", e.target.value)}
                            className={`border bg-white/50 rounded-lg text-sm ${
                              getFieldError(validationErrors, "updated_at_from")
                                ? "border-red-300 focus:border-red-500 text-red-900"
                                : "border-gray-200 focus:border-gray-400"
                            }`}
                            max={new Date().toISOString().split("T")[0]}
                          />
                          <Input
                            type="date"
                            id="updated_at_to"
                            value={filters.updated_at_to}
                            onChange={(e) => handleFilterChange("updated_at_to", e.target.value)}
                            className={`border bg-white/50 rounded-lg text-sm ${
                              getFieldError(validationErrors, "updated_at_to")
                                ? "border-red-300 focus:border-red-500 text-red-900"
                                : "border-gray-200 focus:border-gray-400"
                            }`}
                            max={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                        {(getFieldError(validationErrors, "updated_at_from") ||
                          getFieldError(validationErrors, "updated_at_to")) && (
                          <p className="text-xs text-red-600">
                            {getFieldError(validationErrors, "updated_at_from") ||
                              getFieldError(validationErrors, "updated_at_to")}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Content Filters */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FileText className="h-4 w-4" />
                          <Label className="font-medium text-sm">Content Type</Label>
                        </div>
                        <Select value={filters.type_id} onValueChange={(value) => handleFilterChange("type_id", value)}>
                          <SelectTrigger
                            className={`border bg-white/50 rounded-lg text-sm ${
                              getFieldError(validationErrors, "type_id")
                                ? "border-red-300 focus:border-red-500 text-red-900"
                                : "border-gray-200 focus:border-gray-400"
                            }`}
                          >
                            <SelectValue placeholder="All types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All types</SelectItem>
                            <SelectItem value="2">Disclosure</SelectItem>
                            <SelectItem value="1">Regulation</SelectItem>
                            <SelectItem value="3">Guidance</SelectItem>
                          </SelectContent>
                        </Select>
                        {getFieldError(validationErrors, "type_id") && (
                          <p className="text-xs text-red-600">{getFieldError(validationErrors, "type_id")}</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Globe className="h-4 w-4" />
                          <Label className="font-medium text-sm">Jurisdiction</Label>
                        </div>
                        <Select
                          value={filters.jurisdiction_id}
                          onValueChange={(value) => handleFilterChange("jurisdiction_id", value)}
                        >
                          <SelectTrigger
                            className={`border bg-white/50 rounded-lg text-sm ${
                              getFieldError(validationErrors, "jurisdiction_id")
                                ? "border-red-300 focus:border-red-500 text-red-900"
                                : "border-gray-200 focus:border-gray-400"
                            }`}
                          >
                            <SelectValue placeholder="All regions" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All regions</SelectItem>
                            <SelectItem value="1">Australia</SelectItem>
                            <SelectItem value="2">Singapore</SelectItem>
                            <SelectItem value="3">United States</SelectItem>
                            <SelectItem value="4">European Union</SelectItem>
                            <SelectItem value="5">World</SelectItem>
                          </SelectContent>
                        </Select>
                        {getFieldError(validationErrors, "jurisdiction_id") && (
                          <p className="text-xs text-red-600">{getFieldError(validationErrors, "jurisdiction_id")}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  disabled={loading || validationErrors.length > 0}
                  className={`bg-gradient-to-r text-white font-medium py-2.5 px-8 rounded-lg text-sm shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px] group ${
                    theme === "blue"
                      ? "from-blue-500 to-blue-600"
                      : theme === "green"
                        ? "from-emerald-500 to-emerald-600"
                        : "from-rose-500 to-rose-600"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Searching...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      Fetch Headlines
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
