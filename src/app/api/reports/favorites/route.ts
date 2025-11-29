import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const favoriteSchema = z.object({
  reportType: z.string().min(1, 'Report type is required'),
});

// POST /api/reports/favorites - Add a report to favorites
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reportType } = favoriteSchema.parse(body);

    // Check if already a favorite
    const existing = await prisma.userReportFavorite.findUnique({
      where: {
        userId_reportType: {
          userId,
          reportType,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        isFavorite: true,
        message: 'Already in favorites',
      });
    }

    // Add to favorites
    await prisma.userReportFavorite.create({
      data: {
        userId,
        reportType,
      },
    });

    return NextResponse.json({
      success: true,
      isFavorite: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

// DELETE /api/reports/favorites - Remove a report from favorites
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reportType } = favoriteSchema.parse(body);

    // Delete the favorite
    await prisma.userReportFavorite.delete({
      where: {
        userId_reportType: {
          userId,
          reportType,
        },
      },
    });

    return NextResponse.json({
      success: true,
      isFavorite: false,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      );
    }

    // If not found, still return success
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json({
        success: true,
        isFavorite: false,
        message: 'Was not in favorites',
      });
    }

    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}

// GET /api/reports/favorites - Get all favorites for the user
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const favorites = await prisma.userReportFavorite.findMany({
      where: { userId },
      select: { reportType: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      favorites: favorites.map((f) => f.reportType),
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}
