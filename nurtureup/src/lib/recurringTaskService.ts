import { prisma } from '@/lib/prisma'

// Recurring rule types
export interface RecurringRule {
  type: 'daily' | 'weekly' | 'custom'
  interval?: number // How often (e.g., every 2 days, every 3 weeks)
  days?: number[] // Days of week for weekly (0=Sunday, 6=Saturday) or specific days for custom
  time?: string // Optional specific time (HH:MM)
  endDate?: string // Optional end date for the recurring rule
}

export class RecurringTaskService {
  private static instance: RecurringTaskService

  private constructor() {}

  static getInstance(): RecurringTaskService {
    if (!RecurringTaskService.instance) {
      RecurringTaskService.instance = new RecurringTaskService()
    }
    return RecurringTaskService.instance
  }

  // Parse recurring rule from JSON string
  parseRecurringRule(ruleString: string): RecurringRule | null {
    try {
      return JSON.parse(ruleString) as RecurringRule
    } catch {
      return null
    }
  }

  // Calculate next due date based on recurring rule
  calculateNextDueDate(rule: RecurringRule, lastDueDate?: Date): Date {
    const now = new Date()
    const baseDate = lastDueDate || now

    switch (rule.type) {
      case 'daily':
        const nextDay = new Date(baseDate)
        nextDay.setDate(baseDate.getDate() + (rule.interval || 1))
        
        // Set specific time if provided
        if (rule.time) {
          const [hours, minutes] = rule.time.split(':').map(Number)
          nextDay.setHours(hours, minutes, 0, 0)
        }
        
        return nextDay

      case 'weekly':
        const nextWeek = new Date(baseDate)
        const currentDay = nextWeek.getDay()
        const targetDays = rule.days || [currentDay]
        
        // Find next occurrence of target days
        let daysToAdd = 1
        let found = false
        
        for (let i = 0; i < 14; i++) { // Check up to 2 weeks ahead
          const checkDate = new Date(baseDate)
          checkDate.setDate(baseDate.getDate() + i + 1)
          const dayOfWeek = checkDate.getDay()
          
          if (targetDays.includes(dayOfWeek)) {
            daysToAdd = i + 1
            found = true
            break
          }
        }
        
        nextWeek.setDate(baseDate.getDate() + daysToAdd)
        
        if (rule.time) {
          const [hours, minutes] = rule.time.split(':').map(Number)
          nextWeek.setHours(hours, minutes, 0, 0)
        }
        
        return nextWeek

      case 'custom':
        // For custom rules, use interval in days
        const customNext = new Date(baseDate)
        customNext.setDate(baseDate.getDate() + (rule.interval || 1))
        
        if (rule.time) {
          const [hours, minutes] = rule.time.split(':').map(Number)
          customNext.setHours(hours, minutes, 0, 0)
        }
        
        return customNext

      default:
        // Default to daily
        const defaultNext = new Date(baseDate)
        defaultNext.setDate(baseDate.getDate() + 1)
        return defaultNext
    }
  }

  // Check if a recurring rule is still active
  isRuleActive(rule: RecurringRule): boolean {
    if (!rule.endDate) return true
    
    const endDate = new Date(rule.endDate)
    const now = new Date()
    
    return now <= endDate
  }

  // Generate new task instances for recurring tasks
  async generateRecurringTasks(): Promise<{ created: number; tasks: any[] }> {
    console.log('Starting recurring task generation...')
    
    const recurringTasks = await prisma.task.findMany({
      where: {
        isRecurring: true,
        recurringRule: { not: null },
        isActive: true
      },
      include: {
        assignedTo: true,
        family: true
      }
    })

    let createdCount = 0
    const createdTasks: any[] = []

    for (const task of recurringTasks) {
      try {
        const rule = this.parseRecurringRule(task.recurringRule!)
        if (!rule || !this.isRuleActive(rule)) {
          continue
        }

        // Check if we need to create a new instance
        const shouldCreate = await this.shouldCreateNewInstance(task, rule)
        
        if (shouldCreate) {
          const newTask = await this.createTaskInstance(task, rule)
          createdTasks.push(newTask)
          createdCount++
        }
      } catch (error) {
        console.error(`Error processing recurring task ${task.id}:`, error)
      }
    }

    console.log(`Generated ${createdCount} new recurring task instances`)
    return { created: createdCount, tasks: createdTasks }
  }

  // Check if we should create a new instance of a recurring task
  private async shouldCreateNewInstance(task: any, rule: RecurringRule): Promise<boolean> {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    // Calculate when the next instance should be created
    const nextDueDate = this.calculateNextDueDate(rule, task.dueDate)
    
    // Check if it's time to create the next instance
    if (nextDueDate > now) {
      return false // Not time yet
    }

    // Check if an instance already exists for today/this period
    const existingToday = await prisma.task.findFirst({
      where: {
        title: task.title,
        assignedToId: task.assignedToId,
        familyId: task.familyId,
        isRecurring: false, // Look for instances, not the template
        createdAt: {
          gte: todayStart
        }
      }
    })

    return !existingToday
  }

  // Create a new instance of a recurring task
  private async createTaskInstance(templateTask: any, rule: RecurringRule): Promise<any> {
    const nextDueDate = this.calculateNextDueDate(rule, templateTask.dueDate)
    
    const newTask = await prisma.task.create({
      data: {
        title: templateTask.title,
        description: templateTask.description,
        icon: templateTask.icon,
        difficulty: templateTask.difficulty,
        starValue: templateTask.starValue,
        category: templateTask.category,
        familyId: templateTask.familyId,
        createdById: templateTask.createdById,
        assignedToId: templateTask.assignedToId,
        requiresProof: templateTask.requiresProof,
        isRecurring: false, // Instances are not recurring themselves
        dueDate: nextDueDate,
        isActive: true
      },
      include: {
        assignedTo: {
          include: { user: true }
        }
      }
    })

    // Update the template task's due date for next calculation
    await prisma.task.update({
      where: { id: templateTask.id },
      data: { dueDate: nextDueDate }
    })

    return newTask
  }

  // Clean up old completed recurring task instances (keep last 30 days)
  async cleanupOldInstances(): Promise<number> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const result = await prisma.task.deleteMany({
      where: {
        isRecurring: false, // Only instances, not templates
        createdAt: {
          lt: thirtyDaysAgo
        },
        completions: {
          some: {
            isApproved: true
          }
        }
      }
    })

    console.log(`Cleaned up ${result.count} old recurring task instances`)
    return result.count
  }

  // Get upcoming recurring tasks for a family
  async getUpcomingRecurringTasks(familyId: string, days: number = 7): Promise<any[]> {
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(now.getDate() + days)

    const recurringTasks = await prisma.task.findMany({
      where: {
        familyId,
        isRecurring: true,
        recurringRule: { not: null },
        isActive: true
      },
      include: {
        assignedTo: {
          include: { user: true }
        }
      }
    })

    const upcomingTasks = []

    for (const task of recurringTasks) {
      const rule = this.parseRecurringRule(task.recurringRule!)
      if (!rule || !this.isRuleActive(rule)) continue

      // Calculate next few occurrences
      let currentDate = task.dueDate || now
      for (let i = 0; i < 10; i++) { // Check next 10 occurrences
        const nextDate = this.calculateNextDueDate(rule, currentDate)
        
        if (nextDate >= now && nextDate <= futureDate) {
          upcomingTasks.push({
            ...task,
            nextDueDate: nextDate,
            isUpcoming: true
          })
        }
        
        if (nextDate > futureDate) break
        currentDate = nextDate
      }
    }

    return upcomingTasks.sort((a, b) => a.nextDueDate - b.nextDueDate)
  }

  // Manual trigger for creating recurring tasks (useful for testing)
  async triggerRecurringTaskGeneration(): Promise<{ created: number; tasks: any[] }> {
    const result = await this.generateRecurringTasks()
    await this.cleanupOldInstances()
    return result
  }

  // Validate recurring rule
  validateRecurringRule(rule: RecurringRule): { isValid: boolean; error?: string } {
    if (!rule.type || !['daily', 'weekly', 'custom'].includes(rule.type)) {
      return { isValid: false, error: 'Invalid recurring rule type' }
    }

    if (rule.type === 'weekly' && (!rule.days || rule.days.length === 0)) {
      return { isValid: false, error: 'Weekly recurring tasks must specify days' }
    }

    if (rule.days) {
      const invalidDays = rule.days.filter(day => day < 0 || day > 6)
      if (invalidDays.length > 0) {
        return { isValid: false, error: 'Days must be between 0 (Sunday) and 6 (Saturday)' }
      }
    }

    if (rule.endDate) {
      const endDate = new Date(rule.endDate)
      if (endDate <= new Date()) {
        return { isValid: false, error: 'End date must be in the future' }
      }
    }

    return { isValid: true }
  }
}