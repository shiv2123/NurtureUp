import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.familyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')
    const status = searchParams.get('status') // 'active', 'completed', 'overdue'
    const limit = parseInt(searchParams.get('limit') || '50')
    
    if (!childId) {
      return NextResponse.json({ error: 'Child ID required' }, { status: 400 })
    }

    // Verify child belongs to family
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        familyId: session.user.familyId
      }
    })

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    // Build where clause based on status
    const now = new Date()
    let whereClause: any = {
      childId,
      category: 'homework'
    }

    if (status === 'active') {
      whereClause.isActive = true
      whereClause.dueDate = { gte: now }
    } else if (status === 'completed') {
      whereClause.completions = { some: {} }
    } else if (status === 'overdue') {
      whereClause.isActive = true
      whereClause.dueDate = { lt: now }
      whereClause.completions = { none: {} }
    }

    const homework = await prisma.task.findMany({
      where: whereClause,
      include: {
        completions: {
          include: { child: { include: { user: true } } }
        },
        assignedToChild: { include: { user: true } }
      },
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit
    })

    // Calculate stats
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart)
    todayEnd.setDate(todayEnd.getDate() + 1)

    const [totalActive, totalCompleted, todayDue, overdue, streakData] = await Promise.all([
      prisma.task.count({
        where: {
          childId,
          category: 'homework',
          isActive: true,
          dueDate: { gte: now }
        }
      }),
      prisma.task.count({
        where: {
          childId,
          category: 'homework',
          completions: { some: {} }
        }
      }),
      prisma.task.count({
        where: {
          childId,
          category: 'homework',
          isActive: true,
          dueDate: { gte: todayStart, lt: todayEnd }
        }
      }),
      prisma.task.count({
        where: {
          childId,
          category: 'homework',
          isActive: true,
          dueDate: { lt: now },
          completions: { none: {} }
        }
      }),
      // Calculate streak (consecutive days with homework completed)
      prisma.taskCompletion.findMany({
        where: {
          child: { id: childId },
          task: { category: 'homework' },
          completedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        orderBy: { completedAt: 'desc' },
        select: { completedAt: true }
      })
    ])

    // Calculate homework streak
    let currentStreak = 0
    if (streakData.length > 0) {
      const completionDates = new Set(
        streakData.map(c => c.completedAt.toISOString().split('T')[0])
      )
      
      let checkDate = new Date()
      while (completionDates.has(checkDate.toISOString().split('T')[0])) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      }
    }

    const stats = {
      totalActive,
      totalCompleted,
      todayDue,
      overdue,
      currentStreak,
      completionRate: totalActive > 0 ? Math.round((totalCompleted / (totalCompleted + totalActive)) * 100) : 100
    }

    // Group homework by due date for UI
    const groupedHomework = homework.reduce((groups: any, hw) => {
      const dueDate = hw.dueDate?.toISOString().split('T')[0] || 'no-date'
      if (!groups[dueDate]) {
        groups[dueDate] = []
      }
      groups[dueDate].push(hw)
      return groups
    }, {})

    return NextResponse.json({
      homework,
      groupedHomework,
      stats
    })
  } catch (error) {
    console.error('Error fetching homework:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.familyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      childId, 
      title, 
      subject, 
      description, 
      dueDate, 
      priority = 'medium',
      starValue = 2,
      notes 
    } = body

    if (!childId || !title || !subject) {
      return NextResponse.json({ 
        error: 'Child ID, title, and subject required' 
      }, { status: 400 })
    }

    // Verify child belongs to family
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        familyId: session.user.familyId
      }
    })

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    const homework = await prisma.task.create({
      data: {
        title,
        description: description || `${subject} homework: ${title}`,
        category: 'homework',
        priority,
        starValue,
        familyId: session.user.familyId!,
        createdById: session.user.id,
        childId,
        dueDate: dueDate ? new Date(dueDate) : null,
        metadata: JSON.stringify({ 
          subject,
          notes: notes || null
        }),
        isActive: true
      },
      include: {
        assignedToChild: { include: { user: true } }
      }
    })

    return NextResponse.json(homework, { status: 201 })
  } catch (error) {
    console.error('Error creating homework:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.familyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, action, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Homework ID required' }, { status: 400 })
    }

    // Find and verify homework belongs to family
    const homework = await prisma.task.findFirst({
      where: {
        id,
        familyId: session.user.familyId,
        category: 'homework'
      }
    })

    if (!homework) {
      return NextResponse.json({ error: 'Homework not found' }, { status: 404 })
    }

    let updatedHomework

    if (action === 'complete') {
      // Mark as completed
      const completion = await prisma.taskCompletion.create({
        data: {
          taskId: id,
          childId: homework.childId!,
          completedAt: new Date(),
          isApproved: false // Requires parent approval
        }
      })

      updatedHomework = await prisma.task.findFirst({
        where: { id },
        include: {
          completions: true,
          assignedToChild: { include: { user: true } }
        }
      })
    } else {
      // Regular update
      updatedHomework = await prisma.task.update({
        where: { id },
        data: updateData,
        include: {
          completions: true,
          assignedToChild: { include: { user: true } }
        }
      })
    }

    return NextResponse.json(updatedHomework)
  } catch (error) {
    console.error('Error updating homework:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.familyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Homework ID required' }, { status: 400 })
    }

    // Find and verify homework belongs to family
    const homework = await prisma.task.findFirst({
      where: {
        id,
        familyId: session.user.familyId,
        category: 'homework'
      }
    })

    if (!homework) {
      return NextResponse.json({ error: 'Homework not found' }, { status: 404 })
    }

    // Soft delete by setting isActive to false
    await prisma.task.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Homework deleted successfully' })
  } catch (error) {
    console.error('Error deleting homework:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}