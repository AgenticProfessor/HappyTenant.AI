import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const onboardingSchema = z.object({
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  organizationType: z.enum(['individual', 'company']).default('individual'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get the authenticated Supabase user
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !supabaseUser) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to complete onboarding' },
        { status: 401 }
      )
    }

    // Check if user already exists in database
    const existingUser = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Already onboarded', message: 'You have already completed onboarding' },
        { status: 400 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = onboardingSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { organizationName, organizationType, firstName, lastName } = validationResult.data

    // Create Organization and User in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug: organizationName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          type: organizationType === 'company' ? 'COMPANY' : 'INDIVIDUAL',
          subscriptionTier: 'FREE',
        },
      })

      // Create the user linked to the organization
      const user = await tx.user.create({
        data: {
          supabaseId: supabaseUser.id,
          email: supabaseUser.email!,
          firstName,
          lastName,
          avatarUrl: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || null,
          organizationId: organization.id,
          role: 'OWNER',
          isActive: true,
        },
      })

      return { organization, user }
    })

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      organizationId: result.organization.id,
      userId: result.user.id,
    }, { status: 201 })

  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to complete onboarding' },
      { status: 500 }
    )
  }
}
