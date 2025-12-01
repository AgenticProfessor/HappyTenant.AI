import { NextRequest, NextResponse } from 'next/server';
import { addSignerSchema, SIGNER_COLORS } from '@/lib/schemas/esign';

/**
 * GET /api/esign/[documentId]/signers
 * Get all signers for a document
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;

    // TODO: Fetch from database
    const mockSigners = [
      {
        id: 'signer-1',
        documentId,
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        role: 'TENANT',
        status: 'PENDING',
        order: 1,
        color: SIGNER_COLORS[0],
      },
    ];

    return NextResponse.json({ signers: mockSigners });
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

    // TODO: Add to database
    const newSigner = {
      id: `signer-${Date.now()}`,
      documentId,
      ...data,
      status: 'PENDING',
      order: data.order || 1,
      color: SIGNER_COLORS[0],
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(newSigner, { status: 201 });
  } catch (error) {
    console.error('Error adding signer:', error);
    return NextResponse.json(
      { error: 'Failed to add signer' },
      { status: 500 }
    );
  }
}
