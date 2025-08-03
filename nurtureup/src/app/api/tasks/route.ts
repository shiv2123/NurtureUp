import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { RecurringTaskService } from '@/lib/recurringTaskService'
import { sendNotificationToRole, sendNotificationToUser } from '@/lib/pusher'
import { z } from 'zod'

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.number().min(1).max(5),
  starValue: z.number().min(1),
  assignedToId: z.string().optional(),
  isRecurring: z.boolean(),
  recurringRule: z.object({
    type: z.enum(['daily', 'weekly', 'custom']),
    interval: z.number().optional(),
    days: z.array(z.number().min(0).max(6)).optional(),
    time: z.string().optional(),
    endDate: z.string().optional()
  }).optional(),
  requiresProof: z.boolean(),
  dueDate: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.familyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filterType = searchParams.get('filter') || 'active'

    // Build where clause based on filter type
    let whereClause: any = {
      familyId: session.user.familyId
    }

    switch (filterType) {
      case 'active':
        whereClause.isActive = true
        break
      case 'scheduled':
        whereClause.isActive = true
        whereClause.dueDate = { gt: new Date() }
        break
      case 'completed':
        // Show tasks that have been completed today
        whereClause.completions = {
          some: {
            completedAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }
        break
      case 'archived':
        whereClause.isActive = false
        break
      default:
        whereClause.isActive = true
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assignedTo: {
          include: { user: true }
        },
        completions: {
          where: {
            completedAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ tasks, count: tasks.length, filter: filterType })
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user.familyId || session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Looking for parent with userId:', session.user.id)
    const parent = await prisma.parent.findUnique({
      where: { userId: session.user.id }
    })
    console.log('Found parent:', parent)

    if (!parent) {
      return NextResponse.json({ error: 'Parent profile not found' }, { status: 404 })
    }

    const body = await request.json()
    console.log('Received task data:', body)
    
    let validatedData
    try {
      validatedData = createTaskSchema.parse(body)
      console.log('Validated task data:', validatedData)
    } catch (validationError) {
      console.error('Task validation error:', validationError)
      return NextResponse.json(
        { error: 'Invalid task data provided', details: validationError },
        { status: 400 }
      )
    }

    // Validate recurring rule if provided
    if (validatedData.isRecurring && validatedData.recurringRule) {
      const recurringTaskService = RecurringTaskService.getInstance()
      const ruleValidation = recurringTaskService.validateRecurringRule(validatedData.recurringRule)
      
      if (!ruleValidation.isValid) {
        return NextResponse.json(
          { error: ruleValidation.error },
          { status: 400 }
        )
      }
    }

    let task
    try {
      task = await prisma.task.create({
        data: {
          ...validatedData,
          familyId: session.user.familyId,
          createdById: parent.id,
          recurringRule: validatedData.recurringRule ? JSON.stringify(validatedData.recurringRule) : undefined,
          dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined
        }
      })
    } catch (dbError) {
      console.error('Database error creating task:', dbError)
      return NextResponse.json(
        { error: 'Database error creating task' },
        { status: 500 }
      )
    }

    // If not assigned to specific child, assign to all children
    if (!validatedData.assignedToId) {
      const children = await prisma.child.findMany({
        where: { familyId: session.user.familyId },
        include: { user: true }
      })

      // Create tasks for each child
      const createdTasks = []
      for (const child of children) {
        const childTask = await prisma.task.create({
          data: {
            ...validatedData,
            familyId: session.user.familyId,
            createdById: parent.id,
            assignedToId: child.id,
            recurringRule: validatedData.recurringRule ? JSON.stringify(validatedData.recurringRule) : undefined,
            dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined
          }
        })
        createdTasks.push(childTask)
        
        // Send real-time notification to child about new task
        await sendNotificationToUser(child.userId, session.user.familyId, {
          type: 'new_task',
          title: 'New Quest Available!',
          message: `New quest "${validatedData.title}" is ready for you! ⭐ ${validatedData.starValue}`,
          data: {
            taskId: childTask.id,
            taskTitle: validatedData.title,
            starValue: validatedData.starValue,
            isNewTask: true
          }
        })
      }
      
      // Also notify all children via role channel
      try {
        await sendNotificationToRole(session.user.familyId, 'CHILD', {
          type: 'new_task',
          title: 'New Quest Available!',
          message: `New quest "${validatedData.title}" is ready! ⭐ ${validatedData.starValue}`,
          data: {
            taskTitle: validatedData.title,
            starValue: validatedData.starValue,
            isNewTask: true,
            refreshQuests: true
          }
        })
      } catch (error) {
        console.warn('Failed to send notification to children:', error)
      }
    } else {
      // Task assigned to specific child
      const child = await prisma.child.findUnique({
        where: { id: validatedData.assignedToId },
        include: { user: true }
      })
      
      if (child) {
        // Send real-time notification to specific child
        try {
          await sendNotificationToUser(child.userId, session.user.familyId, {
            type: 'new_task',
            title: 'New Quest Available!',
            message: `New quest "${validatedData.title}" is ready for you! ⭐ ${validatedData.starValue}`,
            data: {
              taskId: task.id,
              taskTitle: validatedData.title,
              starValue: validatedData.starValue,
              isNewTask: true
            }
          })
        } catch (error) {
          console.warn('Failed to send notification to child:', error)
        }
      }
    }

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Failed to create task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
} 