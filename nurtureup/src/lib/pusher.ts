import Pusher from 'pusher'
import PusherClient from 'pusher-js'

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true
})

// Client-side Pusher instance
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    forceTLS: true
  }
)

// Notification types
export type NotificationType = 
  | 'task_completed' 
  | 'task_approved' 
  | 'task_rejected' 
  | 'badge_earned'
  | 'reward_purchased'
  | 'milestone_added'
  | 'new_task'
  | 'new_recurring_tasks'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  data?: any
  createdAt: Date
  userId: string // Who should receive this notification
  familyId: string
}

// Send notification to specific user
export async function sendNotificationToUser(
  userId: string,
  familyId: string,
  notification: Omit<Notification, 'id' | 'createdAt' | 'userId' | 'familyId'>
) {
  const fullNotification: Notification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    userId,
    familyId
  }

  // Send to user's personal channel
  await pusherServer.trigger(`user-${userId}`, 'notification', fullNotification)
  
  return fullNotification
}

// Send notification to all family members
export async function sendNotificationToFamily(
  familyId: string,
  notification: Omit<Notification, 'id' | 'createdAt' | 'userId' | 'familyId'>
) {
  const fullNotification: Notification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    userId: 'family', // Special identifier for family-wide notifications
    familyId
  }

  // Send to family channel
  await pusherServer.trigger(`family-${familyId}`, 'notification', fullNotification)
  
  return fullNotification
}

// Send notification to specific role (all parents or all children)
export async function sendNotificationToRole(
  familyId: string,
  role: 'PARENT' | 'CHILD',
  notification: Omit<Notification, 'id' | 'createdAt' | 'userId' | 'familyId'>
) {
  const fullNotification: Notification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    userId: `role-${role.toLowerCase()}`,
    familyId
  }

  // Send to role-specific family channel
  await pusherServer.trigger(`family-${familyId}-${role.toLowerCase()}`, 'notification', fullNotification)
  
  return fullNotification
}