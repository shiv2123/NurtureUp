import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.familyId || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all children in the family
    const children = await prisma.child.findMany({
      where: { familyId: session.user.familyId },
      select: {
        id: true,
        nickname: true,
        avatar: true,
        currentStreak: true,
        longestStreak: true,
        assignedTasks: {
          select: { id: true }
        },
        completedTasks: {
          where: {
            completedAt: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30))
            }
          },
          select: { completedAt: true }
        },
        learningScores: {
          orderBy: { completedAt: 'desc' },
          take: 5
        }
      }
    })

    return NextResponse.json({ children })
  } catch (error) {
    console.error('Failed to fetch progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
} 