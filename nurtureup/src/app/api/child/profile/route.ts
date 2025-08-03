import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'CHILD') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const child = await prisma.child.findUnique({
      where: { userId: session.user.id },
      include: {
        user: true,
        earnedBadges: {
          include: { badge: true },
          orderBy: { earnedAt: 'desc' },
          take: 10
        },
        pet: true
      }
    })

    if (!child) {
      return NextResponse.json({ error: 'Child profile not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: child.id,
      nickname: child.nickname,
      avatar: child.avatar,
      totalStars: child.totalStars,
      currentCoins: child.currentCoins,
      currentStreak: child.currentStreak,
      dailyScreenMinutes: child.dailyScreenMinutes,
      bonusScreenMinutes: child.bonusScreenMinutes,
      usedScreenMinutes: child.usedScreenMinutes,
      lastScreenReset: child.lastScreenReset,
      earnedBadges: child.earnedBadges,
      pet: child.pet
    })
  } catch (error) {
    console.error('Failed to fetch child profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch child profile' },
      { status: 500 }
    )
  }
}