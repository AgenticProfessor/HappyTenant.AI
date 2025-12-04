import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Get the redirect path from query params, default to dashboard
  const next = searchParams.get('next') ?? searchParams.get('redirect') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Successfully exchanged code for session
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Check if user exists in our database (completed onboarding)
        const { data: existingUser } = await supabase
          .from('User')
          .select('id, organizationId')
          .eq('supabaseId', user.id)
          .single()

        if (!existingUser) {
          // New user - needs to complete onboarding
          // The onboarding flow will create User + Organization together
          return NextResponse.redirect(`${origin}/onboarding`)
        }

        // Existing user with organization - redirect to intended destination
        return NextResponse.redirect(`${origin}${next}`)
      }
    }

    // Log the error for debugging (in production, use proper logging)
    console.error('Auth callback error:', error?.message)
  }

  // Return to sign-in page with error
  const errorUrl = new URL('/sign-in', origin)
  errorUrl.searchParams.set('error', 'auth_callback_failed')
  return NextResponse.redirect(errorUrl)
}
