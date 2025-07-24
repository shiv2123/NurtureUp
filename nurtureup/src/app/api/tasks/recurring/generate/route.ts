import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { RecurringTaskService } from '@/lib/recurringTaskService'

export async function POST(request: NextRequest) {
  try {
    // This endpoint can be called by:
    // 1. Admin users (for testing)
    // 2. Cron jobs/scheduled tasks (with API key)
    // 3. System processes
    
    const session = await getServerSession(authOptions)
    const apiKey = request.headers.get('x-api-key')
    
    // Check authorization
    const isAuthorized = session?.user.role === 'PARENT' || apiKey === process.env.RECURRING_TASKS_API_KEY
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recurringTaskService = RecurringTaskService.getInstance()
    const result = await recurringTaskService.triggerRecurringTaskGeneration()

    return NextResponse.json({
      success: true,
      message: `Generated ${result.created} recurring task instances`,
      ...result
    })
  } catch (error) {
    console.error('Failed to generate recurring tasks:', error)
    return NextResponse.json(
      { error: 'Failed to generate recurring tasks' },
      { status: 500 }
    )
  }
}

// GET endpoint to check upcoming recurring tasks
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user.familyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const days = parseInt(url.searchParams.get('days') || '7')

    const recurringTaskService = RecurringTaskService.getInstance()
    const upcomingTasks = await recurringTaskService.getUpcomingRecurringTasks(
      session.user.familyId,
      days
    )

    return NextResponse.json(upcomingTasks)
  } catch (error) {
    console.error('Failed to fetch upcoming recurring tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch upcoming recurring tasks' },
      { status: 500 }
    )
  }
}