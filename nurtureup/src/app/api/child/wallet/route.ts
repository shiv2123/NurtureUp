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

    const child = await prisma.child.findUnique({
      where: { userId: session.user.id },
      select: {
        totalStars: true,
        currentCoins: true
      }
    })

    if (!child) {
      return NextResponse.json({ error: 'Child profile not found' }, { status: 404 })
    }

    // Placeholder for savings goals
    const savingsGoals: Array<{
      id: string
      rewardId: string
      targetCoins: number
      savedCoins: number
    }> = []

    return NextResponse.json({
      stars: child.totalStars,
      coins: child.currentCoins,
      savingsGoals
    })
  } catch (error) {
    console.error('Failed to fetch wallet:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallet' },
      { status: 500 }
    )
  }
} 