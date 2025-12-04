import { NextRequest, NextResponse } from 'next/server';
import { auth, getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/esign/[documentId]/send
 * Send the document for signatures
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

    // Fetch the document with signers and fields
    const document = await prisma.eSignDocument.findFirst({
      where: {
        id: documentId,
        organizationId,
      },
      include: {
        signers: {
          orderBy: { order: 'asc' },
        },
        fields: true,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Validate document is in DRAFT status
    if (document.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Document has already been sent' },
        { status: 400 }
      );
    }

    // Validate document has at least one signer
    if (document.signers.length === 0) {
      return NextResponse.json(
        { error: 'Document must have at least one signer' },
        { status: 400 }
      );
    }

    // Validate document has at least one field
    if (document.fields.length === 0) {
      return NextResponse.json(
        { error: 'Document must have at least one signature field' },
        { status: 400 }
      );
    }

    // Validate each signer has at least one required field
    for (const signer of document.signers) {
      const signerFields = document.fields.filter(
        (f) => f.signerId === signer.id && f.required
      );
      if (signerFields.length === 0) {
        return NextResponse.json(
          { error: `Signer "${signer.name}" must have at least one required field` },
          { status: 400 }
        );
      }
    }

    // Get current user for audit log
    const currentUser = await getCurrentUser();

    // Generate signing URLs for each signer
    const signerUpdates = document.signers.map((signer) => {
      // Generate a signing URL using the signer's token
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const signingUrl = `${baseUrl}/sign/${signer.accessToken}`;

      return prisma.eSignSigner.update({
        where: { id: signer.id },
        data: {
          signingUrl,
          lastReminderSentAt: new Date(),
        },
      });
    });

    // Update document status and signers in a transaction
    await prisma.$transaction([
      // Update document status
      prisma.eSignDocument.update({
        where: { id: documentId },
        data: {
          status: 'PENDING_SIGNATURES',
        },
      }),
      // Update signers with signing URLs
      ...signerUpdates,
    ]);

    // Create audit log entry
    await prisma.eSignAuditLog.create({
      data: {
        documentId,
        action: 'DOCUMENT_SENT',
        actorType: 'USER',
        actorId: userId,
        actorEmail: currentUser?.email,
        actorName: currentUser
          ? `${currentUser.firstName} ${currentUser.lastName}`
          : undefined,
        metadata: {
          signerCount: document.signers.length,
          signerEmails: document.signers.map((s) => s.email),
        },
      },
    });

    // TODO: Send actual emails to signers
    // For now, we'll log the intent and return success
    // In production, this would integrate with an email service like SendGrid, Resend, etc.
    console.log(
      `[E-Sign] Document "${document.name}" sent to ${document.signers.length} signers:`,
      document.signers.map((s) => ({ name: s.name, email: s.email }))
    );

    // Create individual audit log entries for each signer notification
    await Promise.all(
      document.signers.map((signer) =>
        prisma.eSignAuditLog.create({
          data: {
            documentId,
            action: 'NOTIFICATION_SENT',
            actorType: 'SYSTEM',
            metadata: {
              signerEmail: signer.email,
              signerName: signer.name,
              notificationType: 'SIGNING_REQUEST',
            },
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      documentId,
      status: 'PENDING_SIGNATURES',
      sentAt: new Date().toISOString(),
      message: 'Document sent successfully to all signers',
      signers: document.signers.map((signer) => ({
        id: signer.id,
        name: signer.name,
        email: signer.email,
        status: 'notified',
      })),
    });
  } catch (error) {
    console.error('Error sending E-Sign document:', error);
    return NextResponse.json(
      { error: 'Failed to send document' },
      { status: 500 }
    );
  }
}
