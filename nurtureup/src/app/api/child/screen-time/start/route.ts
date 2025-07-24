import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'CHILD') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const child = await prisma.child.findUnique({
      where: { userId: session.user.id }
    })

    if (!child) {
      return NextResponse.json({ error: 'Child profile not found' }, { status: 404 })
    }

    // Check if daily reset is needed
    const now = new Date()
    const lastReset = new Date(child.lastScreenReset)
    const daysSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24))

    let updatedChild = child
    if (daysSinceReset >= 1) {
      // Reset daily screen time
      updatedChild = await prisma.child.update({
        where: { id: child.id },
        data: {
          usedScreenMinutes: 0,
          lastScreenReset: now
        }
      })
    }

    // Calculate available time
    const totalAvailable = updatedChild.dailyScreenMinutes + updatedChild.bonusScreenMinutes
    const remainingMinutes = totalAvailable - updatedChild.usedScreenMinutes

    if (remainingMinutes <= 0) {
      return NextResponse.json({ 
        error: 'No screen time remaining',
        remainingMinutes: 0
      }, { status: 400 })
    }

    // Create or update session tracking (you could store this in a sessions table)
    // For now, we'll just return the current state
    
    return NextResponse.json({
      dailyLimit: updatedChild.dailyScreenMinutes,
      bonusMinutes: updatedChild.bonusScreenMinutes,
      usedToday: updatedChild.usedScreenMinutes,
      lastReset: updatedChild.lastScreenReset.toISOString(),
      isActive: true,
      sessionStart: now.toISOString(),
      remainingMinutes
    })

  } catch (error) {
    console.error('Error starting screen time session:', error)
    return NextResponse.json(
      { error: 'Failed to start screen time session' },
      { status: 500 }
    )
  }
}