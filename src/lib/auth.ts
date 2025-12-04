import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

interface AuthResult {
  userId: string | null
  supabaseUserId: string | null
  organizationId: string | null
  sessionId: string | null
  getToken: () => Promise<string | null>
}

/**
 * Get the current authenticated user from Supabase Auth.
 * Returns user info including database userId and organizationId.
 *
 * For new Supabase-based routes, prefer using `createApiClient()` from '@/lib/supabase/api'
 * which provides the Supabase client directly.
 *
 * This function maintains backwards compatibility with existing Prisma-based routes.
 */
export async function auth(): Promise<AuthResult> {
  try {
    const supabase = await createClient()

    // Get the authenticated user from Supabase Auth
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !supabaseUser) {
      return {
        userId: null,
        supabaseUserId: null,
        organizationId: null,
        sessionId: null,
        getToken: async () => null,
      }
    }

    // Look up the user in our database by supabaseId
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true, organizationId: true },
    })

    if (!dbUser) {
      // User exists in Supabase Auth but not in our database
      // They need to complete onboarding
      return {
        userId: null,
        supabaseUserId: supabaseUser.id,
        organizationId: null,
        sessionId: supabaseUser.id,
        getToken: async () => {
          const { data } = await supabase.auth.getSession()
          return data.session?.access_token ?? null
        },
      }
    }

    return {
      userId: dbUser.id,
      supabaseUserId: supabaseUser.id,
      organizationId: dbUser.organizationId,
      sessionId: supabaseUser.id,
      getToken: async () => {
        const { data } = await supabase.auth.getSession()
        return data.session?.access_token ?? null
      },
    }
  } catch (error) {
    console.error('Auth error:', error)
    return {
      userId: null,
      supabaseUserId: null,
      organizationId: null,
      sessionId: null,
      getToken: async () => null,
    }
  }
}

/**
 * Get the current user with full details (for API routes that need user info)
 */
export async function getCurrentUser() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  return prisma.user.findUnique({
    where: { id: userId },
    include: { organization: true },
  })
}
