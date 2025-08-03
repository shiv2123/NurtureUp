import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { pusherServer } from '@/lib/pusher'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, data, familyId } = await request.json()

    if (!type || !familyId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify user belongs to the family
    if (session.user.familyId !== familyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const syncEvent = {
      type,
      data,
      timestamp: new Date(),
      userId: session.user.id,
      familyId
    }

    // Emit to family sync channel if Pusher is configured
    if (pusherServer) {
      await pusherServer.trigger(`family-${familyId}-sync`, 'sync_event', syncEvent)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to emit sync event:', error)
    return NextResponse.json(
      { error: 'Failed to emit sync event' },
      { status: 500 }
    )
  }
}