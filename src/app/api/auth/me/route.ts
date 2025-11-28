import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user with their organization from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: true,
      },
    })

    if (!user) {
      // User doesn't exist in our database yet (webhook might not have fired)
      return NextResponse.json({
        user: null,
        organization: null,
        message: 'User not found in database'
      }, { status: 200 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        isActive: user.isActive,
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        slug: user.organization.slug,
        type: user.organization.type,
        subscriptionTier: user.organization.subscriptionTier,
      },
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
