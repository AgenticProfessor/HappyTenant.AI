import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createDocumentSchema } from '@/lib/schemas/esign';
import { ESignDocumentStatus, Prisma } from '@prisma/client';

/**
 * GET /api/esign
 * List all E-Sign documents for the organization
 */
export async function GET(request: NextRequest) {
  try {
    const { userId, organizationId } = await auth();

    if (!userId || !organizationId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as ESignDocumentStatus | null;
    const leaseId = searchParams.get('leaseId');
    const applicationId = searchParams.get('applicationId');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // Build where clause
    const where: Prisma.ESignDocumentWhereInput = { organizationId };

    if (status && Object.values(ESignDocumentStatus).includes(status)) {
      where.status = status;
    }
    if (leaseId) {
      where.leaseId = leaseId;
    }
    if (applicationId) {
      where.applicationId = applicationId;
    }

    // Fetch documents with signers count
    const [documents, total] = await Promise.all([
      prisma.eSignDocument.findMany({
        where,
        include: {
          signers: {
            select: {
              id: true,
              status: true,
            },
          },
          lease: {
            select: {
              id: true,
              unit: {
                select: {
                  unitNumber: true,
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
          application: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              unit: {
                select: {
                  unitNumber: true,
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
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.eSignDocument.count({ where }),
    ]);

    // Transform documents for response
    const formattedDocuments = documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      description: doc.description,
      status: doc.status,
      createdAt: doc.createdAt,
      completedAt: doc.completedAt,
      expiresAt: doc.expiresAt,
      signerCount: doc.signers.length,
      signedCount: doc.signers.filter((s) => s.status === 'SIGNED').length,
      property: doc.lease?.unit?.property || doc.application?.unit?.property || null,
      lease: doc.lease,
      application: doc.application,
      createdBy: doc.createdBy,
    }));

    return NextResponse.json({
      documents: formattedDocuments,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    });
  } catch (error) {
    console.error('Error fetching E-Sign documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/esign
 * Create a new E-Sign document
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, organizationId } = await auth();

    if (!userId || !organizationId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = createDocumentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Create the document
    const newDocument = await prisma.eSignDocument.create({
      data: {
        organizationId,
        name: data.name,
        description: data.description,
        originalFileUrl: data.fileUrl || '',
        originalFileName: data.fileName || 'document.pdf',
        fileSize: data.fileSize || 0,
        mimeType: data.mimeType || 'application/pdf',
        leaseId: data.leaseId,
        applicationId: data.applicationId,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        createdById: userId,
        status: 'DRAFT',
      },
      include: {
        signers: true,
        fields: true,
        lease: {
          select: {
            id: true,
            unit: {
              select: {
                unitNumber: true,
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
      },
    });

    // Create audit log entry
    await prisma.eSignAuditLog.create({
      data: {
        documentId: newDocument.id,
        action: 'DOCUMENT_CREATED',
        actorType: 'USER',
        actorId: userId,
      },
    });

    return NextResponse.json(newDocument, { status: 201 });
  } catch (error) {
    console.error('Error creating E-Sign document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
