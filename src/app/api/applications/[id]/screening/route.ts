import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const screeningSchema = z.object({
  provider: z.enum(['Internal', 'TransUnion', 'Experian', 'Equifax', 'RentPrep', 'Other']),
  requestId: z.string().optional(),
  creditScore: z.number().min(300).max(850).optional().nullable(),
  criminalCheck: z.enum(['PENDING', 'PASS', 'FAIL', 'REVIEW_NEEDED', 'NOT_APPLICABLE']),
  evictionCheck: z.enum(['PENDING', 'PASS', 'FAIL', 'REVIEW_NEEDED', 'NOT_APPLICABLE']),
  incomeVerification: z.enum(['PENDING', 'PASS', 'FAIL', 'REVIEW_NEEDED', 'NOT_APPLICABLE']),
  overallResult: z.enum(['PENDING', 'PASS', 'FAIL', 'REVIEW_NEEDED', 'NOT_APPLICABLE']),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().nullable(),
  notes: z.string().optional(),
})

// GET /api/applications/[id]/screening - Get screening results
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get application and verify access
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        unit: {
          include: {
            property: {
              include: {
                organization: true,
              },
            },
          },
        },
        screeningResults: {
          orderBy: { requestedAt: 'desc' },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Verify user has access to this organization
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { organizationId: true },
    })

    if (!user || user.organizationId !== application.unit?.property?.organization?.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json(application.screeningResults)
  } catch (error) {
    console.error('Error fetching screening results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch screening results' },
      { status: 500 }
    )
  }
}

// POST /api/applications/[id]/screening - Create new screening result
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Validate input
    const validationResult = screeningSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Get application and verify access
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        unit: {
          include: {
            property: {
              include: {
                organization: true,
              },
            },
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Verify user has access to this organization
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { organizationId: true },
    })

    if (!user || user.organizationId !== application.unit?.property?.organization?.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if a tenant record exists for this application, or create one
    let tenantId = application.tenantId

    if (!tenantId) {
      // Create a temporary tenant record for screening purposes
      const tenant = await prisma.tenant.create({
        data: {
          organizationId: user.organizationId,
          firstName: application.firstName,
          lastName: application.lastName,
          email: application.email,
          phone: application.phone,
        },
      })
      tenantId = tenant.id

      // Link tenant to application
      await prisma.application.update({
        where: { id },
        data: { tenantId: tenant.id },
      })
    }

    // Create screening result
    const screeningResult = await prisma.screeningResult.create({
      data: {
        tenantId,
        applicationId: id,
        provider: data.provider,
        requestId: data.requestId,
        creditScore: data.creditScore,
        criminalCheck: data.criminalCheck,
        evictionCheck: data.evictionCheck,
        incomeVerification: data.incomeVerification,
        overallResult: data.overallResult,
        riskLevel: data.riskLevel,
        notes: data.notes,
        reviewedByUserId: session.userId,
        reviewedAt: new Date(),
        completedAt: new Date(),
      },
    })

    // Update application status to SCREENING_IN_PROGRESS if currently NEW or UNDER_REVIEW
    if (application.status === 'NEW' || application.status === 'UNDER_REVIEW') {
      await prisma.application.update({
        where: { id },
        data: { status: 'SCREENING_IN_PROGRESS' },
      })

      // Add status history
      await prisma.applicationStatusHistory.create({
        data: {
          applicationId: id,
          fromStatus: application.status,
          toStatus: 'SCREENING_IN_PROGRESS',
          changedByUserId: session.userId,
          reason: 'Screening results entered',
        },
      })
    }

    return NextResponse.json(screeningResult, { status: 201 })
  } catch (error) {
    console.error('Error creating screening result:', error)
    return NextResponse.json(
      { error: 'Failed to create screening result' },
      { status: 500 }
    )
  }
}
