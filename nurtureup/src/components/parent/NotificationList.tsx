'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Gift, Image, Star } from 'lucide-react'

export function NotificationList() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/parent/notifications')
        if (!res.ok) throw new Error('Failed to fetch notifications')
        const data = await res.json()
        setData(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  if (loading) {
    return <div className="text-center text-black py-8">Loading notifications...</div>
  }
  if (error) {
    return <div className="text-center text-error py-8">{error}</div>
  }
  if (!data) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Pending Task Approvals */}
      {data.pendingTasks.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader>
            <CardTitle className="text-warning">Tasks Awaiting Approval</CardTitle>
          </CardHeader>
          <CardContent>
            {data.pendingTasks.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 mb-3">
                <Image className="w-5 h-5 text-warning" />
                <span className="font-bold text-black">{item.child?.user?.name || item.child?.user?.email}</span>
                <span>completed</span>
                <span className="font-bold">{item.task.title}</span>
                <span className="ml-auto text-xs text-black">{new Date(item.completedAt).toLocaleString()}</span>
                <Button size="sm" variant="outline">Approve</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {/* Pending Reward Approvals */}
      {data.pendingRewards.length > 0 && (
        <Card className="border-mint-green/30 bg-mint-green/5">
          <CardHeader>
            <CardTitle className="text-mint-green">Rewards Awaiting Approval</CardTitle>
          </CardHeader>
          <CardContent>
            {data.pendingRewards.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 mb-3">
                <Gift className="w-5 h-5 text-mint-green" />
                <span className="font-bold text-black">{item.child?.user?.name || item.child?.user?.email}</span>
                <span>wants</span>
                <span className="font-bold">{item.reward.title}</span>
                <span className="ml-auto text-xs text-black">{new Date(item.purchasedAt).toLocaleString()}</span>
                <Button size="sm" variant="outline">Approve</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {/* Recent Milestones */}
      {data.milestones.length > 0 && (
        <Card className="border-sky-blue/30 bg-sky-blue/5">
          <CardHeader>
            <CardTitle className="text-sky-blue">Recent Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            {data.milestones.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 mb-3">
                <Star className="w-5 h-5 text-sky-blue" />
                <span className="font-bold text-black">{item.title}</span>
                <span className="ml-auto text-xs text-black">{new Date(item.date).toLocaleDateString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {data.pendingTasks.length === 0 && data.pendingRewards.length === 0 && data.milestones.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-soft p-6 text-center text-black">No notifications at this time.</div>
      )}
    </div>
  )
} 