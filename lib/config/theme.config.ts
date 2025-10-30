/**
 * Centralized theme configuration for the ESG Bulletin application
 * Defines all theme colors, styles, and semantic mappings
 */

export type ThemeType = "blue" | "green" | "red"

export const THEME_MAPPING: Record<
  ThemeType,
  {
    label: string
    description: string
    primary: string
    light: string
    border: string
    gradient: string
    hex: string
  }
> = {
  blue: {
    label: "Regulatory",
    description: "Focus on regulatory developments",
    primary: "#3B82F6",
    light: "bg-blue-50/50",
    border: "border-blue-100",
    gradient: "from-blue-500 to-blue-600",
    hex: "#1976D2",
  },
  green: {
    label: "Disclosure",
    description: "Focus on disclosure requirements",
    primary: "#10B981",
    light: "bg-emerald-50/50",
    border: "border-emerald-100",
    gradient: "from-emerald-500 to-emerald-600",
    hex: "#388E3C",
  },
  red: {
    label: "Litigation",
    description: "Focus on litigation risks",
    primary: "#EF4444",
    light: "bg-rose-50/50",
    border: "border-rose-100",
    gradient: "from-rose-500 to-rose-600",
    hex: "#D32F2F",
  },
} as const

/**
 * Maps theme type to type_value for API queries
 */
export const THEME_TO_TYPE_VALUE: Record<ThemeType, string> = {
  blue: "Regulatory",
  green: "Disclosure",
  red: "Litigation",
} as const

/**
 * Get theme configuration by type
 */
export function getThemeConfig(theme: ThemeType) {
  return THEME_MAPPING[theme]
}

/**
 * Get type_value for API query (case-insensitive)
 */
export function getTypeValueForTheme(theme: ThemeType): string {
  return THEME_TO_TYPE_VALUE[theme]
}
