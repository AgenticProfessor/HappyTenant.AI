import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define route matchers
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/privacy',
  '/terms',
])

const isTenantRoute = createRouteMatcher([
  '/tenant(.*)',
  '/api/tenant(.*)',
])

const isDashboardRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/properties(.*)',
  '/api/tenants(.*)',
  '/api/leases(.*)',
  '/api/payments(.*)',
  '/api/maintenance(.*)',
  '/api/messages(.*)',
  '/api/documents(.*)',
  '/api/reports(.*)',
  '/api/vendors(.*)',
  '/api/charges(.*)',
  '/api/audit-logs(.*)',
  '/api/steward(.*)',
  '/api/intelligence(.*)',
])

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { userId, sessionClaims } = await auth()
  const path = request.nextUrl.pathname

  // Allow public routes
  if (isPublicRoute(request)) {
    return NextResponse.next()
  }

  // Require authentication for protected routes
  if (!userId) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('redirect_url', path)
    return NextResponse.redirect(signInUrl)
  }

  // Get user role from session claims (set during Clerk user creation)
  const userRole = sessionClaims?.role as string | undefined

  // Route protection based on role
  if (isTenantRoute(request)) {
    // Tenant routes - check if user is a tenant
    if (userRole === 'landlord' || userRole === 'staff') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  if (isDashboardRoute(request)) {
    // Dashboard routes - check if user is landlord/staff
    if (userRole === 'tenant') {
      return NextResponse.redirect(new URL('/tenant', request.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
