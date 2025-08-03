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
    const limit = parseInt(searchParams.get('limit') || '20')
    
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

    const pottyLogs = await prisma.pottyLog.findMany({
      where: { childId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    })

    // Get today's stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayLogs = await prisma.pottyLog.findMany({
      where: {
        childId,
        timestamp: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    const stats = {
      totalAttempts: todayLogs.filter(log => log.type === 'attempt').length,
      successfulAttempts: todayLogs.filter(log => log.type === 'success').length,
      accidents: todayLogs.filter(log => log.type === 'accident').length,
      stickersEarned: todayLogs.filter(log => log.type === 'success').length,
      lastAttempt: pottyLogs.find(log => log.type === 'attempt') || null,
      successRate: null as number | null
    }

    // Calculate success rate
    if (stats.totalAttempts > 0) {
      stats.successRate = Math.round((stats.successfulAttempts / stats.totalAttempts) * 100)
    }

    return NextResponse.json({
      logs: pottyLogs,
      stats
    })
  } catch (error) {
    console.error('Error fetching potty logs:', error)
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
    const { childId, type, notes, timestamp } = body

    if (!childId || !type) {
      return NextResponse.json({ error: 'Child ID and type required' }, { status: 400 })
    }

    if (!['attempt', 'success', 'accident'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Must be attempt, success, or accident' }, { status: 400 })
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

    const pottyLog = await prisma.pottyLog.create({
      data: {
        childId,
        type,
        notes: notes || null,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        loggedById: session.user.id
      }
    })

    // If it's a success, potentially award stars or achievements
    if (type === 'success') {
      // TODO: Implement achievement system integration
      console.log(`🌟 Potty success for child ${childId}!`)
    }

    return NextResponse.json(pottyLog, { status: 201 })
  } catch (error) {
    console.error('Error creating potty log:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}