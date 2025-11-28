import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for creating an application
const applicationSchema = z.object({
  unitId: z.string().min(1, 'Unit is required'),
  // Personal Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  dateOfBirth: z.string().optional(),
  ssn: z.string().optional(), // Will be encrypted
  driversLicense: z.string().optional(),
  driversLicenseState: z.string().optional(),

  // Current Address
  currentAddress: z.string().optional(),
  currentCity: z.string().optional(),
  currentState: z.string().optional(),
  currentZip: z.string().optional(),
  currentLandlordName: z.string().optional(),
  currentLandlordPhone: z.string().optional(),
  currentRent: z.number().optional(),
  currentMoveInDate: z.string().optional(),
  reasonForMoving: z.string().optional(),

  // Employment
  employmentStatus: z.enum([
    'EMPLOYED_FULL_TIME',
    'EMPLOYED_PART_TIME',
    'SELF_EMPLOYED',
    'UNEMPLOYED',
    'RETIRED',
    'STUDENT',
    'OTHER'
  ]).optional(),
  employerName: z.string().optional(),
  employerPhone: z.string().optional(),
  employerAddress: z.string().optional(),
  jobTitle: z.string().optional(),
  monthlyIncome: z.number().optional(),
  additionalIncome: z.number().optional(),
  additionalIncomeSource: z.string().optional(),

  // Rental History
  rentalHistory: z.array(z.object({
    address: z.string(),
    landlordName: z.string().optional(),
    landlordPhone: z.string().optional(),
    rent: z.number().optional(),
    moveInDate: z.string().optional(),
    moveOutDate: z.string().optional(),
    reasonForLeaving: z.string().optional(),
  })).optional(),

  // Additional Occupants
  additionalOccupants: z.array(z.object({
    name: z.string(),
    relationship: z.string(),
    age: z.number().optional(),
    occupation: z.string().optional(),
  })).optional(),

  // Pets & Vehicles
  hasPets: z.boolean().default(false),
  pets: z.array(z.object({
    type: z.string(),
    breed: z.string().optional(),
    weight: z.number().optional(),
    age: z.number().optional(),
  })).optional(),
  hasVehicles: z.boolean().default(false),
  vehicles: z.array(z.object({
    make: z.string(),
    model: z.string(),
    year: z.number().optional(),
    color: z.string().optional(),
    licensePlate: z.string().optional(),
    state: z.string().optional(),
  })).optional(),

  // Emergency Contact
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),

  // References
  references: z.array(z.object({
    name: z.string(),
    relationship: z.string(),
    phone: z.string().optional(),
    email: z.string().optional(),
  })).optional(),

  // Screening Consent
  consentToBackgroundCheck: z.boolean().default(false),
  consentToCreditCheck: z.boolean().default(false),

  // Desired Move-in
  desiredMoveInDate: z.string().optional(),
  desiredLeaseTerm: z.number().optional(), // months

  // Additional
  howDidYouHear: z.string().optional(),
  additionalComments: z.string().optional(),
})

// GET /api/applications - List all applications for the organization
export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user with organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get query params for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const propertyId = searchParams.get('propertyId')
    const unitId = searchParams.get('unitId')
    const search = searchParams.get('search')

    // Build filter
    const where: Record<string, unknown> = {
      unit: {
        property: {
          organizationId: user.organizationId,
        },
      },
    }

    if (status) {
      where.status = status
    }

    if (unitId) {
      where.unitId = unitId
    } else if (propertyId) {
      where.unit = {
        ...where.unit as Record<string, unknown>,
        propertyId,
      }
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        unit: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                addressLine1: true,
                city: true,
                state: true,
              },
            },
          },
        },
        screeningResult: true,
      },
      orderBy: { submittedAt: 'desc' },
    })

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/applications - Create a new application (can be public for applicants)
export async function POST(request: Request) {
  try {
    // Check if this is an authenticated user or public submission
    const { userId } = await auth()

    // Parse and validate request body
    const body = await request.json()
    const validationResult = applicationSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Verify unit exists and is available
    const unit = await prisma.unit.findUnique({
      where: { id: data.unitId },
      include: {
        property: true,
      },
    })

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    // Check if unit is listed/available for applications
    if (!unit.isListed && unit.status !== 'VACANT' && unit.status !== 'UNDER_APPLICATION') {
      return NextResponse.json(
        { error: 'Unit is not accepting applications' },
        { status: 400 }
      )
    }

    // Check for duplicate application (same email for same unit within 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const existingApplication = await prisma.application.findFirst({
      where: {
        unitId: data.unitId,
        email: data.email,
        submittedAt: { gte: thirtyDaysAgo },
        status: { notIn: ['WITHDRAWN', 'DENIED'] },
      },
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'An application for this unit already exists' },
        { status: 400 }
      )
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        unitId: data.unitId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        ssn: data.ssn, // Should be encrypted in production
        driversLicense: data.driversLicense,
        driversLicenseState: data.driversLicenseState,
        currentAddress: data.currentAddress,
        currentCity: data.currentCity,
        currentState: data.currentState,
        currentZip: data.currentZip,
        currentLandlordName: data.currentLandlordName,
        currentLandlordPhone: data.currentLandlordPhone,
        currentRent: data.currentRent,
        currentMoveInDate: data.currentMoveInDate ? new Date(data.currentMoveInDate) : undefined,
        reasonForMoving: data.reasonForMoving,
        employmentStatus: data.employmentStatus,
        employerName: data.employerName,
        employerPhone: data.employerPhone,
        employerAddress: data.employerAddress,
        jobTitle: data.jobTitle,
        monthlyIncome: data.monthlyIncome,
        additionalIncome: data.additionalIncome,
        additionalIncomeSource: data.additionalIncomeSource,
        rentalHistory: data.rentalHistory,
        additionalOccupants: data.additionalOccupants,
        hasPets: data.hasPets,
        pets: data.pets,
        hasVehicles: data.hasVehicles,
        vehicles: data.vehicles,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        emergencyContactRelation: data.emergencyContactRelation,
        references: data.references,
        consentToBackgroundCheck: data.consentToBackgroundCheck,
        consentToCreditCheck: data.consentToCreditCheck,
        desiredMoveInDate: data.desiredMoveInDate ? new Date(data.desiredMoveInDate) : undefined,
        desiredLeaseTerm: data.desiredLeaseTerm,
        howDidYouHear: data.howDidYouHear,
        additionalComments: data.additionalComments,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
      },
    })

    // Update unit status to indicate it's under application
    if (unit.status === 'VACANT') {
      await prisma.unit.update({
        where: { id: data.unitId },
        data: { status: 'UNDER_APPLICATION' },
      })
    }

    // Create audit log if authenticated
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (user) {
        await prisma.auditLog.create({
          data: {
            organizationId: user.organizationId,
            userId: user.id,
            action: 'CREATE',
            entityType: 'application',
            entityId: application.id,
            description: `Application submitted for unit ${unit.unitNumber} at ${unit.property.name}`,
            newValues: JSON.parse(JSON.stringify(application)),
          },
        })
      }
    }

    return NextResponse.json({ application }, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
