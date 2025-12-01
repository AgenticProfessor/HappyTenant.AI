import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware - Currently passes all requests through
 * Authentication has been temporarily disabled
 */
export function middleware(request: NextRequest) {
  // Simply pass all requests through without authentication
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
