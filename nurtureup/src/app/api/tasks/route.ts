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

    const tasks = await prisma.task.findMany({
      where: {
        familyId: session.user.familyId,
        isActive: true
      },
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

    return NextResponse.json(tasks)
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

    const parent = await prisma.parent.findUnique({
      where: { userId: session.user.id }
    })

    if (!parent) {
      return NextResponse.json({ error: 'Parent profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = createTaskSchema.parse(body)

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

    const task = await prisma.task.create({
      data: {
        ...validatedData,
        familyId: session.user.familyId,
        createdById: parent.id,
        recurringRule: validatedData.recurringRule ? JSON.stringify(validatedData.recurringRule) : undefined,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined
      }
    })

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
    } else {
      // Task assigned to specific child
      const child = await prisma.child.findUnique({
        where: { id: validatedData.assignedToId },
        include: { user: true }
      })
      
      if (child) {
        // Send real-time notification to specific child
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