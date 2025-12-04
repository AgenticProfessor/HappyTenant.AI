import { createClient } from './server'
import { NextResponse } from 'next/server'

export interface AuthenticatedUser {
  id: string           // Database User ID
  supabaseId: string   // Supabase Auth ID
  email: string
  organizationId: string | null
  role: string
  firstName: string | null
  lastName: string | null
}

export interface ApiClientResult {
  supabase: Awaited<ReturnType<typeof createClient>>
  user: AuthenticatedUser | null
  organizationId: string | null
  error: NextResponse | null
}

/**
 * Create an authenticated Supabase client for API routes.
 * Returns the client, user info, and organizationId.
 *
 * Usage:
 * ```typescript
 * export async function GET() {
 *   const { supabase, user, organizationId, error } = await createApiClient()
 *   if (error) return error
 *
 *   const { data } = await supabase.from('Property').select('*')
 *   return Response.json(data)
 * }
 * ```
 */
export async function createApiClient(): Promise<ApiClientResult> {
  const supabase = await createClient()

  // Get the authenticated user from Supabase Auth
  const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser()

  if (authError || !supabaseUser) {
    return {
      supabase,
      user: null,
      organizationId: null,
      error: NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to access this resource' },
        { status: 401 }
      ),
    }
  }

  // Look up the user in our database
  const { data: dbUser, error: dbError } = await supabase
    .from('User')
    .select('id, supabaseId, email, organizationId, role, firstName, lastName')
    .eq('supabaseId', supabaseUser.id)
    .single()

  if (dbError || !dbUser) {
    // User exists in Supabase Auth but not in our database
    // This means they haven't completed onboarding
    return {
      supabase,
      user: null,
      organizationId: null,
      error: NextResponse.json(
        { error: 'Onboarding required', message: 'Please complete your account setup' },
        { status: 403 }
      ),
    }
  }

  return {
    supabase,
    user: {
      id: dbUser.id,
      supabaseId: dbUser.supabaseId,
      email: dbUser.email,
      organizationId: dbUser.organizationId,
      role: dbUser.role,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
    },
    organizationId: dbUser.organizationId,
    error: null,
  }
}

/**
 * Require authentication - returns error response if not authenticated.
 * Use when ALL methods in a route require auth.
 */
export async function requireAuth() {
  const result = await createApiClient()
  if (result.error) {
    return { ...result, authenticated: false as const }
  }
  return { ...result, authenticated: true as const, user: result.user! }
}

/**
 * Create error response helper
 */
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Create success response helper
 */
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status })
}

/**
 * Create created response helper (201)
 */
export function createdResponse<T>(data: T) {
  return NextResponse.json(data, { status: 201 })
}
