/**
 * API Error Handling Utilities
 * Standardized error responses and request validation
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Custom API Error class with status code and error code
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Validation Error - thrown when Zod validation fails
 */
export class ValidationError extends ApiError {
  constructor(issues: z.ZodIssue[]) {
    super('Validation failed', 400, 'VALIDATION_ERROR', issues);
    this.name = 'ValidationError';
  }
}

/**
 * Standard error response format
 */
interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

/**
 * Create a standardized error response
 */
export function errorResponse(
  error: ApiError | Error | unknown,
  fallbackStatus: number = 500
): NextResponse<ErrorResponse> {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.status }
    );
  }

  if (error instanceof Error) {
    console.error('Unhandled error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: fallbackStatus }
    );
  }

  console.error('Unknown error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: fallbackStatus }
  );
}

/**
 * Validate request body against a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @param body - Request body to validate
 * @returns Validated and typed data
 * @throws ValidationError if validation fails
 */
export function validateBody<T extends z.ZodSchema>(
  schema: T,
  body: unknown
): z.infer<T> {
  const result = schema.safeParse(body);

  if (!result.success) {
    throw new ValidationError(result.error.issues);
  }

  return result.data;
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T extends z.ZodSchema>(
  schema: T,
  searchParams: URLSearchParams
): z.infer<T> {
  const params: Record<string, string | string[]> = {};

  searchParams.forEach((value, key) => {
    if (params[key]) {
      // Handle multiple values for same key
      const existing = params[key];
      params[key] = Array.isArray(existing)
        ? [...existing, value]
        : [existing, value];
    } else {
      params[key] = value;
    }
  });

  const result = schema.safeParse(params);

  if (!result.success) {
    throw new ValidationError(result.error.issues);
  }

  return result.data;
}

/**
 * Standard success response helpers
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse<T> {
  return NextResponse.json(data, { status });
}

export function createdResponse<T>(data: T): NextResponse<T> {
  return NextResponse.json(data, { status: 201 });
}

export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Wrap an async handler with error handling
 * Catches all errors and returns standardized error responses
 */
export function withErrorHandling<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ErrorResponse>> {
  return handler().catch((error) => errorResponse(error));
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // UUID/CUID validation
  id: z.string().min(1, 'ID is required'),

  // Date validation
  date: z.string().datetime({ message: 'Invalid date format' }),
  dateOptional: z.string().datetime().optional(),

  // Pagination
  pagination: z.object({
    limit: z.coerce.number().min(1).max(100).default(50),
    offset: z.coerce.number().min(0).default(0),
  }),

  // Common filters
  status: z.string().optional(),
  search: z.string().optional(),

  // Date range
  dateRange: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }),
};
