import { NextRequest, NextResponse } from 'next/server';
import { createDocumentSchema } from '@/lib/schemas/esign';

// Mock user ID for development
const MOCK_USER_ID = 'mock-user-id';
const MOCK_ORG_ID = 'mock-org-id';

/**
 * GET /api/esign
 * List all E-Sign documents for the organization
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const propertyId = searchParams.get('propertyId');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // TODO: Replace with actual database query when Prisma schema is updated
    // For now, return mock data
    const mockDocuments = [
      {
        id: 'doc-1',
        name: 'Lease Agreement - Unit 3B',
        status: 'COMPLETED',
        createdAt: '2024-11-15T00:00:00Z',
        completedAt: '2024-11-18T00:00:00Z',
        signerCount: 2,
        signedCount: 2,
        property: {
          id: 'prop-1',
          name: 'Sunset Apartments',
        },
      },
      {
        id: 'doc-2',
        name: 'Pet Addendum - Unit 12',
        status: 'PENDING_SIGNATURES',
        createdAt: '2024-11-20T00:00:00Z',
        signerCount: 2,
        signedCount: 1,
        property: {
          id: 'prop-2',
          name: 'Oak Grove Homes',
        },
      },
      {
        id: 'doc-3',
        name: 'Move-Out Inspection',
        status: 'DRAFT',
        createdAt: '2024-11-22T00:00:00Z',
        signerCount: 0,
        signedCount: 0,
        property: {
          id: 'prop-1',
          name: 'Sunset Apartments',
        },
      },
    ];

    // Filter by status if provided
    let filtered = mockDocuments;
    if (status) {
      filtered = filtered.filter((d) => d.status === status);
    }
    if (propertyId) {
      filtered = filtered.filter((d) => d.property.id === propertyId);
    }

    return NextResponse.json({
      documents: filtered,
      total: filtered.length,
      page,
      pageSize,
      hasMore: false,
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

    // TODO: Create document in database
    // For now, return mock response
    const newDocument = {
      id: `doc-${Date.now()}`,
      organizationId: MOCK_ORG_ID,
      name: data.name,
      description: data.description,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      createdById: MOCK_USER_ID,
      propertyId: data.propertyId,
      leaseId: data.leaseId,
      message: data.message,
      reminderEnabled: data.reminderEnabled,
      reminderDays: data.reminderDays,
      expiresAt: data.expiresAt,
    };

    return NextResponse.json(newDocument, { status: 201 });
  } catch (error) {
    console.error('Error creating E-Sign document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
