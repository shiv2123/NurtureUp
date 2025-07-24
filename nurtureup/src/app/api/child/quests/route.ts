import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'CHILD') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the child profile
    const child = await prisma.child.findUnique({
      where: { userId: session.user.id },
      include: {
        assignedTasks: {
          where: {
            isActive: true,
            OR: [
              { dueDate: null },
              {
                dueDate: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0)),
                  lt: new Date(new Date().setHours(23, 59, 59, 999))
                }
              }
            ]
          },
          include: {
            completions: {
              where: {
                childId: session.user.id,
                completedAt: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
              }
            }
          }
        }
      }
    })

    if (!child) {
      return NextResponse.json({ error: 'Child profile not found' }, { status: 404 })
    }

    // Only show tasks not yet completed today
    const quests = child.assignedTasks.filter(task => task.completions.length === 0)

    return NextResponse.json(quests)
  } catch (error) {
    console.error('Failed to fetch child quests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quests' },
      { status: 500 }
    )
  }
} 