import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UpdateEntitySchema } from '@/lib/schemas/entity';

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET /api/entities/[id] - Get a single entity
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const entity = await prisma.businessEntity.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        parentEntity: {
          select: {
            id: true,
            name: true,
            entityType: true,
          },
        },
        childEntities: {
          select: {
            id: true,
            name: true,
            entityType: true,
            status: true,
            stateOfFormation: true,
            _count: {
              select: {
                properties: true,
              },
            },
          },
          orderBy: { name: 'asc' },
        },
        properties: {
          select: {
            id: true,
            name: true,
            type: true,
            addressLine1: true,
            city: true,
            state: true,
            status: true,
            _count: {
              select: {
                units: true,
              },
            },
          },
          orderBy: { name: 'asc' },
        },
        documents: {
          select: {
            id: true,
            name: true,
            type: true,
            uploadedAt: true,
            fileSize: true,
          },
          orderBy: { uploadedAt: 'desc' },
          take: 20,
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

    if (!entity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
    }

    return NextResponse.json({ entity });
  } catch (error) {
    console.error('Error fetching entity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/entities/[id] - Update an entity
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if entity exists and belongs to user's organization
    const existingEntity = await prisma.businessEntity.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
    });

    if (!existingEntity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = UpdateEntitySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Validate parent entity if changing
    if (data.parentEntityId !== undefined && data.parentEntityId !== existingEntity.parentEntityId) {
      if (data.parentEntityId) {
        // Can't set self as parent
        if (data.parentEntityId === id) {
          return NextResponse.json(
            { error: 'Entity cannot be its own parent' },
            { status: 400 }
          );
        }

        const parentEntity = await prisma.businessEntity.findFirst({
          where: {
            id: data.parentEntityId,
            organizationId: user.organizationId,
          },
        });

        if (!parentEntity) {
          return NextResponse.json(
            { error: 'Parent entity not found' },
            { status: 404 }
          );
        }

        if (parentEntity.entityType !== 'SERIES_LLC') {
          return NextResponse.json(
            { error: 'Only Series LLCs can have child entities' },
            { status: 400 }
          );
        }
      }
    }

    // If marking as default, unset other defaults
    if (data.isDefault && !existingEntity.isDefault) {
      await prisma.businessEntity.updateMany({
        where: {
          organizationId: user.organizationId,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.legalName !== undefined) updateData.legalName = data.legalName;
    if (data.entityType !== undefined) updateData.entityType = data.entityType;
    if (data.parentEntityId !== undefined) updateData.parentEntityId = data.parentEntityId;
    if (data.stateOfFormation !== undefined) updateData.stateOfFormation = data.stateOfFormation;
    if (data.dateFormed !== undefined) updateData.dateFormed = data.dateFormed;
    if (data.registeredAgent !== undefined) updateData.registeredAgent = data.registeredAgent;
    if (data.registeredAgentAddress !== undefined) updateData.registeredAgentAddress = data.registeredAgentAddress;
    if (data.ein !== undefined) updateData.ein = data.ein;
    if (data.addressLine1 !== undefined) updateData.addressLine1 = data.addressLine1;
    if (data.addressLine2 !== undefined) updateData.addressLine2 = data.addressLine2;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.postalCode !== undefined) updateData.postalCode = data.postalCode;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.annualReportDue !== undefined) updateData.annualReportDue = data.annualReportDue;
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;

    // Update entity
    const entity = await prisma.businessEntity.update({
      where: { id },
      data: updateData,
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
        organizationId: user.organizationId,
        userId: user.id,
        action: 'UPDATE',
        entityType: 'business_entity',
        entityId: entity.id,
        description: `Updated entity: ${entity.name}`,
        previousValues: JSON.parse(JSON.stringify(existingEntity)),
        newValues: JSON.parse(JSON.stringify(entity)),
      },
    });

    return NextResponse.json({ entity });
  } catch (error) {
    console.error('Error updating entity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/entities/[id] - Delete an entity
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if entity exists and belongs to user's organization
    const existingEntity = await prisma.businessEntity.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        childEntities: true,
        properties: true,
      },
    });

    if (!existingEntity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
    }

    // Prevent deletion if entity has child entities
    if (existingEntity.childEntities.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete entity with child entities. Delete or reassign child entities first.' },
        { status: 400 }
      );
    }

    // Prevent deletion if entity has properties
    if (existingEntity.properties.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete entity with assigned properties. Reassign properties first.' },
        { status: 400 }
      );
    }

    // Prevent deletion of default entity if it's the only one
    if (existingEntity.isDefault) {
      const entityCount = await prisma.businessEntity.count({
        where: { organizationId: user.organizationId },
      });

      if (entityCount === 1) {
        return NextResponse.json(
          { error: 'Cannot delete the only entity. Create another entity first.' },
          { status: 400 }
        );
      }

      // Set another entity as default
      const anotherEntity = await prisma.businessEntity.findFirst({
        where: {
          organizationId: user.organizationId,
          id: { not: id },
        },
      });

      if (anotherEntity) {
        await prisma.businessEntity.update({
          where: { id: anotherEntity.id },
          data: { isDefault: true },
        });
      }
    }

    // Delete entity
    await prisma.businessEntity.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: 'DELETE',
        entityType: 'business_entity',
        entityId: id,
        description: `Deleted entity: ${existingEntity.name}`,
        previousValues: JSON.parse(JSON.stringify(existingEntity)),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting entity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
