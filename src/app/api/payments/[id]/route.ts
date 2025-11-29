import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for updating a payment
const paymentUpdateSchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED']).optional(),
  notes: z.string().optional(),
  refundReason: z.string().optional(),
})

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET /api/payments/[id] - Get a single payment with allocation details
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

    const payment = await prisma.payment.findFirst({
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
            charge: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Calculate allocation summary
    const totalAllocated = payment.paymentAllocations.reduce(
      (sum, pa) => sum + Number(pa.amount),
      0
    )
    const unallocatedAmount = Number(payment.amount) - totalAllocated

    return NextResponse.json({
      payment,
      allocationSummary: {
        totalAmount: Number(payment.amount),
        totalAllocated,
        unallocatedAmount,
        isFullyAllocated: unallocatedAmount <= 0,
        allocationCount: payment.paymentAllocations.length,
      },
    })
  } catch (error) {
    console.error('Error fetching payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/payments/[id] - Update a payment (status, notes)
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

    // Check if payment exists and belongs to user's organization
    const existingPayment = await prisma.payment.findFirst({
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
        paymentAllocations: {
          include: {
            charge: true,
          },
        },
      },
    })

    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = paymentUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Handle refund/cancellation - need to reverse allocations
    if (data.status === 'REFUNDED' || data.status === 'CANCELLED' || data.status === 'FAILED') {
      await prisma.$transaction(async (tx) => {
        // Reverse all allocations
        for (const allocation of existingPayment.paymentAllocations) {
          // Recalculate charge status
          const otherAllocations = await tx.paymentAllocation.findMany({
            where: {
              chargeId: allocation.chargeId,
              id: { not: allocation.id },
              payment: {
                status: 'COMPLETED',
              },
            },
          })

          const totalOtherAllocations = otherAllocations.reduce(
            (sum, pa) => sum + Number(pa.amount),
            0
          )

          let newStatus: 'DUE' | 'PARTIAL' | 'PAID' | 'OVERDUE' = 'DUE'
          if (totalOtherAllocations > 0) {
            if (totalOtherAllocations >= Number(allocation.charge.amount)) {
              newStatus = 'PAID'
            } else {
              newStatus = 'PARTIAL'
            }
          } else {
            // Check if overdue
            if (new Date(allocation.charge.dueDate) < new Date()) {
              newStatus = 'DUE'
            }
          }

          await tx.charge.update({
            where: { id: allocation.chargeId },
            data: { status: newStatus },
          })
        }

        // Delete allocations
        await tx.paymentAllocation.deleteMany({
          where: { paymentId: id },
        })

        // Update payment status
        await tx.payment.update({
          where: { id },
          data: {
            status: data.status,
            ...(data.notes !== undefined && { notes: data.notes }),
            ...(data.refundReason && { refundReason: data.refundReason }),
          },
        })
      })
    } else {
      // Simple update
      await prisma.payment.update({
        where: { id },
        data: {
          ...(data.status && { status: data.status }),
          ...(data.notes !== undefined && { notes: data.notes }),
        },
      })
    }

    // Fetch updated payment
    const payment = await prisma.payment.findUnique({
      where: { id },
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
            charge: true,
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
        entityType: 'payment',
        entityId: id,
        description: `Updated payment for ${existingPayment.lease.unit.unitNumber}${data.status ? ` - Status: ${data.status}` : ''}`,
        previousValues: JSON.parse(JSON.stringify(existingPayment)),
        newValues: JSON.parse(JSON.stringify(payment)),
      },
    })

    return NextResponse.json({ payment })
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/payments/[id] - Delete a payment (only if pending)
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

    // Check if payment exists and belongs to user's organization
    const existingPayment = await prisma.payment.findFirst({
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

    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Only allow deleting pending payments
    if (existingPayment.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cannot delete processed payments. Use refund or cancel instead.' },
        { status: 400 }
      )
    }

    // Delete payment and allocations
    await prisma.$transaction(async (tx) => {
      await tx.paymentAllocation.deleteMany({
        where: { paymentId: id },
      })

      await tx.payment.delete({
        where: { id },
      })
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: 'DELETE',
        entityType: 'payment',
        entityId: id,
        description: `Deleted pending payment of $${existingPayment.amount} for ${existingPayment.lease.unit.unitNumber}`,
        previousValues: JSON.parse(JSON.stringify(existingPayment)),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
