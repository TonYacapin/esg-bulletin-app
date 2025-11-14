import type React from "react"
/**
 * Core type definitions for the ESG Bulletin application
 * Centralized location for all TypeScript interfaces and types
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Date filter options for news fetching
 */
export type DateFilterOption = "last_week" | "last_2_weeks" | "last_month" | "custom"
/**
 * Supported bulletin themes with semantic meaning
 */
export enum BulletinTheme {
  BLUE = "blue", // Regulatory focus
  GREEN = "green", // Disclosure focus
  RED = "red", // Litigation focus
}

/**
 * Content types for ESG articles
 */
export enum ContentType {
  REGULATION = 1,
  DISCLOSURE = 2,
  GUIDANCE = 3,
}

/**
 * Supported jurisdictions for filtering
 */
export enum JurisdictionEnum {
  AUSTRALIA = 1,
  SINGAPORE = 2,
  UNITED_STATES = 3,
  EUROPEAN_UNION = 4,
  WORLD = 5,
}

/**
 * AI content generation types
 */
export enum ContentGenerationType {
  GREETING_MESSAGE = "greeting_message",
  GREETING = "greeting",
  KEY_TRENDS = "key_trends",
  EXECUTIVE_SUMMARY = "executive_summary",
  KEY_TAKEAWAYS = "key_takeaways",
  SECTION_TITLE = "section_title",
  SECTION_INTRO = "section_intro",
  SECTION_TRENDS = "section_trends",
  NEWS_SUMMARY = "news_summary",
  CALENDAR_SUMMARY = "calendar_summary",
}

/**
 * HTTP error codes for API responses
 */
export enum HttpErrorCode {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

// ============================================================================
// ARTICLE TYPES
// ============================================================================

/**
 * Jurisdiction information for articles
 */
export interface ArticleJurisdiction {
  name: string
  code: string
}

/**
 * Core article data structure
 */
export interface Article {
  news_id: number
  news_title: string
  original_title: string
  news_summary: string
  news_content: string
  published_at: string
  created_at: string
  updated_at: string
  type_id: number
  type: string
  type_value: string
  news_status: string
  imageUrl?: string
  jurisdictions: ArticleJurisdiction[]
}

/**
 * API response for news list
 */
export interface NewsListResponse {
  data: Article[]
  size: number
  count: number
}

// ============================================================================
// BULLETIN CONFIGURATION TYPES
// ============================================================================

/**
 * Regional section configuration
 */
export interface RegionalSection {
  enabled: boolean
  title: string
  keyTrends: boolean
  introduction: string
}

/**
 * Generated content storage
 */
export interface GeneratedContent {
  keyTrends: string
  executiveSummary: string
  keyTakeaways: string
  euTrends: string
  usTrends: string
  globalTrends: string
}

/**
 * Complete bulletin configuration
 */
export interface BulletinConfig {
  // Header Section
  headerText: string
  headerImage: string
  issueNumber: string
  publicationDate: string
  publisherLogo: string
  footerImage: string

  // Bulletin Structure
  tableOfContents: boolean
  greetingMessage: string
  keyTrends: boolean
  executiveSummary: boolean
  keyTakeaways: boolean
  interactiveMap: boolean
  calendarSection: boolean

  // Regional Sections
  euSection: RegionalSection
  usSection: RegionalSection
  globalSection: RegionalSection

  // Additional Sections
  calendarMinutes: boolean
  keepAnEyeOn: boolean
  comingEvents: boolean

  // AI Generation Context
  previousGreeting: string
  customInstructions: string

  // AI Generated Content Storage
  generatedContent: GeneratedContent
}

/**
 * Complete bulletin data structure
 */
export interface BulletinData {
  theme: BulletinTheme
  articles: Article[]
  articlesByCountry: Record<string, Article[]>
  bulletinConfig?: BulletinConfig
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Parameters for fetching news from backend API
 */
export interface FetchNewsParams {
  query: string
  page: number
  limit: number
  type_id?: number
  jurisdiction_id?: number
  published_at_from?: string
  published_at_to?: string
  updated_at_from?: string
  updated_at_to?: string
}

/**
 * Request body for content generation
 */
export interface GenerateContentRequest {
  type: ContentGenerationType
  articles: Article[]
  region?: string
  currentDate?: string
  previousGreeting?: string
  customInstructions?: string
}

/**
 * Response from content generation API
 */
export interface GenerateContentResponse {
  content: string
  warning?: string
  error?: string
}

// ============================================================================
// ERROR HANDLING TYPES
// ============================================================================

/**
 * Detailed error information from backend
 */
export interface BackendErrorDetail {
  code: string
  message: string
  field?: string
}

/**
 * Structured backend error response
 */
export interface BackendError {
  code: HttpErrorCode
  message: string
  errors?: BackendErrorDetail[]
}

/**
 * Frontend validation error
 */
export interface ValidationError {
  field: string
  message: string
}

/**
 * Error information for UI display
 */
export interface ErrorInfo {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  borderColor: string
}

// ============================================================================
// FORM TYPES
// ============================================================================

/**
 * Bulletin form filter state
 */
export interface BulletinFormFilters {
  type_id: string
  jurisdiction_id: string
  published_at_from: string
  published_at_to: string
  updated_at_from: string
  updated_at_to: string
}


/**
 * Bulletin form submission data
 */
export interface BulletinFormData {
  theme: BulletinTheme
  query: string
  page: number
  limit: number
  type_id?: number
  jurisdiction_id?: number
  published_at_from?: string
  published_at_to?: string
  updated_at_from?: string
  updated_at_to?: string
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

/**
 * Props for BulletinForm component
 */
export interface BulletinFormProps {
  onGenerate: (filters: BulletinFormData) => void
  loading: boolean
  error: string | null
}

/**
 * Props for ArticleSelector component
 */
export interface ArticleSelectorProps {
  articles: Article[]
  theme: BulletinTheme
  onConfirm: (selectedArticles: Article[], bulletinConfig: BulletinConfig) => void
  onBack: () => void
}

/**
 * Props for BulletinOutput component
 */
export interface BulletinOutputProps {
  data: BulletinData
  onStartOver: () => void
}
