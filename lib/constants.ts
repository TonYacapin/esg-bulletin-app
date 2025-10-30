/**
 * Application Constants
 * Centralized location for all application-wide constants
 */

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const API_CONFIG = {
  TIMEOUT_MS: 45000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
} as const

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION_RULES = {
  QUERY_MIN_LENGTH: 1,
  QUERY_MAX_LENGTH: 500,
  PAGE_MIN: 1,
  PAGE_MAX: 1000,
  LIMIT_MIN: 1,
  LIMIT_MAX: 500,
} as const

// ============================================================================
// CONTENT GENERATION
// ============================================================================

export const CONTENT_GENERATION = {
  MAX_ARTICLE_CHARACTERS: 6000,
  MIN_REMAINING_SPACE: 100,
  DEFAULT_MAX_ARTICLES: 5,
} as const

// ============================================================================
// UI CONFIGURATION
// ============================================================================

export const UI_CONFIG = {
  TOAST_DURATION_MS: 5000,
  ERROR_TOAST_DURATION_MS: 8000,
  ANIMATION_DURATION_MS: 200,
} as const

// ============================================================================
// THEME COLORS
// ============================================================================

export const THEME_COLORS = {
  blue: {
    primary: "#3B82F6",
    light: "bg-blue-50/50",
    border: "border-blue-100",
    gradient: "from-blue-500 to-blue-600",
  },
  green: {
    primary: "#10B981",
    light: "bg-emerald-50/50",
    border: "border-emerald-100",
    gradient: "from-emerald-500 to-emerald-600",
  },
  red: {
    primary: "#EF4444",
    light: "bg-rose-50/50",
    border: "border-rose-100",
    gradient: "from-rose-500 to-rose-600",
  },
} as const

// ============================================================================
// CONTENT TYPE LABELS
// ============================================================================

export const CONTENT_TYPE_LABELS = {
  1: "Regulation",
  2: "Disclosure",
  3: "Guidance",
} as const

// ============================================================================
// JURISDICTION LABELS
// ============================================================================

export const JURISDICTION_LABELS = {
  1: "Australia",
  2: "Singapore",
  3: "United States",
  4: "European Union",
  5: "World",
} as const
