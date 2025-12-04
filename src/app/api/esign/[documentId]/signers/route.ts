import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSignerSchema } from '@/lib/schemas/esign';

// Signer colors for UI display
const SIGNER_COLORS = [
  '#3B82F6', // blue
  '#F97316', // orange
  '#10B981', // green
  '#8B5CF6', // purple
  '#EF4444', // red
  '#F59E0B', // amber
  '#06B6D4', // cyan
  '#EC4899', // pink
];

/**
 * GET /api/esign/[documentId]/signers
 * Get all signers for a document
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

    const signers = await prisma.eSignSigner.findMany({
      where: { documentId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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
        fields: true,
      },
      orderBy: { order: 'asc' },
    });

    // Add color to each signer based on order
    const signersWithColors = signers.map((signer, index) => ({
      ...signer,
      color: SIGNER_COLORS[index % SIGNER_COLORS.length],
    }));

    return NextResponse.json({ signers: signersWithColors });
  } catch (error) {
    console.error('Error fetching signers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch signers' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/esign/[documentId]/signers
 * Add a signer to a document
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
    const validationResult = addSignerSchema.safeParse(body);
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

    // Only allow adding signers to DRAFT documents
    if (document.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Cannot add signers to a document that has already been sent' },
        { status: 400 }
      );
    }

    // Get the current max order for signers
    const maxOrderSigner = await prisma.eSignSigner.findFirst({
      where: { documentId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const nextOrder = data.order || (maxOrderSigner?.order || 0) + 1;

    // Create the signer
    const newSigner = await prisma.eSignSigner.create({
      data: {
        documentId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role || 'Signer',
        order: nextOrder,
        userId: data.userId,
        tenantId: data.tenantId,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create audit log entry
    await prisma.eSignAuditLog.create({
      data: {
        documentId,
        action: 'SIGNER_ADDED',
        actorType: 'USER',
        actorId: userId,
        metadata: { signerEmail: data.email, signerName: data.name },
      },
    });

    // Add color based on order
    const signerWithColor = {
      ...newSigner,
      color: SIGNER_COLORS[(nextOrder - 1) % SIGNER_COLORS.length],
    };

    return NextResponse.json(signerWithColor, { status: 201 });
  } catch (error) {
    console.error('Error adding signer:', error);
    return NextResponse.json(
      { error: 'Failed to add signer' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/esign/[documentId]/signers
 * Remove a signer from a document
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
    const { signerId } = await request.json();

    if (!signerId) {
      return NextResponse.json(
        { error: 'Signer ID is required' },
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

    // Only allow removing signers from DRAFT documents
    if (document.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Cannot remove signers from a document that has already been sent' },
        { status: 400 }
      );
    }

    // Get signer info for audit log
    const signer = await prisma.eSignSigner.findFirst({
      where: {
        id: signerId,
        documentId,
      },
    });

    if (!signer) {
      return NextResponse.json(
        { error: 'Signer not found' },
        { status: 404 }
      );
    }

    // Delete the signer (cascade will handle related fields)
    await prisma.eSignSigner.delete({
      where: { id: signerId },
    });

    // Create audit log entry
    await prisma.eSignAuditLog.create({
      data: {
        documentId,
        action: 'SIGNER_REMOVED',
        actorType: 'USER',
        actorId: userId,
        metadata: { signerEmail: signer.email, signerName: signer.name },
      },
    });

    return NextResponse.json({ success: true, deletedId: signerId });
  } catch (error) {
    console.error('Error removing signer:', error);
    return NextResponse.json(
      { error: 'Failed to remove signer' },
      { status: 500 }
    );
  }
}
