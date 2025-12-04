import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateEntitySchema, EntityFiltersSchema } from '@/lib/schemas/entity';

// GET /api/entities - List all entities for the organization
export async function GET(request: Request) {
  try {
    const { userId, organizationId } = await auth();

    if (!userId || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const filtersResult = EntityFiltersSchema.safeParse({
      entityType: searchParams.get('entityType') || undefined,
      status: searchParams.get('status') || undefined,
      parentEntityId: searchParams.get('parentEntityId'),
      search: searchParams.get('search') || undefined,
      hasProperties: searchParams.get('hasProperties') === 'true' ? true : undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    if (!filtersResult.success) {
      return NextResponse.json(
        { error: 'Invalid filters', details: filtersResult.error.issues },
        { status: 400 }
      );
    }

    const filters = filtersResult.data;

    // Build where clause
    const where: Record<string, unknown> = {
      organizationId,
    };

    if (filters.entityType) {
      where.entityType = filters.entityType;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.parentEntityId !== undefined) {
      where.parentEntityId = filters.parentEntityId;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { legalName: { contains: filters.search, mode: 'insensitive' } },
        { ein: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.hasProperties) {
      where.properties = { some: {} };
    }

    // Get total count
    const total = await prisma.businessEntity.count({ where });

    // Get entities with pagination
    const entities = await prisma.businessEntity.findMany({
      where,
      include: {
        parentEntity: {
          select: {
            id: true,
            name: true,
            entityType: true,
          },
        },
        _count: {
          select: {
            childEntities: true,
            properties: true,
            documents: true,
          },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });

    return NextResponse.json({
      entities,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    });
  } catch (error) {
    console.error('Error fetching entities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/entities - Create a new entity
export async function POST(request: Request) {
  try {
    const { userId, organizationId } = await auth();

    if (!userId || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = CreateEntitySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Validate parent entity if provided
    if (data.parentEntityId) {
      const parentEntity = await prisma.businessEntity.findFirst({
        where: {
          id: data.parentEntityId,
          organizationId,
        },
      });

      if (!parentEntity) {
        return NextResponse.json(
          { error: 'Parent entity not found' },
          { status: 404 }
        );
      }

      // Only Series LLC can have child entities
      if (parentEntity.entityType !== 'SERIES_LLC') {
        return NextResponse.json(
          { error: 'Only Series LLCs can have child entities' },
          { status: 400 }
        );
      }
    }

    // If marking as default, unset other defaults
    if (data.isDefault) {
      await prisma.businessEntity.updateMany({
        where: {
          organizationId,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    // Create entity
    const entity = await prisma.businessEntity.create({
      data: {
        organizationId,
        name: data.name,
        legalName: data.legalName,
        entityType: data.entityType,
        parentEntityId: data.parentEntityId,
        stateOfFormation: data.stateOfFormation,
        dateFormed: data.dateFormed,
        registeredAgent: data.registeredAgent,
        registeredAgentAddress: data.registeredAgentAddress,
        ein: data.ein,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone,
        email: data.email,
        status: data.status,
        annualReportDue: data.annualReportDue,
        isDefault: data.isDefault,
      },
      include: {
        parentEntity: {
          select: {
            id: true,
            name: true,
            entityType: true,
          },
        },
        _count: {
          select: {
            childEntities: true,
            properties: true,
            documents: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId,
        action: 'CREATE',
        entityType: 'business_entity',
        entityId: entity.id,
        description: `Created entity: ${entity.name}`,
        newValues: JSON.parse(JSON.stringify(entity)),
      },
    });

    return NextResponse.json({ entity }, { status: 201 });
  } catch (error) {
    console.error('Error creating entity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
