/**
 * Pagination Utilities
 * Standardized pagination with security limits
 */

/**
 * Pagination parameters
 */
export interface PaginationParams {
  take: number;
  skip: number;
}

/**
 * Paginated response metadata
 */
export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  totalPages: number;
  currentPage: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Default and maximum pagination limits
 */
const PAGINATION_DEFAULTS = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
  DEFAULT_OFFSET: 0,
} as const;

/**
 * Extract and validate pagination parameters from search params
 * Enforces maximum limits to prevent excessive data fetching
 *
 * @param searchParams - URL search parameters
 * @returns Validated pagination params for Prisma
 */
export function getPaginationParams(searchParams: URLSearchParams): PaginationParams {
  const limitParam = searchParams.get('limit');
  const offsetParam = searchParams.get('offset');

  // Parse and clamp limit
  let limit = limitParam
    ? parseInt(limitParam, 10)
    : PAGINATION_DEFAULTS.DEFAULT_LIMIT;

  if (isNaN(limit) || limit < PAGINATION_DEFAULTS.MIN_LIMIT) {
    limit = PAGINATION_DEFAULTS.DEFAULT_LIMIT;
  } else if (limit > PAGINATION_DEFAULTS.MAX_LIMIT) {
    limit = PAGINATION_DEFAULTS.MAX_LIMIT;
  }

  // Parse and validate offset
  let offset = offsetParam
    ? parseInt(offsetParam, 10)
    : PAGINATION_DEFAULTS.DEFAULT_OFFSET;

  if (isNaN(offset) || offset < 0) {
    offset = PAGINATION_DEFAULTS.DEFAULT_OFFSET;
  }

  return {
    take: limit,
    skip: offset,
  };
}

/**
 * Create pagination metadata from query results
 *
 * @param total - Total count of items
 * @param params - Pagination params used in query
 * @returns Pagination metadata for response
 */
export function createPaginationMeta(
  total: number,
  params: PaginationParams
): PaginationMeta {
  const totalPages = Math.ceil(total / params.take);
  const currentPage = Math.floor(params.skip / params.take) + 1;

  return {
    total,
    limit: params.take,
    offset: params.skip,
    hasMore: params.skip + params.take < total,
    totalPages,
    currentPage,
  };
}

/**
 * Create a paginated response
 *
 * @param data - Array of items
 * @param total - Total count of items
 * @param params - Pagination params used
 * @returns Paginated response with data and metadata
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  return {
    data,
    pagination: createPaginationMeta(total, params),
  };
}

/**
 * Get sort parameters from search params
 *
 * @param searchParams - URL search parameters
 * @param allowedFields - Array of allowed sort fields
 * @param defaultField - Default field to sort by
 * @param defaultDirection - Default sort direction
 * @returns Prisma orderBy object
 */
export function getSortParams(
  searchParams: URLSearchParams,
  allowedFields: string[],
  defaultField: string = 'createdAt',
  defaultDirection: 'asc' | 'desc' = 'desc'
): Record<string, 'asc' | 'desc'> {
  const sortBy = searchParams.get('sortBy') || defaultField;
  const sortDir = searchParams.get('sortDir') || defaultDirection;

  // Validate sort field
  const field = allowedFields.includes(sortBy) ? sortBy : defaultField;

  // Validate sort direction
  const direction = sortDir === 'asc' ? 'asc' : 'desc';

  return { [field]: direction };
}

/**
 * Parse filter parameters with type safety
 */
export function getFilterParams<T extends Record<string, string>>(
  searchParams: URLSearchParams,
  allowedFilters: (keyof T)[]
): Partial<T> {
  const filters: Partial<T> = {};

  for (const key of allowedFilters) {
    const value = searchParams.get(key as string);
    if (value) {
      (filters as Record<string, string>)[key as string] = value;
    }
  }

  return filters;
}
