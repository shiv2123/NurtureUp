'use client'

import { useState } from 'react'
import { Bell, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useNotifications } from '@/components/providers/NotificationProvider'
import { formatDate } from '@/lib/utils'

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_completed': return '✅'
      case 'task_approved': return '🎉'
      case 'task_rejected': return '🔄'
      case 'badge_earned': return '🏆'
      case 'reward_purchased': return '🎁'
      case 'milestone_added': return '📸'
      default: return '📢'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'task_approved':
      case 'badge_earned':
        return 'text-success'
      case 'task_rejected':
        return 'text-warning'
      case 'task_completed':
        return 'text-info'
      default:
        return 'text-black'
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[600px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </DialogTitle>
              {notifications.length > 0 && (
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={markAllAsRead}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Mark All Read
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearNotifications}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-black">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No notifications yet</p>
                <p className="text-sm mt-1">
                  You'll see updates about tasks, rewards, and achievements here!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => {
                  const isUnread = !notification.id.includes('read')
                  
                  return (
                    <Card
                      key={notification.id}
                      className={`cursor-pointer transition-all ${
                        isUnread 
                          ? 'border-sage-green/20 bg-sage-green/5' 
                          : 'border-slate-200 bg-white'
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`font-medium text-sm ${getNotificationColor(notification.type)}`}>
                                {notification.title}
                              </h4>
                              {isUnread && (
                                <div className="w-2 h-2 bg-sage-green rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-black/80 mb-2">
                              {notification.message}
                            </p>
                            <div className="text-xs text-black/60">
                              {formatDate(notification.createdAt)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}