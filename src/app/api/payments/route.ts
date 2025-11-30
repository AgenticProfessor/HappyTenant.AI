import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for creating a payment
const paymentSchema = z.object({
  leaseId: z.string().min(1, 'Lease is required'),
  tenantId: z.string().min(1, 'Tenant is required'),
  amount: z.number().min(0.01, 'Amount must be positive'),
  method: z.enum([
    'CASH',
    'CHECK',
    'MONEY_ORDER',
    'ACH',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'ZELLE',
    'VENMO',
    'PAYPAL',
    'WIRE',
    'OTHER'
  ]),
  receivedAt: z.string().min(1, 'Payment date is required'),
  referenceNumber: z.string().optional(),
  checkNumber: z.string().optional(),
  notes: z.string().optional(),
  // Optional: specify which charges to allocate to
  allocations: z.array(z.object({
    chargeId: z.string(),
    amount: z.number().min(0.01),
  })).optional(),
  // If no allocations specified, auto-allocate oldest first
  autoAllocate: z.boolean().default(true),
})

// GET /api/payments - List all payments for the organization
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
    const method = searchParams.get('method')
    const leaseId = searchParams.get('leaseId')
    const tenantId = searchParams.get('tenantId')
    const propertyId = searchParams.get('propertyId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build filter
    const where: Record<string, unknown> = {
      lease: {
        unit: {
          property: {
            organizationId: user.organizationId,
          },
        },
      },
    }

    if (status) {
      where.status = status
    }

    if (method) {
      where.method = method
    }

    if (leaseId) {
      where.leaseId = leaseId
    }

    if (tenantId) {
      where.tenantId = tenantId
    }

    if (propertyId) {
      where.lease = {
        ...where.lease as Record<string, unknown>,
        unit: {
          propertyId,
        },
      }
    }

    if (startDate || endDate) {
      where.receivedAt = {}
      if (startDate) {
        (where.receivedAt as Record<string, unknown>).gte = new Date(startDate)
      }
      if (endDate) {
        (where.receivedAt as Record<string, unknown>).lte = new Date(endDate)
      }
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: {
                  select: {
                    id: true,
                    name: true,
                    addressLine1: true,
                  },
                },
              },
            },
          },
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        paymentAllocations: {
          include: {
            charge: {
              select: {
                id: true,
                type: true,
                description: true,
                amount: true,
                dueDate: true,
              },
            },
          },
        },
      },
      orderBy: { receivedAt: 'desc' },
    })

    // Calculate totals
    const totalReceived = payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + Number(p.amount), 0)

    const totalPending = payments
      .filter(p => p.status === 'PENDING')
      .reduce((sum, p) => sum + Number(p.amount), 0)

    return NextResponse.json({
      payments,
      summary: {
        totalReceived,
        totalPending,
        count: payments.length,
      },
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/payments - Record a new payment
export async function POST(request: Request) {
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

    // Parse and validate request body
    const body = await request.json()
    const validationResult = paymentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Verify lease belongs to user's organization
    const lease = await prisma.lease.findFirst({
      where: {
        id: data.leaseId,
        unit: {
          property: {
            organizationId: user.organizationId,
          },
        },
      },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
      },
    })

    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }

    // Verify tenant exists and is on the lease
    const leaseTenant = await prisma.leaseTenant.findFirst({
      where: {
        leaseId: data.leaseId,
        tenantId: data.tenantId,
      },
    })

    if (!leaseTenant) {
      return NextResponse.json(
        { error: 'Tenant is not on this lease' },
        { status: 400 }
      )
    }

    // Create payment and allocations in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the payment
      const payment = await tx.payment.create({
        data: {
          leaseId: data.leaseId,
          tenantId: data.tenantId,
          amount: data.amount,
          method: data.method,
          receivedAt: new Date(data.receivedAt),
          externalId: data.referenceNumber,
          checkNumber: data.checkNumber,
          notes: data.notes,
          status: 'COMPLETED',
          processedAt: new Date(),
          recordedByUserId: user.id,
        },
      })

      let allocations: Array<{ chargeId: string; amount: number }> = []

      if (data.allocations && data.allocations.length > 0) {
        // Use specified allocations
        allocations = data.allocations
      } else if (data.autoAllocate) {
        // Auto-allocate to oldest unpaid charges first
        const unpaidCharges = await tx.charge.findMany({
          where: {
            leaseId: data.leaseId,
            status: { in: ['DUE', 'PARTIAL'] },
          },
          orderBy: { dueDate: 'asc' },
          include: {
            paymentAllocations: true,
          },
        })

        let remainingAmount = data.amount

        for (const charge of unpaidCharges) {
          if (remainingAmount <= 0) break

          // Calculate remaining balance on this charge
          const allocated = charge.paymentAllocations.reduce(
            (sum: number, pa: any) => sum + Number(pa.amount),
            0
          )
          const remainingOnCharge = Number(charge.amount) - allocated

          if (remainingOnCharge > 0) {
            const allocationAmount = Math.min(remainingAmount, remainingOnCharge)
            allocations.push({
              chargeId: charge.id,
              amount: allocationAmount,
            })
            remainingAmount -= allocationAmount
          }
        }
      }

      // Create payment allocations
      for (const allocation of allocations) {
        await tx.paymentAllocation.create({
          data: {
            paymentId: payment.id,
            chargeId: allocation.chargeId,
            amount: allocation.amount,
            createdAt: new Date(),
          },
        })

        // Update charge status
        const charge = await tx.charge.findUnique({
          where: { id: allocation.chargeId },
          include: { paymentAllocations: true },
        })

        if (charge) {
          const totalAllocated = charge.paymentAllocations.reduce(
            (sum: number, pa: any) => sum + Number(pa.amount),
            0
          ) + allocation.amount

          let newStatus: 'DUE' | 'PARTIAL' | 'PAID' = 'PARTIAL'
          if (totalAllocated >= Number(charge.amount)) {
            newStatus = 'PAID'
          }

          await tx.charge.update({
            where: { id: allocation.chargeId },
            data: { status: newStatus },
          })
        }
      }

      return payment
    })

    // Fetch complete payment with allocations
    const payment = await prisma.payment.findUnique({
      where: { id: result.id },
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
        action: 'PAYMENT_RECEIVED',
        entityType: 'payment',
        entityId: result.id,
        description: `Payment of $${data.amount} received for ${lease.unit.unitNumber} via ${data.method}`,
        newValues: JSON.parse(JSON.stringify(payment)),
      },
    })

    return NextResponse.json({ payment }, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
