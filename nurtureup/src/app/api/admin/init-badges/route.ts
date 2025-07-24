import { NextResponse } from 'next/server'
import { BadgeService } from '@/lib/badgeService'

export async function POST() {
  try {
    await BadgeService.initializeDefaultBadges()
    return NextResponse.json({ message: 'Default badges initialized successfully' })
  } catch (error) {
    console.error('Failed to initialize badges:', error)
    return NextResponse.json(
      { error: 'Failed to initialize badges' },
      { status: 500 }
    )
  }
}