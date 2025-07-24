import { NotificationList } from '@/components/parent/NotificationList'

export default function NotificationsPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold text-warning mb-6">Notifications</h1>
      <NotificationList />
    </div>
  )
} 