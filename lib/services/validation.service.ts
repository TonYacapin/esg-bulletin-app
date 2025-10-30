/**
 * Validation Service
 * Centralized validation logic for forms and API requests
 * Provides reusable validation functions with clear error messages
 */

import type { BulletinFormData, ValidationError } from "@/lib/types"

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

const VALIDATION_RULES = {
  QUERY_MAX_LENGTH: 500,
  PAGE_MIN: 1,
  PAGE_MAX: 1000,
  LIMIT_MIN: 1,
  LIMIT_MAX: 500,
} as const

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates theme selection
 * @param theme - Selected theme
 * @returns Validation error if invalid, null if valid
 */
export function validateTheme(theme: string | null | undefined): ValidationError | null {
  if (!theme || !["blue", "green", "red"].includes(theme)) {
    return {
      field: "theme",
      message: "Please select a valid theme for your bulletin",
    }
  }
  return null
}

/**
 * Validates search query (optional)
 * @param query - Search query string
 * @returns Validation error if invalid, null if valid
 */
export function validateQuery(query: string | undefined): ValidationError | null {
  // Query is optional, so if undefined or empty, it's valid
  if (!query) return null

  const trimmed = query.trim()

  // If query is provided, validate length
  if (trimmed.length > VALIDATION_RULES.QUERY_MAX_LENGTH) {
    return {
      field: "query",
      message: `Search query is too long. Maximum ${VALIDATION_RULES.QUERY_MAX_LENGTH} characters allowed.`,
    }
  }

  return null
}

/**
 * Validates page number
 * @param page - Page number
 * @returns Validation error if invalid, null if valid
 */
export function validatePage(page: number): ValidationError | null {
  if (page < VALIDATION_RULES.PAGE_MIN) {
    return {
      field: "page",
      message: `Page number must be at least ${VALIDATION_RULES.PAGE_MIN}`,
    }
  }

  if (page > VALIDATION_RULES.PAGE_MAX) {
    return {
      field: "page",
      message: `Page number cannot exceed ${VALIDATION_RULES.PAGE_MAX}`,
    }
  }

  return null
}

/**
 * Validates results limit
 * @param limit - Results limit
 * @returns Validation error if invalid, null if valid
 */
export function validateLimit(limit: number): ValidationError | null {
  if (limit < VALIDATION_RULES.LIMIT_MIN) {
    return {
      field: "limit",
      message: `Results limit must be at least ${VALIDATION_RULES.LIMIT_MIN}`,
    }
  }

  if (limit > VALIDATION_RULES.LIMIT_MAX) {
    return {
      field: "limit",
      message: `Results limit cannot exceed ${VALIDATION_RULES.LIMIT_MAX}`,
    }
  }

  return null
}

/**
 * Validates type_id
 * @param type_id - Type ID number
 * @returns Validation error if invalid, null if valid
 */
export function validateTypeId(type_id: number | undefined): ValidationError | null {
  if (!type_id) {
    return {
      field: "type_id",
      message: "Content type is required",
    }
  }

  const validTypeIds = [1, 2, 3, 4, 5] // Generic, Disclosure, Regulatory, Litigation, Enforcement Action
  if (!validTypeIds.includes(type_id)) {
    return {
      field: "type_id",
      message: "Please select a valid content type",
    }
  }

  return null
}

/**
 * Validates date range
 * @param fromDate - From date string
 * @param toDate - To date string
 * @param fieldPrefix - Field name prefix for error messages
 * @returns Validation error if invalid, null if valid
 */
export function validateDateRange(fromDate: string | undefined, toDate: string | undefined, fieldPrefix: string): ValidationError | null {
  if (!fromDate || !toDate) return null

  const from = new Date(fromDate)
  const to = new Date(toDate)

  if (isNaN(from.getTime())) {
    return {
      field: `${fieldPrefix}_from`,
      message: `${fieldPrefix} 'From' date is invalid`,
    }
  }

  if (isNaN(to.getTime())) {
    return {
      field: `${fieldPrefix}_to`,
      message: `${fieldPrefix} 'To' date is invalid`,
    }
  }

  if (from > to) {
    return {
      field: `${fieldPrefix}_from`,
      message: `${fieldPrefix} 'From' date cannot be after 'To' date`,
    }
  }

  return null
}

/**
 * Validates that date is not in the future
 * @param dateString - Date string to validate
 * @param fieldName - Field name for error messages
 * @returns Validation error if invalid, null if valid
 */
export function validateNotFutureDate(dateString: string | undefined, fieldName: string): ValidationError | null {
  if (!dateString) return null

  const date = new Date(dateString)
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  if (isNaN(date.getTime())) {
    return {
      field: fieldName,
      message: `${fieldName} date is invalid`,
    }
  }

  if (date > today) {
    return {
      field: fieldName,
      message: `${fieldName} date cannot be in the future`,
    }
  }

  return null
}

/**
 * Validates select field ID
 * @param value - Select value
 * @param fieldName - Field name for error messages
 * @returns Validation error if invalid, null if valid
 */
export function validateSelectId(value: string, fieldName: string): ValidationError | null {
  if (value === "all") return null

  const id = Number.parseInt(value)
  if (isNaN(id) || id < 1) {
    return {
      field: fieldName,
      message: `Invalid ${fieldName} selected`,
    }
  }

  return null
}

/**
 * Validates complete bulletin form data
 * @param data - Form data to validate
 * @returns Array of validation errors
 */
export function validateBulletinForm(data: BulletinFormData): ValidationError[] {
  const errors: ValidationError[] = []

  // Theme validation
  const themeError = validateTheme(data.theme)
  if (themeError) errors.push(themeError)

  // Query validation (now optional - only validate length if provided)
  const queryError = validateQuery(data.query)
  if (queryError) errors.push(queryError)

  // Page validation
  const pageError = validatePage(data.page)
  if (pageError) errors.push(pageError)

  // Limit validation
  const limitError = validateLimit(data.limit)
  if (limitError) errors.push(limitError)

  // Type ID validation (now required)
  const typeIdError = validateTypeId(data.type_id)
  if (typeIdError) errors.push(typeIdError)

  // Date range validations
  if (data.published_at_from && data.published_at_to) {
    const dateError = validateDateRange(data.published_at_from, data.published_at_to, "Published")
    if (dateError) errors.push(dateError)
  }

  if (data.updated_at_from && data.updated_at_to) {
    const dateError = validateDateRange(data.updated_at_from, data.updated_at_to, "Updated")
    if (dateError) errors.push(dateError)
  }

  // Future date validations
  const dateFields = [
    { value: data.published_at_from, name: "published_at_from" },
    { value: data.published_at_to, name: "published_at_to" },
    { value: data.updated_at_from, name: "updated_at_from" },
    { value: data.updated_at_to, name: "updated_at_to" },
  ]

  for (const { value, name } of dateFields) {
    if (value) {
      const futureError = validateNotFutureDate(value, name)
      if (futureError) errors.push(futureError)
    }
  }

  // Jurisdiction ID validation (optional)
  if (data.jurisdiction_id) {
    const jurisdictionError = validateSelectId(data.jurisdiction_id.toString(), "jurisdiction_id")
    if (jurisdictionError) errors.push(jurisdictionError)
  }

  return errors
}

/**
 * Checks if there are any validation errors
 * @param errors - Array of validation errors
 * @returns True if there are errors, false otherwise
 */
export function hasValidationErrors(errors: ValidationError[]): boolean {
  return errors.length > 0
}

/**
 * Gets error message for a specific field
 * @param errors - Array of validation errors
 * @param fieldName - Field name to search for
 * @returns Error message or null if no error for field
 */
export function getFieldError(errors: ValidationError[], fieldName: string): string | null {
  return errors.find((error) => error.field === fieldName)?.message || null
}