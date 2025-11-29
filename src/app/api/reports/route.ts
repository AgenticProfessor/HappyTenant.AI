import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getReportsByCategory } from '@/lib/reports/definitions'
import type { ReportsListResponse, ReportListItem } from '@/lib/reports/types'

// GET /api/reports - List all available reports with favorites OR generate a legacy report
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

    // Get query params for report type and date range
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type')

    // If no type is specified, return the list of available reports
    if (!reportType) {
      return await listAvailableReports(userId)
    }

    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const propertyId = searchParams.get('propertyId')

    const dateFilter: { gte?: Date; lte?: Date } = {}
    if (startDate) dateFilter.gte = new Date(startDate)
    if (endDate) dateFilter.lte = new Date(endDate)

    const organizationId = user.organizationId

    switch (reportType) {
      case 'overview':
        return await generateOverviewReport(organizationId, propertyId)

      case 'rent-roll':
        return await generateRentRollReport(organizationId, propertyId)

      case 'income':
        return await generateIncomeReport(organizationId, propertyId, dateFilter)

      case 'delinquency':
        return await generateDelinquencyReport(organizationId, propertyId)

      case 'vacancy':
        return await generateVacancyReport(organizationId, propertyId)

      case 'maintenance':
        return await generateMaintenanceReport(organizationId, propertyId, dateFilter)

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// List all available reports with user favorites
async function listAvailableReports(userId: string): Promise<NextResponse> {
  // Get user favorites from database
  let favoriteTypes: string[] = []
  try {
    const favorites = await prisma.userReportFavorite.findMany({
      where: { userId },
      select: { reportType: true },
    })
    favoriteTypes = favorites.map((f) => f.reportType)
  } catch {
    // Table might not exist yet, continue with empty favorites
    console.log('UserReportFavorite table not found, using empty favorites')
  }

  // Get all report categories with favorite status
  const categories = getReportsByCategory()
  const categoriesWithFavorites = categories.map((cat) => ({
    ...cat,
    reports: cat.reports.map((report) => ({
      ...report,
      isFavorite: favoriteTypes.includes(report.type),
    })),
  }))

  // Flatten all reports for the response
  const allReports: ReportListItem[] = []
  categoriesWithFavorites.forEach((cat) => {
    cat.reports.forEach((report) => {
      allReports.push(report)
    })
  })

  const response: ReportsListResponse = {
    reports: allReports,
    categories: categoriesWithFavorites,
  }

  return NextResponse.json(response)
}

// Overview Dashboard Report
async function generateOverviewReport(organizationId: string, propertyId: string | null) {
  const propertyFilter = propertyId ? { id: propertyId } : {}

  // Get properties count
  const propertiesCount = await prisma.property.count({
    where: { organizationId, ...propertyFilter },
  })

  // Get units stats
  const units = await prisma.unit.findMany({
    where: {
      property: {
        organizationId,
        ...propertyFilter,
      },
    },
    select: {
      status: true,
      marketRent: true,
    },
  })

  const totalUnits = units.length
  const occupiedUnits = units.filter(u => u.status === 'OCCUPIED').length
  const vacantUnits = units.filter(u => u.status === 'VACANT').length
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0

  // Get active tenants
  const activeTenants = await prisma.tenant.count({
    where: { organizationId, isActive: true },
  })

  // Get active leases
  const activeLeases = await prisma.lease.count({
    where: {
      status: 'ACTIVE',
      unit: {
        property: {
          organizationId,
          ...propertyFilter,
        },
      },
    },
  })

  // Get current month's income
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const monthlyPayments = await prisma.payment.aggregate({
    where: {
      status: 'COMPLETED',
      receivedAt: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
      lease: {
        unit: {
          property: {
            organizationId,
            ...propertyFilter,
          },
        },
      },
    },
    _sum: {
      amount: true,
    },
  })

  // Get outstanding balance
  const charges = await prisma.charge.findMany({
    where: {
      status: { in: ['DUE', 'PARTIAL'] },
      lease: {
        unit: {
          property: {
            organizationId,
            ...propertyFilter,
          },
        },
      },
    },
    select: {
      amount: true,
      paymentAllocations: {
        select: {
          amount: true,
        },
      },
    },
  })

  const outstandingBalance = charges.reduce((sum, charge) => {
    const allocated = charge.paymentAllocations.reduce((s, pa) => s + Number(pa.amount), 0)
    return sum + (Number(charge.amount) - allocated)
  }, 0)

  // Get open maintenance requests
  const openMaintenanceRequests = await prisma.maintenanceRequest.count({
    where: {
      status: { notIn: ['COMPLETED', 'CANCELLED'] },
      unit: {
        property: {
          organizationId,
          ...propertyFilter,
        },
      },
    },
  })

  // Potential monthly rent
  const potentialRent = units.reduce((sum, u) => sum + Number(u.marketRent || 0), 0)

  return NextResponse.json({
    report: {
      type: 'overview',
      generatedAt: new Date().toISOString(),
      data: {
        properties: propertiesCount,
        totalUnits,
        occupiedUnits,
        vacantUnits,
        occupancyRate,
        activeTenants,
        activeLeases,
        monthlyIncome: Number(monthlyPayments._sum.amount || 0),
        potentialRent,
        outstandingBalance,
        openMaintenanceRequests,
      },
    },
  })
}

// Rent Roll Report
async function generateRentRollReport(organizationId: string, propertyId: string | null) {
  const leases = await prisma.lease.findMany({
    where: {
      status: 'ACTIVE',
      unit: {
        property: {
          organizationId,
          ...(propertyId ? { id: propertyId } : {}),
        },
      },
    },
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
      leaseTenants: {
        where: { role: 'PRIMARY' },
        include: {
          tenant: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      charges: {
        where: {
          status: { in: ['DUE', 'PARTIAL'] },
        },
      },
    },
    orderBy: [
      { unit: { property: { name: 'asc' } } },
      { unit: { unitNumber: 'asc' } },
    ],
  })

  const rentRoll = leases.map(lease => {
    const primaryTenant = lease.leaseTenants[0]?.tenant
    const balance = lease.charges.reduce((sum, c) => sum + Number(c.amount), 0)

    return {
      propertyName: lease.unit.property.name,
      unitNumber: lease.unit.unitNumber,
      tenantName: primaryTenant ? `${primaryTenant.firstName} ${primaryTenant.lastName}` : 'N/A',
      tenantEmail: primaryTenant?.email,
      leaseStart: lease.startDate,
      leaseEnd: lease.endDate,
      monthlyRent: Number(lease.rentAmount),
      securityDeposit: Number(lease.securityDeposit),
      currentBalance: balance,
    }
  })

  const totalMonthlyRent = rentRoll.reduce((sum, r) => sum + r.monthlyRent, 0)
  const totalBalance = rentRoll.reduce((sum, r) => sum + r.currentBalance, 0)

  return NextResponse.json({
    report: {
      type: 'rent-roll',
      generatedAt: new Date().toISOString(),
      data: rentRoll,
      summary: {
        totalLeases: rentRoll.length,
        totalMonthlyRent,
        totalBalance,
      },
    },
  })
}

// Income Report
async function generateIncomeReport(
  organizationId: string,
  propertyId: string | null,
  dateFilter: { gte?: Date; lte?: Date }
) {
  const payments = await prisma.payment.findMany({
    where: {
      status: 'COMPLETED',
      receivedAt: dateFilter,
      lease: {
        unit: {
          property: {
            organizationId,
            ...(propertyId ? { id: propertyId } : {}),
          },
        },
      },
    },
    include: {
      lease: {
        include: {
          unit: {
            include: {
              property: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      paymentAllocations: {
        include: {
          charge: {
            select: {
              type: true,
            },
          },
        },
      },
    },
    orderBy: { receivedAt: 'desc' },
  })

  // Group by income type
  const incomeByType: Record<string, number> = {}
  const incomeByProperty: Record<string, number> = {}
  const incomeByMonth: Record<string, number> = {}

  payments.forEach(payment => {
    const propertyName = payment.lease.unit.property.name
    const monthKey = new Date(payment.receivedAt).toISOString().slice(0, 7)
    const amount = Number(payment.amount)

    // By property
    incomeByProperty[propertyName] = (incomeByProperty[propertyName] || 0) + amount

    // By month
    incomeByMonth[monthKey] = (incomeByMonth[monthKey] || 0) + amount

    // By type (based on charge allocations)
    payment.paymentAllocations.forEach(pa => {
      const type = pa.charge.type
      incomeByType[type] = (incomeByType[type] || 0) + Number(pa.amount)
    })
  })

  const totalIncome = payments.reduce((sum, p) => sum + Number(p.amount), 0)

  return NextResponse.json({
    report: {
      type: 'income',
      generatedAt: new Date().toISOString(),
      dateRange: dateFilter,
      data: {
        payments: payments.map(p => ({
          date: p.receivedAt,
          amount: Number(p.amount),
          method: p.method,
          property: p.lease.unit.property.name,
          unit: p.lease.unit.unitNumber,
        })),
        incomeByType,
        incomeByProperty,
        incomeByMonth,
      },
      summary: {
        totalIncome,
        paymentCount: payments.length,
      },
    },
  })
}

// Delinquency Report
async function generateDelinquencyReport(organizationId: string, propertyId: string | null) {
  const overdueCharges = await prisma.charge.findMany({
    where: {
      status: { in: ['DUE', 'PARTIAL'] },
      dueDate: { lt: new Date() },
      lease: {
        unit: {
          property: {
            organizationId,
            ...(propertyId ? { id: propertyId } : {}),
          },
        },
      },
    },
    include: {
      lease: {
        include: {
          unit: {
            include: {
              property: {
                select: {
                  id: true,
                  name: true,
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
          phone: true,
        },
      },
      paymentAllocations: true,
    },
    orderBy: { dueDate: 'asc' },
  })

  const delinquencies = overdueCharges.map(charge => {
    const allocated = charge.paymentAllocations.reduce((sum, pa) => sum + Number(pa.amount), 0)
    const balance = Number(charge.amount) - allocated
    const daysOverdue = Math.floor(
      (Date.now() - new Date(charge.dueDate).getTime()) / (1000 * 60 * 60 * 24)
    )

    return {
      propertyName: charge.lease.unit.property.name,
      unitNumber: charge.lease.unit.unitNumber,
      tenantName: charge.tenant ? `${charge.tenant.firstName} ${charge.tenant.lastName}` : 'Unknown',
      tenantEmail: charge.tenant?.email || '',
      tenantPhone: charge.tenant?.phone || '',
      chargeType: charge.type,
      chargeDescription: charge.description,
      originalAmount: Number(charge.amount),
      balanceDue: balance,
      dueDate: charge.dueDate,
      daysOverdue,
    }
  })

  const totalOverdue = delinquencies.reduce((sum, d) => sum + d.balanceDue, 0)

  return NextResponse.json({
    report: {
      type: 'delinquency',
      generatedAt: new Date().toISOString(),
      data: delinquencies,
      summary: {
        totalOverdueCharges: delinquencies.length,
        totalOverdueAmount: totalOverdue,
        uniqueTenants: new Set(delinquencies.map(d => d.tenantEmail)).size,
      },
    },
  })
}

// Vacancy Report
async function generateVacancyReport(organizationId: string, propertyId: string | null) {
  const vacantUnits = await prisma.unit.findMany({
    where: {
      status: { in: ['VACANT', 'NOTICE_GIVEN', 'UNDER_APPLICATION'] },
      property: {
        organizationId,
        ...(propertyId ? { id: propertyId } : {}),
      },
    },
    include: {
      property: {
        select: {
          id: true,
          name: true,
          addressLine1: true,
        },
      },
      leases: {
        where: { status: 'ACTIVE' },
        orderBy: { endDate: 'desc' },
        take: 1,
      },
    },
    orderBy: [
      { property: { name: 'asc' } },
      { unitNumber: 'asc' },
    ],
  })

  const vacancies = vacantUnits.map(unit => ({
    propertyName: unit.property.name,
    propertyAddress: unit.property.addressLine1,
    unitNumber: unit.unitNumber,
    bedrooms: unit.bedrooms,
    bathrooms: unit.bathrooms,
    marketRent: Number(unit.marketRent),
    status: unit.status,
    isListed: unit.isListed,
    availableDate: unit.availableDate,
    daysVacant: unit.leases[0]?.endDate
      ? Math.max(0, Math.floor((Date.now() - new Date(unit.leases[0].endDate).getTime()) / (1000 * 60 * 60 * 24)))
      : null,
  }))

  const totalPotentialRent = vacancies.reduce((sum, v) => sum + v.marketRent, 0)

  return NextResponse.json({
    report: {
      type: 'vacancy',
      generatedAt: new Date().toISOString(),
      data: vacancies,
      summary: {
        totalVacantUnits: vacancies.length,
        totalPotentialRent,
        listedUnits: vacancies.filter(v => v.isListed).length,
        underApplication: vacancies.filter(v => v.status === 'UNDER_APPLICATION').length,
      },
    },
  })
}

// Maintenance Report
async function generateMaintenanceReport(
  organizationId: string,
  propertyId: string | null,
  dateFilter: { gte?: Date; lte?: Date }
) {
  const requests = await prisma.maintenanceRequest.findMany({
    where: {
      createdAt: dateFilter,
      unit: {
        property: {
          organizationId,
          ...(propertyId ? { id: propertyId } : {}),
        },
      },
    },
    include: {
      unit: {
        include: {
          property: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      assignedToVendor: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Group by status
  const byStatus: Record<string, number> = {}
  const byCategory: Record<string, number> = {}
  const byProperty: Record<string, number> = {}

  let totalCost = 0

  requests.forEach(req => {
    byStatus[req.status] = (byStatus[req.status] || 0) + 1
    byCategory[req.category] = (byCategory[req.category] || 0) + 1
    byProperty[req.unit.property.name] = (byProperty[req.unit.property.name] || 0) + 1
    totalCost += Number(req.actualCost || 0)
  })

  // Calculate average completion time for completed requests
  const completedRequests = requests.filter(r => r.status === 'COMPLETED' && r.resolvedAt)
  const avgCompletionHours = completedRequests.length > 0
    ? completedRequests.reduce((sum, r) => {
      const hours = (new Date(r.resolvedAt!).getTime() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60)
      return sum + hours
    }, 0) / completedRequests.length
    : 0

  return NextResponse.json({
    report: {
      type: 'maintenance',
      generatedAt: new Date().toISOString(),
      dateRange: dateFilter,
      data: requests.map(r => ({
        title: r.title,
        category: r.category,
        priority: r.priority,
        status: r.status,
        propertyName: r.unit.property.name,
        unitNumber: r.unit.unitNumber,
        vendorName: r.assignedToVendor?.name,
        estimatedCost: Number(r.estimatedCost || 0),
        actualCost: Number(r.actualCost || 0),
        createdAt: r.createdAt,
        completedAt: r.resolvedAt,
      })),
      summary: {
        totalRequests: requests.length,
        byStatus,
        byCategory,
        byProperty,
        totalCost,
        avgCompletionTimeHours: Math.round(avgCompletionHours),
      },
    },
  })
}
