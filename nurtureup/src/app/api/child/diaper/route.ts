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

    const diaperLogs = await prisma.diaperLog.findMany({
      where: { childId },
      orderBy: { changedAt: 'desc' },
      take: limit,
    })

    // Get today's stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayChanges = await prisma.diaperLog.findMany({
      where: {
        childId,
        changedAt: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    const stats = {
      totalChanges: todayChanges.length,
      wetChanges: todayChanges.filter(log => log.type === 'wet' || log.type === 'both').length,
      dirtyChanges: todayChanges.filter(log => log.type === 'dirty' || log.type === 'both').length,
      lastChange: diaperLogs[0] || null,
      averageInterval: null as number | null
    }

    // Calculate average interval between changes
    if (diaperLogs.length > 1) {
      const intervals = []
      for (let i = 0; i < diaperLogs.length - 1; i++) {
        const interval = diaperLogs[i].changedAt.getTime() - diaperLogs[i + 1].changedAt.getTime()
        intervals.push(interval / (1000 * 60 * 60)) // Convert to hours
      }
      stats.averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
    }

    return NextResponse.json({
      diaperLogs,
      stats
    })
  } catch (error) {
    console.error('Error fetching diaper logs:', error)
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
    const { childId, type, notes, changedAt } = body

    if (!childId || !type) {
      return NextResponse.json({ error: 'Child ID and diaper type required' }, { status: 400 })
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

    const diaperLog = await prisma.diaperLog.create({
      data: {
        childId,
        type,
        notes,
        changedAt: changedAt ? new Date(changedAt) : new Date(),
      }
    })

    return NextResponse.json(diaperLog, { status: 201 })
  } catch (error) {
    console.error('Error creating diaper log:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}