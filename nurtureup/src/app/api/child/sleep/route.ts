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
    const limit = parseInt(searchParams.get('limit') || '10')
    
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

    const sleepLogs = await prisma.sleepLog.findMany({
      where: { childId },
      orderBy: { startTime: 'desc' },
      take: limit,
    })

    // Get today's stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todaySleep = await prisma.sleepLog.findMany({
      where: {
        childId,
        startTime: {
          gte: today,
          lt: tomorrow
        },
        duration: { not: null }
      }
    })

    const stats = {
      totalSleepTime: todaySleep.reduce((sum, log) => sum + (log.duration || 0), 0), // in minutes
      napCount: todaySleep.filter(log => log.type === 'nap').length,
      nightSleepCount: todaySleep.filter(log => log.type === 'night').length,
      lastSleep: sleepLogs[0] || null,
      averageSleepDuration: null as number | null
    }

    // Calculate average sleep duration
    const completedSleep = sleepLogs.filter(log => log.duration)
    if (completedSleep.length > 0) {
      stats.averageSleepDuration = completedSleep.reduce((sum, log) => sum + (log.duration || 0), 0) / completedSleep.length
    }

    return NextResponse.json({
      sleepLogs,
      stats
    })
  } catch (error) {
    console.error('Error fetching sleep logs:', error)
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
    const { childId, type, quality, notes, startTime, endTime } = body

    if (!childId || !type) {
      return NextResponse.json({ error: 'Child ID and sleep type required' }, { status: 400 })
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

    const startDateTime = startTime ? new Date(startTime) : new Date()
    const endDateTime = endTime ? new Date(endTime) : null
    
    // Calculate duration if both start and end times are provided
    let duration = null
    if (endDateTime) {
      duration = Math.round((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60)) // in minutes
    }

    const sleepLog = await prisma.sleepLog.create({
      data: {
        childId,
        type,
        quality,
        notes,
        startTime: startDateTime,
        endTime: endDateTime,
        duration,
      }
    })

    return NextResponse.json(sleepLog, { status: 201 })
  } catch (error) {
    console.error('Error creating sleep log:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH endpoint to end ongoing sleep session
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.familyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sleepLogId, endTime, quality, notes } = body

    if (!sleepLogId) {
      return NextResponse.json({ error: 'Sleep log ID required' }, { status: 400 })
    }

    const endDateTime = endTime ? new Date(endTime) : new Date()

    // Find the sleep log and verify it belongs to family
    const sleepLog = await prisma.sleepLog.findFirst({
      where: {
        id: sleepLogId,
        child: {
          familyId: session.user.familyId
        }
      },
      include: { child: true }
    })

    if (!sleepLog) {
      return NextResponse.json({ error: 'Sleep log not found' }, { status: 404 })
    }

    // Calculate duration
    const duration = Math.round((endDateTime.getTime() - sleepLog.startTime.getTime()) / (1000 * 60))

    const updatedSleepLog = await prisma.sleepLog.update({
      where: { id: sleepLogId },
      data: {
        endTime: endDateTime,
        duration,
        quality: quality || sleepLog.quality,
        notes: notes || sleepLog.notes,
      }
    })

    return NextResponse.json(updatedSleepLog)
  } catch (error) {
    console.error('Error updating sleep log:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}