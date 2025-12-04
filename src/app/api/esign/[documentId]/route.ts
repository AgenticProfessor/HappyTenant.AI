import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ESignDocumentStatus } from '@prisma/client';

/**
 * GET /api/esign/[documentId]
 * Get a specific E-Sign document with all details
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

    const document = await prisma.eSignDocument.findFirst({
      where: {
        id: documentId,
        organizationId,
      },
      include: {
        signers: {
          orderBy: { order: 'asc' },
        },
        fields: {
          include: {
            signer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        lease: {
          select: {
            id: true,
            rentAmount: true,
            startDate: true,
            endDate: true,
            unit: {
              select: {
                id: true,
                unitNumber: true,
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
          },
        },
        application: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            unit: {
              select: {
                id: true,
                unitNumber: true,
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
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching E-Sign document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/esign/[documentId]
 * Update an E-Sign document
 */
export async function PATCH(
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

    // Verify document exists and belongs to organization
    const existingDocument = await prisma.eSignDocument.findFirst({
      where: {
        id: documentId,
        organizationId,
      },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Only allow updates to documents in DRAFT status
    if (existingDocument.status !== 'DRAFT' && body.status === undefined) {
      return NextResponse.json(
        { error: 'Cannot update a document that has already been sent' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: {
      title?: string;
      description?: string;
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
      expiresAt?: Date | null;
      status?: ESignDocumentStatus;
      completedAt?: Date | null;
      completedDocumentUrl?: string | null;
    } = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.fileUrl !== undefined) updateData.fileUrl = body.fileUrl;
    if (body.fileName !== undefined) updateData.fileName = body.fileName;
    if (body.fileSize !== undefined) updateData.fileSize = body.fileSize;
    if (body.mimeType !== undefined) updateData.mimeType = body.mimeType;
    if (body.expiresAt !== undefined) {
      updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    }
    if (body.status !== undefined && Object.values(ESignDocumentStatus).includes(body.status)) {
      updateData.status = body.status as ESignDocumentStatus;
    }
    if (body.completedAt !== undefined) {
      updateData.completedAt = body.completedAt ? new Date(body.completedAt) : null;
    }
    if (body.completedDocumentUrl !== undefined) {
      updateData.completedDocumentUrl = body.completedDocumentUrl;
    }

    const updatedDocument = await prisma.eSignDocument.update({
      where: { id: documentId },
      data: updateData,
      include: {
        signers: true,
        fields: true,
      },
    });

    // Create audit log entry
    await prisma.eSignAuditLog.create({
      data: {
        documentId,
        action: 'DOCUMENT_UPDATED',
        actorType: 'USER',
        actorId: userId,
        metadata: { changes: Object.keys(updateData) },
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Error updating E-Sign document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/esign/[documentId]
 * Delete an E-Sign document
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

    // Verify document exists and belongs to organization
    const existingDocument = await prisma.eSignDocument.findFirst({
      where: {
        id: documentId,
        organizationId,
      },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Only allow deletion of DRAFT or CANCELLED documents
    if (!['DRAFT', 'CANCELLED'].includes(existingDocument.status)) {
      return NextResponse.json(
        { error: 'Cannot delete a document that has been sent for signatures' },
        { status: 400 }
      );
    }

    // Delete the document (cascade will handle signers, fields, audit log)
    await prisma.eSignDocument.delete({
      where: { id: documentId },
    });

    return NextResponse.json({ success: true, deletedId: documentId });
  } catch (error) {
    console.error('Error deleting E-Sign document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
