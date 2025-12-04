import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addFieldSchema } from '@/lib/schemas/esign';
import { SigningFieldType } from '@prisma/client';

// Map the schema field types to Prisma field types
const mapFieldType = (type: string): SigningFieldType => {
  const typeMap: Record<string, SigningFieldType> = {
    'SIGNATURE': 'SIGNATURE',
    'INITIALS': 'INITIALS',
    'DATE': 'DATE',
    'TEXT': 'TEXT',
    'TEXTBOX': 'TEXT',
    'NAME': 'TEXT',
    'EMAIL': 'TEXT',
    'COMPANY': 'TEXT',
    'TITLE': 'TEXT',
    'CHECKBOX': 'CHECKBOX',
    'DROPDOWN': 'DROPDOWN',
    'RADIO': 'DROPDOWN',
  };
  return typeMap[type] || 'TEXT';
};

/**
 * GET /api/esign/[documentId]/fields
 * Get all signature fields for a document
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { userId, organizationId } = await auth();

    if (!userId || !organizationId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { documentId } = await params;

    // Verify document exists and belongs to organization
    const document = await prisma.eSignDocument.findFirst({
      where: {
        id: documentId,
        organizationId,
      },
      select: { id: true },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const fields = await prisma.eSignField.findMany({
      where: { documentId },
      include: {
        signer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ pageNumber: 'asc' }, { y: 'asc' }],
    });

    return NextResponse.json({ fields });
  } catch (error) {
    console.error('Error fetching fields:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fields' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/esign/[documentId]/fields
 * Add a signature field to a document
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { userId, organizationId } = await auth();

    if (!userId || !organizationId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { documentId } = await params;
    const body = await request.json();

    // Validate request
    const validationResult = addFieldSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verify document exists and belongs to organization
    const document = await prisma.eSignDocument.findFirst({
      where: {
        id: documentId,
        organizationId,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Only allow adding fields to DRAFT documents
    if (document.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Cannot add fields to a document that has already been sent' },
        { status: 400 }
      );
    }

    // Verify signer exists and belongs to this document
    const signer = await prisma.eSignSigner.findFirst({
      where: {
        id: data.signerId,
        documentId,
      },
    });

    if (!signer) {
      return NextResponse.json(
        { error: 'Signer not found' },
        { status: 404 }
      );
    }

    // Create the field
    const newField = await prisma.eSignField.create({
      data: {
        documentId,
        signerId: data.signerId,
        type: mapFieldType(data.type),
        label: data.label,
        placeholder: data.placeholder,
        pageNumber: data.pageNumber,
        x: data.x,
        y: data.y,
        width: data.width,
        height: data.height,
        required: data.required ?? true,
        options: data.options || [],
      },
      include: {
        signer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(newField, { status: 201 });
  } catch (error) {
    console.error('Error adding field:', error);
    return NextResponse.json(
      { error: 'Failed to add field' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/esign/[documentId]/fields
 * Bulk update/replace fields for a document
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { userId, organizationId } = await auth();

    if (!userId || !organizationId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { documentId } = await params;
    const body = await request.json();
    const { fields } = body;

    if (!Array.isArray(fields)) {
      return NextResponse.json(
        { error: 'Fields must be an array' },
        { status: 400 }
      );
    }

    // Verify document exists and belongs to organization
    const document = await prisma.eSignDocument.findFirst({
      where: {
        id: documentId,
        organizationId,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Only allow updating fields on DRAFT documents
    if (document.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Cannot update fields on a document that has already been sent' },
        { status: 400 }
      );
    }

    // Delete existing fields and create new ones in a transaction
    const updatedFields = await prisma.$transaction(async (tx) => {
      // Delete all existing fields for this document
      await tx.eSignField.deleteMany({
        where: { documentId },
      });

      // Create new fields
      const createdFields = await Promise.all(
        fields.map((field: {
          signerId: string;
          type: string;
          label?: string;
          placeholder?: string;
          pageNumber: number;
          x: number;
          y: number;
          width: number;
          height: number;
          required?: boolean;
          options?: string[];
        }) =>
          tx.eSignField.create({
            data: {
              documentId,
              signerId: field.signerId,
              type: mapFieldType(field.type),
              label: field.label,
              placeholder: field.placeholder,
              pageNumber: field.pageNumber,
              x: field.x,
              y: field.y,
              width: field.width,
              height: field.height,
              required: field.required ?? true,
              options: field.options || [],
            },
            include: {
              signer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          })
        )
      );

      return createdFields;
    });

    // Create audit log entry
    await prisma.eSignAuditLog.create({
      data: {
        documentId,
        action: 'FIELDS_UPDATED',
        actorType: 'USER',
        actorId: userId,
        metadata: { fieldCount: updatedFields.length },
      },
    });

    return NextResponse.json({ fields: updatedFields });
  } catch (error) {
    console.error('Error updating fields:', error);
    return NextResponse.json(
      { error: 'Failed to update fields' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/esign/[documentId]/fields
 * Delete a specific field from a document
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { userId, organizationId } = await auth();

    if (!userId || !organizationId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { documentId } = await params;
    const { fieldId } = await request.json();

    if (!fieldId) {
      return NextResponse.json(
        { error: 'Field ID is required' },
        { status: 400 }
      );
    }

    // Verify document exists and belongs to organization
    const document = await prisma.eSignDocument.findFirst({
      where: {
        id: documentId,
        organizationId,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Only allow deleting fields from DRAFT documents
    if (document.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Cannot delete fields from a document that has already been sent' },
        { status: 400 }
      );
    }

    // Delete the field
    await prisma.eSignField.delete({
      where: { id: fieldId },
    });

    return NextResponse.json({ success: true, deletedId: fieldId });
  } catch (error) {
    console.error('Error deleting field:', error);
    return NextResponse.json(
      { error: 'Failed to delete field' },
      { status: 500 }
    );
  }
}
