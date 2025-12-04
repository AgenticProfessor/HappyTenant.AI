import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const noteSchema = z.object({
  content: z.string().min(1),
  isInternal: z.boolean().default(true),
})

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET /api/applications/[id]/notes - Get all notes for an application
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { userId, organizationId } = await auth()
    const { id } = await params

    if (!userId || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }


    // Verify application belongs to user's organization
    const application = await prisma.application.findFirst({
      where: {
        id,
        unit: {
          property: {
            organizationId: organizationId,
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const notes = await prisma.applicationNote.findMany({
      where: { applicationId: id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/applications/[id]/notes - Add a note to an application
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { userId, organizationId } = await auth()
    const { id } = await params

    if (!userId || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }


    // Verify application belongs to user's organization
    const application = await prisma.application.findFirst({
      where: {
        id,
        unit: {
          property: {
            organizationId: organizationId,
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const body = await request.json()
    const validationResult = noteSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { content, isInternal } = validationResult.data

    const note = await prisma.applicationNote.create({
      data: {
        applicationId: id,
        content,
        isInternal,
        userId,
      },
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
