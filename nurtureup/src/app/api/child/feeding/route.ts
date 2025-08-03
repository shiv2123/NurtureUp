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

    const feedingLogs = await prisma.feedingLog.findMany({
      where: { childId },
      orderBy: { startTime: 'desc' },
      take: limit,
    })

    // Get today's stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayFeedings = await prisma.feedingLog.findMany({
      where: {
        childId,
        startTime: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    const stats = {
      totalFeedings: todayFeedings.length,
      totalAmount: todayFeedings.reduce((sum, log) => sum + (log.amount || 0), 0),
      lastFeeding: feedingLogs[0] || null,
      averageInterval: null as number | null
    }

    // Calculate average interval between feedings
    if (feedingLogs.length > 1) {
      const intervals = []
      for (let i = 0; i < feedingLogs.length - 1; i++) {
        const interval = feedingLogs[i].startTime.getTime() - feedingLogs[i + 1].startTime.getTime()
        intervals.push(interval / (1000 * 60 * 60)) // Convert to hours
      }
      stats.averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
    }

    return NextResponse.json({
      feedingLogs,
      stats
    })
  } catch (error) {
    console.error('Error fetching feeding logs:', error)
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
    const { childId, type, amount, duration, notes, startTime, endTime } = body

    if (!childId || !type) {
      return NextResponse.json({ error: 'Child ID and feeding type required' }, { status: 400 })
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

    const feedingLog = await prisma.feedingLog.create({
      data: {
        childId,
        type,
        amount: amount ? parseFloat(amount) : null,
        duration: duration ? parseInt(duration) : null,
        notes,
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : null,
      }
    })

    return NextResponse.json(feedingLog, { status: 201 })
  } catch (error) {
    console.error('Error creating feeding log:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}