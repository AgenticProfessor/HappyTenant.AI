import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/esign/[documentId]
 * Get a specific E-Sign document with all details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;

    // TODO: Fetch from database
    // For now, return mock data
    const mockDocument = {
      id: documentId,
      name: 'Lease Agreement - Unit 3B',
      description: 'Annual lease agreement for residential property',
      status: 'PENDING_SIGNATURES',
      originalFileName: 'lease-agreement.pdf',
      originalFileUrl: '/uploads/lease-agreement.pdf',
      fileSize: 245000,
      mimeType: 'application/pdf',
      pageCount: 8,
      createdAt: '2024-11-15T00:00:00Z',
      sentAt: '2024-11-16T00:00:00Z',
      message: 'Please review and sign the lease agreement.',
      reminderEnabled: true,
      reminderDays: 3,
      property: {
        id: 'prop-1',
        name: 'Sunset Apartments',
        address: '123 Main St',
      },
      signers: [
        {
          id: 'signer-1',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          role: 'TENANT',
          status: 'SIGNED',
          signedAt: '2024-11-17T00:00:00Z',
          color: '#3B82F6',
          order: 1,
        },
        {
          id: 'signer-2',
          name: 'John Smith',
          email: 'john@example.com',
          role: 'LANDLORD',
          status: 'PENDING',
          color: '#F97316',
          order: 2,
        },
      ],
      fields: [
        {
          id: 'field-1',
          signerId: 'signer-1',
          type: 'SIGNATURE',
          pageNumber: 8,
          x: 10,
          y: 70,
          width: 20,
          height: 6,
          required: true,
          value: 'signed',
          signedAt: '2024-11-17T00:00:00Z',
        },
        {
          id: 'field-2',
          signerId: 'signer-1',
          type: 'DATE',
          pageNumber: 8,
          x: 35,
          y: 70,
          width: 15,
          height: 4,
          required: true,
          value: '2024-11-17',
          signedAt: '2024-11-17T00:00:00Z',
        },
        {
          id: 'field-3',
          signerId: 'signer-2',
          type: 'SIGNATURE',
          pageNumber: 8,
          x: 55,
          y: 70,
          width: 20,
          height: 6,
          required: true,
        },
        {
          id: 'field-4',
          signerId: 'signer-2',
          type: 'DATE',
          pageNumber: 8,
          x: 80,
          y: 70,
          width: 15,
          height: 4,
          required: true,
        },
      ],
    };

    return NextResponse.json(mockDocument);
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
    const { documentId } = await params;
    const body = await request.json();

    // TODO: Update in database
    // For now, return success
    return NextResponse.json({
      id: documentId,
      ...body,
      updatedAt: new Date().toISOString(),
    });
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
    const { documentId } = await params;

    // TODO: Delete from database
    // For now, return success
    return NextResponse.json({ success: true, deletedId: documentId });
  } catch (error) {
    console.error('Error deleting E-Sign document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
