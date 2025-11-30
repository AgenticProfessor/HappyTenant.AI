import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for updating a charge
const chargeUpdateSchema = z.object({
  description: z.string().min(1).optional(),
  amount: z.number().min(0).optional(),
  dueDate: z.string().optional(),
  status: z.enum(['PENDING', 'DUE', 'PARTIAL', 'PAID', 'WAIVED', 'VOID']).optional(),
  notes: z.string().optional(),
})

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET /api/charges/[id] - Get a single charge with payment history
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    const { id } = await params

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

    const charge = await prisma.charge.findFirst({
      where: {
        id,
        lease: {
          unit: {
            property: {
              organizationId: user.organizationId,
            },
          },
        },
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
        tenant: true,
        paymentAllocations: {
          include: {
            payment: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!charge) {
      return NextResponse.json({ error: 'Charge not found' }, { status: 404 })
    }

    // Calculate payment summary
    const totalAllocated = charge.paymentAllocations.reduce(
      (sum, pa) => sum + Number(pa.amount),
      0
    )
    const remainingBalance = Number(charge.amount) - totalAllocated

    return NextResponse.json({
      charge,
      paymentSummary: {
        totalAmount: Number(charge.amount),
        totalAllocated,
        remainingBalance,
        isFullyPaid: remainingBalance <= 0,
        paymentCount: charge.paymentAllocations.length,
      },
    })
  } catch (error) {
    console.error('Error fetching charge:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/charges/[id] - Update a charge
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    const { id } = await params

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

    // Check if charge exists and belongs to user's organization
    const existingCharge = await prisma.charge.findFirst({
      where: {
        id,
        lease: {
          unit: {
            property: {
              organizationId: user.organizationId,
            },
          },
        },
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
        paymentAllocations: true,
      },
    })

    if (!existingCharge) {
      return NextResponse.json({ error: 'Charge not found' }, { status: 404 })
    }

    // Don't allow modifying paid charges
    if (existingCharge.status === 'PAID' && existingCharge.paymentAllocations.length > 0) {
      return NextResponse.json(
        { error: 'Cannot modify a fully paid charge' },
        { status: 400 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = chargeUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Update charge
    const charge = await prisma.charge.update({
      where: { id },
      data: {
        ...(data.description && { description: data.description }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
        tenant: true,
        paymentAllocations: {
          include: {
            payment: true,
          },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: 'UPDATE',
        entityType: 'charge',
        entityId: charge.id,
        description: `Updated charge for ${existingCharge.lease.unit.unitNumber}${data.status ? ` - Status: ${data.status}` : ''}`,
        previousValues: JSON.parse(JSON.stringify(existingCharge)),
        newValues: JSON.parse(JSON.stringify(charge)),
      },
    })

    return NextResponse.json({ charge })
  } catch (error) {
    console.error('Error updating charge:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/charges/[id] - Delete a charge (only if no payments)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    const { id } = await params

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

    // Check if charge exists and belongs to user's organization
    const existingCharge = await prisma.charge.findFirst({
      where: {
        id,
        lease: {
          unit: {
            property: {
              organizationId: user.organizationId,
            },
          },
        },
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
        paymentAllocations: true,
      },
    })

    if (!existingCharge) {
      return NextResponse.json({ error: 'Charge not found' }, { status: 404 })
    }

    // Don't allow deleting charges with payments - void instead
    if (existingCharge.paymentAllocations.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete charge with payments. Use VOID status instead.' },
        { status: 400 }
      )
    }

    // Delete charge
    await prisma.charge.delete({
      where: { id },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: 'DELETE',
        entityType: 'charge',
        entityId: id,
        description: `Deleted ${existingCharge.type} charge for ${existingCharge.lease.unit.unitNumber}`,
        previousValues: JSON.parse(JSON.stringify(existingCharge)),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting charge:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
