/**
 * Error Handler Utility
 * Centralized error handling and logging for the application
 * Provides consistent error formatting and recovery strategies
 */

import type { HttpErrorCode } from "@/lib/types"

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    public code: HttpErrorCode | number,
    message: string,
    public details?: Record<string, any>,
  ) {
    super(message)
    this.name = "AppError"
  }
}

/**
 * Determines if an error is recoverable
 * @param error - Error to check
 * @returns True if error is recoverable
 */
export function isRecoverableError(error: unknown): boolean {
  if (error instanceof AppError) {
    // Recoverable errors: client errors, rate limiting, temporary server issues
    return [400, 401, 403, 404, 422, 429, 503].includes(error.code as number)
  }
  return false
}

/**
 * Determines if an error is a network error
 * @param error - Error to check
 * @returns True if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return error.message.includes("fetch") || error.message.includes("network")
  }
  return false
}

/**
 * Formats error for logging
 * @param error - Error to format
 * @returns Formatted error object
 */
export function formatErrorForLogging(error: unknown) {
  if (error instanceof AppError) {
    return {
      type: "AppError",
      code: error.code,
      message: error.message,
      details: error.details,
      stack: error.stack,
    }
  }

  if (error instanceof Error) {
    return {
      type: error.name,
      message: error.message,
      stack: error.stack,
    }
  }

  return {
    type: "Unknown",
    message: String(error),
  }
}

/**
 * Gets user-friendly error message
 * @param error - Error to format
 * @returns User-friendly error message
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    switch (error.code) {
      case 400:
        return "Invalid request. Please check your input and try again."
      case 401:
        return "Authentication failed. Please check your credentials."
      case 403:
        return "You don't have permission to perform this action."
      case 404:
        return "The requested resource was not found."
      case 422:
        return "Validation failed. Please check the form for errors."
      case 429:
        return "Too many requests. Please wait a moment and try again."
      case 500:
        return "An unexpected error occurred. Please try again later."
      case 503:
        return "The service is temporarily unavailable. Please try again later."
      default:
        return error.message || "An unexpected error occurred."
    }
  }

  if (isNetworkError(error)) {
    return "Network error. Please check your connection and try again."
  }

  if (error instanceof Error) {
    return error.message || "An unexpected error occurred."
  }

  return "An unexpected error occurred. Please try again."
}

/**
 * Logs error with context
 * @param context - Context where error occurred
 * @param error - Error to log
 * @param additionalInfo - Additional information to log
 */
export function logError(context: string, error: unknown, additionalInfo?: Record<string, any>) {
  const formatted = formatErrorForLogging(error)
  console.error(`[${context}] Error:`, formatted, additionalInfo)
}

/**
 * Handles API error response
 * @param response - Fetch response
 * @returns Parsed error or generic error
 */
export async function handleApiError(response: Response): Promise<AppError> {
  try {
    const data = await response.json()

    if (data.errors && Array.isArray(data.errors)) {
      return new AppError(response.status as HttpErrorCode, data.message || "API Error", {
        errors: data.errors,
      })
    }

    return new AppError(response.status as HttpErrorCode, data.message || "API Error")
  } catch {
    return new AppError(response.status as HttpErrorCode, `HTTP ${response.status} Error`)
  }
}

/**
 * Retries an async operation with exponential backoff
 * @param operation - Async operation to retry
 * @param maxRetries - Maximum number of retries
 * @param delayMs - Initial delay in milliseconds
 * @returns Result of operation
 */
export async function retryWithBackoff<T>(operation: () => Promise<T>, maxRetries = 3, delayMs = 1000): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < maxRetries) {
        const delay = delayMs * Math.pow(2, attempt)
        console.log(`[retryWithBackoff] Attempt ${attempt + 1} failed, retrying in ${delay}ms`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error("Operation failed after retries")
}
