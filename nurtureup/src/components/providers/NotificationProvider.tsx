'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { pusherClient, Notification } from '@/lib/pusher'
import { toast } from 'react-hot-toast'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!session?.user?.id || !session?.user?.familyId) return

    const userId = session.user.id
    const familyId = session.user.familyId
    const userRole = session.user.role

    // Subscribe to user's personal channel
    const userChannel = pusherClient.subscribe(`user-${userId}`)
    
    // Subscribe to family channel
    const familyChannel = pusherClient.subscribe(`family-${familyId}`)
    
    // Subscribe to role-specific channel
    const roleChannel = pusherClient.subscribe(`family-${familyId}-${userRole.toLowerCase()}`)

    const handleNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 49)]) // Keep last 50 notifications
      
      // Show toast notification
      showNotificationToast(notification)
    }

    // Listen for notifications on all channels
    userChannel.bind('notification', handleNotification)
    familyChannel.bind('notification', handleNotification)
    roleChannel.bind('notification', handleNotification)

    return () => {
      userChannel.unbind('notification', handleNotification)
      familyChannel.unbind('notification', handleNotification)
      roleChannel.unbind('notification', handleNotification)
      
      pusherClient.unsubscribe(`user-${userId}`)
      pusherClient.unsubscribe(`family-${familyId}`)
      pusherClient.unsubscribe(`family-${familyId}-${userRole.toLowerCase()}`)
    }
  }, [session])

  const showNotificationToast = (notification: Notification) => {
    const emoji = getNotificationEmoji(notification.type)
    
    toast.success(`${emoji} ${notification.title}`, {
      duration: 4000,
      style: {
        background: '#10B981',
        color: 'white',
      },
    })
  }

  const getNotificationEmoji = (type: string) => {
    switch (type) {
      case 'task_completed': return '✅'
      case 'task_approved': return '🎉'
      case 'task_rejected': return '🔄'
      case 'badge_earned': return '🏆'
      case 'reward_purchased': return '🎁'
      case 'milestone_added': return '📸'
      case 'new_task': return '🎯'
      default: return '📢'
    }
  }

  const markAsRead = (notificationId: string) => {
    setReadNotifications(prev => new Set([...prev, notificationId]))
  }

  const markAllAsRead = () => {
    setReadNotifications(new Set(notifications.map(n => n.id)))
  }

  const clearNotifications = () => {
    setNotifications([])
    setReadNotifications(new Set())
  }

  const unreadCount = notifications.filter(n => !readNotifications.has(n.id)).length

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}