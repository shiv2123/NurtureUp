import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createMilestoneSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string(),
  category: z.enum(['first', 'achievement', 'memory', 'quote']),
  childrenIds: z.array(z.string()),
  tags: z.array(z.string()).optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.familyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const childId = searchParams.get('childId')

    const whereClause: {
      familyId: string
      childrenIds?: { has: string }
    } = {
      familyId: session.user.familyId
    }

    if (childId) {
      whereClause.childrenIds = {
        has: childId
      }
    }

    const [milestones, total] = await Promise.all([
      prisma.milestone.findMany({
        where: whereClause,
        orderBy: { date: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.milestone.count({ where: whereClause })
    ])

    return NextResponse.json({
      milestones,
      total,
      hasMore: offset + limit < total
    })
  } catch (error) {
    console.error('Failed to fetch milestones:', error)
    return NextResponse.json(
      { error: 'Failed to fetch milestones' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.familyId || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createMilestoneSchema.parse(body)

    const milestone = await prisma.milestone.create({
      data: {
        ...validatedData,
        familyId: session.user.familyId,
        date: new Date(validatedData.date)
      }
    })

    return NextResponse.json(milestone, { status: 201 })
  } catch (error) {
    console.error('Failed to create milestone:', error)
    return NextResponse.json(
      { error: 'Failed to create milestone' },
      { status: 500 }
    )
  }
} 