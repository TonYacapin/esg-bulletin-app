/**
 * Async Handler Utility
 * Provides safe async operation handling with error management
 * Useful for server actions and API routes
 */

import { logError } from "./error-handler"

/**
 * Wraps async operations with error handling
 * @param operation - Async operation to execute
 * @param context - Context for error logging
 * @returns Result or throws error
 */
export async function safeAsync<T>(operation: () => Promise<T>, context: string): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    logError(context, error)
    throw error
  }
}

/**
 * Wraps async operations with fallback value
 * @param operation - Async operation to execute
 * @param fallback - Fallback value if operation fails
 * @param context - Context for error logging
 * @returns Result or fallback value
 */
export async function safeAsyncWithFallback<T>(operation: () => Promise<T>, fallback: T, context: string): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    logError(context, error)
    return fallback
  }
}

/**
 * Wraps async operations with timeout
 * @param operation - Async operation to execute
 * @param timeoutMs - Timeout in milliseconds
 * @param context - Context for error logging
 * @returns Result or throws timeout error
 */
export async function safeAsyncWithTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  context: string,
): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await operation()
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Operation timed out after ${timeoutMs}ms`)
    }
    logError(context, error)
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}
