import { NextRequest, NextResponse } from 'next/server';
import { addFieldSchema } from '@/lib/schemas/esign';

/**
 * GET /api/esign/[documentId]/fields
 * Get all signature fields for a document
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;

    // TODO: Fetch from database
    const mockFields = [
      {
        id: 'field-1',
        documentId,
        signerId: 'signer-1',
        type: 'SIGNATURE',
        pageNumber: 1,
        x: 10,
        y: 80,
        width: 20,
        height: 6,
        required: true,
      },
    ];

    return NextResponse.json({ fields: mockFields });
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

    // TODO: Add to database
    const newField = {
      id: `field-${Date.now()}`,
      documentId,
      ...data,
      createdAt: new Date().toISOString(),
    };

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
 * Bulk update fields for a document
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;
    const body = await request.json();
    const { fields } = body;

    if (!Array.isArray(fields)) {
      return NextResponse.json(
        { error: 'Fields must be an array' },
        { status: 400 }
      );
    }

    // TODO: Update in database
    const updatedFields = fields.map((field: Record<string, unknown>, index: number) => ({
      id: `field-${index + 1}`,
      documentId,
      ...field,
      updatedAt: new Date().toISOString(),
    }));

    return NextResponse.json({ fields: updatedFields });
  } catch (error) {
    console.error('Error updating fields:', error);
    return NextResponse.json(
      { error: 'Failed to update fields' },
      { status: 500 }
    );
  }
}
