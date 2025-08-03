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
    const lastSync = searchParams.get('lastSync')
    const childId = searchParams.get('childId')
    
    // Parse last sync timestamp
    const lastSyncDate = lastSync ? new Date(lastSync) : new Date(Date.now() - 24 * 60 * 60 * 1000)

    // Build sync data for all family members or specific child
    let whereClause: any = {
      familyId: session.user.familyId,
      updatedAt: { gt: lastSyncDate }
    }

    if (childId) {
      // Sync specific child data
      whereClause = {
        ...whereClause,
        OR: [
          { id: childId },
          { assignedToId: childId },
          { childId: childId }
        ]
      }
    }

    // Get updated tasks and completions
    const [updatedTasks, updatedCompletions] = await Promise.all([
      prisma.task.findMany({
        where: {
          familyId: session.user.familyId,
          updatedAt: { gt: lastSyncDate }
        },
        include: {
          assignedTo: { include: { user: { select: { name: true } } } },
          completions: {
            where: { completedAt: { gt: lastSyncDate } },
            include: { child: { include: { user: { select: { name: true } } } } }
          }
        }
      }),
      prisma.taskCompletion.findMany({
        where: {
          completedAt: { gt: lastSyncDate },
          child: { familyId: session.user.familyId }
        },
        include: {
          task: true,
          child: { include: { user: { select: { name: true } } } }
        }
      })
    ])

    // Get updated child activities (recent logs)
    const childActivities = await Promise.all([
      // Recent feeding logs
      prisma.feedingLog.findMany({
        where: {
          child: { familyId: session.user.familyId },
          createdAt: { gt: lastSyncDate }
        },
        include: { child: { include: { user: { select: { name: true } } } } },
        take: 20
      }),
      // Recent sleep logs
      prisma.sleepLog.findMany({
        where: {
          child: { familyId: session.user.familyId },
          createdAt: { gt: lastSyncDate }
        },
        include: { child: { include: { user: { select: { name: true } } } } },
        take: 20
      }),
      // Recent diaper logs
      prisma.diaperLog.findMany({
        where: {
          child: { familyId: session.user.familyId },
          createdAt: { gt: lastSyncDate }
        },
        include: { child: { include: { user: { select: { name: true } } } } },
        take: 20
      }),
      // Recent potty logs
      prisma.pottyLog.findMany({
        where: {
          child: { familyId: session.user.familyId },
          createdAt: { gt: lastSyncDate }
        },
        include: { child: { include: { user: { select: { name: true } } } } },
        take: 20
      }),
      // Recent screen time activities
      prisma.screenTimeLog.findMany({
        where: {
          child: { familyId: session.user.familyId },
          createdAt: { gt: lastSyncDate }
        },
        include: { child: { include: { user: { select: { name: true } } } } },
        take: 20
      }),
      // Recent learning activities
      prisma.learningScore.findMany({
        where: {
          child: { familyId: session.user.familyId },
          createdAt: { gt: lastSyncDate }
        },
        include: { child: { include: { user: { select: { name: true } } } } },
        take: 20
      }),
      // Recent mood entries
      prisma.moodEntry.findMany({
        where: {
          child: { familyId: session.user.familyId },
          createdAt: { gt: lastSyncDate }
        },
        include: { child: { include: { user: { select: { name: true } } } } },
        take: 20
      }),
      // Recent financial transactions
      prisma.financialTransaction.findMany({
        where: {
          child: { familyId: session.user.familyId },
          createdAt: { gt: lastSyncDate }
        },
        include: { child: { include: { user: { select: { name: true } } } } },
        take: 20
      })
    ])

    // Get newly earned badges
    const newBadges = await prisma.badgeEarned.findMany({
      where: {
        earnedAt: { gt: lastSyncDate },
        child: { familyId: session.user.familyId }
      },
      include: {
        badge: true,
        child: { include: { user: { select: { name: true } } } }
      }
    })

    // Get updated child stats
    const children = await prisma.child.findMany({
      where: {
        familyId: session.user.familyId,
        updatedAt: { gt: lastSyncDate }
      },
      include: { user: { select: { name: true } } }
    })

    // Format sync response
    const syncData = {
      timestamp: new Date().toISOString(),
      lastSyncRequested: lastSyncDate.toISOString(),
      updates: {
        tasks: updatedTasks,
        taskCompletions: updatedCompletions,
        childActivities: {
          feeding: childActivities[0],
          sleep: childActivities[1],
          diaper: childActivities[2],
          potty: childActivities[3],
          screenTime: childActivities[4],
          learning: childActivities[5],
          mood: childActivities[6],
          financial: childActivities[7]
        },
        badges: newBadges,
        children: children
      },
      summary: {
        totalUpdates: updatedTasks.length + updatedCompletions.length + newBadges.length + children.length,
        taskUpdates: updatedTasks.length,
        newCompletions: updatedCompletions.length,
        newBadges: newBadges.length,
        childUpdates: children.length,
        activityUpdates: childActivities.reduce((sum, activities) => sum + activities.length, 0)
      }
    }

    return NextResponse.json(syncData)
  } catch (error) {
    console.error('Error during sync:', error)
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
    const { action, data, childId } = body

    if (action === 'mark_notifications_read') {
      // Mark notifications as read for a specific child or family
      // This would be implemented when we have a notifications system
      return NextResponse.json({ message: 'Notifications marked as read' })
    }

    if (action === 'update_child_status') {
      // Update child's online/activity status
      if (!childId) {
        return NextResponse.json({ error: 'Child ID required' }, { status: 400 })
      }

      const child = await prisma.child.findFirst({
        where: {
          id: childId,
          familyId: session.user.familyId
        }
      })

      if (!child) {
        return NextResponse.json({ error: 'Child not found' }, { status: 404 })
      }

      // Update child's last activity timestamp
      await prisma.child.update({
        where: { id: childId },
        data: { updatedAt: new Date() }
      })

      return NextResponse.json({ message: 'Child status updated' })
    }

    if (action === 'trigger_sync') {
      // Trigger a sync event for real-time updates
      // This could trigger webhooks, push notifications, or WebSocket events
      const syncEvent = {
        familyId: session.user.familyId,
        triggeredBy: session.user.id,
        timestamp: new Date().toISOString(),
        data
      }

      // TODO: Implement real-time sync mechanism (WebSockets, Server-Sent Events, etc.)
      console.log('Sync event triggered:', syncEvent)

      return NextResponse.json({ 
        message: 'Sync event triggered',
        event: syncEvent 
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing sync request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}