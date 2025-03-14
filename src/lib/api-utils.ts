import { NextResponse } from 'next/server';

/**
 * Interface for API error responses
 */
export interface ApiErrorResponse {
  error: string;
  details?: string;
}

/**
 * Creates a standardized error response for API routes
 * @param message - The main error message
 * @param details - Optional detailed error information
 * @param status - HTTP status code (default: 500)
 * @returns NextResponse with standardized error format
 */
export function createErrorResponse(
  message: string,
  details?: string,
  status = 500
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: message,
      ...(details ? { details } : {}),
    },
    { status }
  );
}

/**
 * Handles common API errors and returns appropriate responses
 * @param error - The error object
 * @returns NextResponse with appropriate error message and status
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('API Error:', error);

  // Handle specific error types
  if (error instanceof Error) {
    // Check for specific error messages
    if (error.message.includes('API key')) {
      return createErrorResponse('API configuration error', 'Missing or invalid API key', 500);
    }

    if (error.message.includes('rate limit')) {
      return createErrorResponse(
        'Rate limit exceeded',
        'Too many requests, please try again later',
        429
      );
    }

    // Return the actual error message
    return createErrorResponse('Request failed', error.message);
  }

  // Generic error response
  return createErrorResponse('An unexpected error occurred');
}
