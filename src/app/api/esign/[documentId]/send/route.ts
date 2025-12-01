import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/esign/[documentId]/send
 * Send the document for signatures
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;

    // TODO: Implement actual send logic
    // 1. Validate document has at least one signer and one field
    // 2. Upload file to storage if not already done
    // 3. Generate signing links for each signer
    // 4. Send emails to signers
    // 5. Update document status to PENDING_SIGNATURES

    // For now, simulate the send
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      documentId,
      status: 'PENDING_SIGNATURES',
      sentAt: new Date().toISOString(),
      message: 'Document sent successfully to all signers',
      signerEmails: [
        { email: 'sarah@example.com', status: 'sent' },
        { email: 'john@example.com', status: 'sent' },
      ],
    });
  } catch (error) {
    console.error('Error sending E-Sign document:', error);
    return NextResponse.json(
      { error: 'Failed to send document' },
      { status: 500 }
    );
  }
}
