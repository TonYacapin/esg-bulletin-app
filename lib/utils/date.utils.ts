/**
 * Date utility functions for filtering and formatting
 */

export enum DateFilterType {
  LAST_WEEK = "last_week",
  LAST_TWO_WEEKS = "last_two_weeks",
  LAST_MONTH = "last_month",
}

export const DATE_FILTER_OPTIONS = {
  [DateFilterType.LAST_WEEK]: {
    label: "For Last 1 Week",
    days: 7,
  },
  [DateFilterType.LAST_TWO_WEEKS]: {
    label: "For Last 2 Weeks",
    days: 14,
  },
  [DateFilterType.LAST_MONTH]: {
    label: "For Last Month",
    days: 30,
  },
} as const

/**
 * Calculate date range based on filter type
 * @param filterType - The date filter type
 * @returns Object with fromDate and toDate in ISO format
 */
export function getDateRange(filterType: DateFilterType): { fromDate: string; toDate: string } {
  const today = new Date()
  const days = DATE_FILTER_OPTIONS[filterType].days

  const fromDate = new Date(today)
  fromDate.setDate(fromDate.getDate() - days)

  return {
    fromDate: fromDate.toISOString().split("T")[0],
    toDate: today.toISOString().split("T")[0],
  }
}

/**
 * Format date to readable string (e.g., "October 2025")
 */
export function formatDateToMonthYear(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" })
  } catch {
    return dateString
  }
}

/**
 * Format date to readable string (e.g., "October 15, 2025")
 */
export function formatDateFull(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  } catch {
    return dateString
  }
}
