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

    // Get today's screen time data
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const screenTimeLogs = await prisma.screenTimeLog.findMany({
      where: {
        childId,
        timestamp: {
          gte: today,
          lt: tomorrow
        }
      },
      orderBy: { timestamp: 'desc' }
    })

    // Calculate total screen time used today
    const totalMinutesUsed = screenTimeLogs.reduce((total, log) => {
      if (log.type === 'session_end' && log.durationMinutes) {
        return total + log.durationMinutes
      }
      return total
    }, 0)

    // Get current child limits and settings
    const dailyLimit = child.dailyScreenMinutes
    const bonusMinutes = child.bonusScreenMinutes
    const totalAllowedMinutes = dailyLimit + bonusMinutes

    // Check for any active sessions
    const activeSession = screenTimeLogs.find(log => 
      log.type === 'session_start' && 
      !screenTimeLogs.some(endLog => 
        endLog.type === 'session_end' && 
        endLog.sessionId === log.sessionId
      )
    )

    const stats = {
      totalMinutesUsed,
      dailyLimit,
      bonusMinutes,
      totalAllowedMinutes,
      remainingMinutes: Math.max(0, totalAllowedMinutes - totalMinutesUsed),
      percentageUsed: Math.round((totalMinutesUsed / totalAllowedMinutes) * 100),
      hasActiveSession: !!activeSession,
      activeSessionStart: activeSession?.timestamp || null,
      isOverLimit: totalMinutesUsed >= totalAllowedMinutes,
      warningThreshold: Math.round(totalAllowedMinutes * 0.8), // 80% warning
      isNearLimit: totalMinutesUsed >= Math.round(totalAllowedMinutes * 0.8)
    }

    // Get weekly pattern (last 7 days)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const weeklyLogs = await prisma.screenTimeLog.findMany({
      where: {
        childId,
        timestamp: {
          gte: weekAgo,
          lt: tomorrow
        },
        type: 'session_end'
      },
      orderBy: { timestamp: 'asc' }
    })

    // Group by day for weekly pattern
    const weeklyPattern = []
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(today)
      dayStart.setDate(dayStart.getDate() - (6 - i))
      dayStart.setHours(0, 0, 0, 0)
      
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)
      
      const dayLogs = weeklyLogs.filter(log => {
        const logDate = new Date(log.timestamp)
        return logDate >= dayStart && logDate < dayEnd
      })
      
      const dayTotal = dayLogs.reduce((sum, log) => sum + (log.durationMinutes || 0), 0)
      
      weeklyPattern.push({
        date: dayStart.toISOString().split('T')[0],
        dayName: dayStart.toLocaleDateString('en', { weekday: 'short' }),
        minutes: dayTotal,
        isToday: i === 6
      })
    }

    return NextResponse.json({
      logs: screenTimeLogs,
      stats,
      weeklyPattern
    })
  } catch (error) {
    console.error('Error fetching screen time:', error)
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
    const { childId, type, app, durationMinutes, sessionId, notes } = body

    if (!childId || !type) {
      return NextResponse.json({ error: 'Child ID and type required' }, { status: 400 })
    }

    if (!['session_start', 'session_end', 'limit_warning', 'limit_exceeded'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
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

    const screenTimeLog = await prisma.screenTimeLog.create({
      data: {
        childId,
        type,
        app: app || null,
        durationMinutes: durationMinutes || null,
        sessionId: sessionId || null,
        notes: notes || null,
        timestamp: new Date()
      }
    })

    // If session ends, update child's daily totals and check for limit exceeded
    if (type === 'session_end' && durationMinutes) {
      // Calculate today's total usage
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const todayLogs = await prisma.screenTimeLog.findMany({
        where: {
          childId,
          type: 'session_end',
          timestamp: {
            gte: today,
            lt: tomorrow
          }
        }
      })

      const totalUsed = todayLogs.reduce((sum, log) => sum + (log.durationMinutes || 0), 0)
      const totalAllowed = child.dailyScreenMinutes + child.bonusScreenMinutes

      // Check if limit exceeded and notify parent
      if (totalUsed >= totalAllowed) {
        // TODO: Send notification to parent about limit exceeded
        console.log(`Screen time limit exceeded for child ${childId}: ${totalUsed}/${totalAllowed} minutes`)
      }
    }

    return NextResponse.json(screenTimeLog, { status: 201 })
  } catch (error) {
    console.error('Error logging screen time:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH endpoint for adjusting limits (parent use)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.familyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { childId, dailyLimit, bonusMinutes, action } = body

    if (!childId) {
      return NextResponse.json({ error: 'Child ID required' }, { status: 400 })
    }

    // Verify child belongs to family and user is parent
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        familyId: session.user.familyId
      }
    })

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    let updateData: any = {}

    if (action === 'grant_bonus' && bonusMinutes) {
      updateData.bonusScreenMinutes = child.bonusScreenMinutes + bonusMinutes
    } else if (action === 'set_limit' && dailyLimit) {
      updateData.dailyScreenMinutes = dailyLimit
    } else if (action === 'reset_bonus') {
      updateData.bonusScreenMinutes = 0
    }

    const updatedChild = await prisma.child.update({
      where: { id: childId },
      data: updateData
    })

    return NextResponse.json({
      dailyLimit: updatedChild.dailyScreenMinutes,
      bonusMinutes: updatedChild.bonusScreenMinutes,
      totalAllowed: updatedChild.dailyScreenMinutes + updatedChild.bonusScreenMinutes
    })
  } catch (error) {
    console.error('Error updating screen time limits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}