'use server'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/applications/public/[token] - Get application link info for public form
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const applicationLink = await prisma.applicationLink.findUnique({
      where: { token },
      include: {
        unit: {
          include: {
            property: {
              include: {
                organization: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!applicationLink) {
      return NextResponse.json(
        { error: 'Application link not found' },
        { status: 404 }
      )
    }

    // Check if link is active
    if (!applicationLink.isActive) {
      return NextResponse.json(
        { error: 'This application link is no longer active' },
        { status: 410 }
      )
    }

    // Check if link has expired
    if (applicationLink.expiresAt && new Date() > applicationLink.expiresAt) {
      return NextResponse.json(
        { error: 'This application link has expired' },
        { status: 410 }
      )
    }

    // Check if max applications reached
    if (
      applicationLink.maxApplications &&
      applicationLink.applicationsReceived >= applicationLink.maxApplications
    ) {
      return NextResponse.json(
        { error: 'Maximum applications have been received for this listing' },
        { status: 410 }
      )
    }

    // Get organization name - from unit's property or fetch separately for org-wide links
    let organizationName = 'Unknown Organization'
    if (applicationLink.unit?.property?.organization) {
      organizationName = applicationLink.unit.property.organization.name
    } else {
      // Org-wide link without unit - fetch organization separately
      const org = await prisma.organization.findUnique({
        where: { id: applicationLink.organizationId },
        select: { name: true },
      })
      if (org) {
        organizationName = org.name
      }
    }

    // Return public-safe information
    const publicInfo = {
      id: applicationLink.id,
      name: applicationLink.name,
      applicationFee: applicationLink.applicationFee
        ? Number(applicationLink.applicationFee)
        : null,
      collectFeeOnline: applicationLink.collectFeeOnline,
      requiredDocuments: applicationLink.requiredDocuments,
      customQuestions: applicationLink.customQuestions,
      organization: {
        name: organizationName,
      },
      unit: applicationLink.unit
        ? {
            id: applicationLink.unit.id,
            unitNumber: applicationLink.unit.unitNumber,
            bedrooms: applicationLink.unit.bedrooms,
            bathrooms: Number(applicationLink.unit.bathrooms),
            squareFeet: applicationLink.unit.squareFeet,
            rent: Number(applicationLink.unit.marketRent),
            property: {
              name: applicationLink.unit.property.name,
              address: applicationLink.unit.property.addressLine1 +
                (applicationLink.unit.property.addressLine2
                  ? ', ' + applicationLink.unit.property.addressLine2
                  : ''),
              city: applicationLink.unit.property.city,
              state: applicationLink.unit.property.state,
              zipCode: applicationLink.unit.property.postalCode,
            },
          }
        : null,
    }

    return NextResponse.json(publicInfo)
  } catch (error) {
    console.error('Error fetching application link:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application link' },
      { status: 500 }
    )
  }
}
