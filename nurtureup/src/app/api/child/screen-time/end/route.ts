import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'CHILD') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { minutesUsed } = await request.json()

    if (!minutesUsed || minutesUsed < 0) {
      return NextResponse.json({ error: 'Invalid minutes used' }, { status: 400 })
    }

    const child = await prisma.child.findUnique({
      where: { userId: session.user.id }
    })

    if (!child) {
      return NextResponse.json({ error: 'Child profile not found' }, { status: 404 })
    }

    // Update used screen time
    const updatedChild = await prisma.child.update({
      where: { id: child.id },
      data: {
        usedScreenMinutes: {
          increment: minutesUsed
        }
      }
    })

    // Calculate remaining time
    const totalAvailable = updatedChild.dailyScreenMinutes + updatedChild.bonusScreenMinutes
    const remainingMinutes = Math.max(0, totalAvailable - updatedChild.usedScreenMinutes)

    // Optional: Log the screen time session for analytics
    // You could create a ScreenTimeSession model to track individual sessions
    
    return NextResponse.json({
      dailyLimit: updatedChild.dailyScreenMinutes,
      bonusMinutes: updatedChild.bonusScreenMinutes,
      usedToday: updatedChild.usedScreenMinutes,
      lastReset: updatedChild.lastScreenReset.toISOString(),
      isActive: false,
      remainingMinutes,
      sessionEnded: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error ending screen time session:', error)
    return NextResponse.json(
      { error: 'Failed to end screen time session' },
      { status: 500 }
    )
  }
}