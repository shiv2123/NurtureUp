'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/components/providers/NotificationProvider'

interface Reward {
  id: string
  title: string
  description?: string
  image?: string
  category: string
  coinCost: number
  isActive: boolean
  quantity?: number | null
  expiresAt?: string | null
}

export function RewardMarketplace() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [buyingId, setBuyingId] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const { notifications } = useNotifications()

  useEffect(() => {
    async function fetchRewards() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/child/rewards')
        if (!res.ok) throw new Error('Failed to fetch rewards')
        const data = await res.json()
        setRewards(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchRewards()
  }, [success, refreshKey])

  // Listen for new reward notifications and refresh marketplace
  useEffect(() => {
    const newRewardNotifications = notifications.filter(
      n => n.type === 'reward_purchased' && n.data?.isNewReward
    )
    
    if (newRewardNotifications.length > 0) {
      // Refresh marketplace when new rewards are available
      setRefreshKey(k => k + 1)
    }
  }, [notifications])

  async function handleBuy(rewardId: string) {
    setBuyingId(rewardId)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`/api/child/rewards/${rewardId}/purchase`, {
        method: 'POST'
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to purchase reward')
      setSuccess('Reward purchased!')
      setTimeout(() => setSuccess(null), 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBuyingId(null)
    }
  }

  if (loading) {
    return <div className="text-center text-black py-8">Loading rewards...</div>
  }
  if (error) {
    return <div className="text-center text-error py-8">{error}</div>
  }
  if (rewards.length === 0) {
    return <div className="rounded-2xl border border-slate-200 bg-white shadow-soft p-6 text-center text-black">No rewards available right now. Check back soon!</div>
  }

  return (
    <div className="space-y-6">
      {success && <div className="text-center text-success font-bold">{success}</div>}
      {rewards.map((reward) => (
        <Card key={reward.id} className="flex flex-col md:flex-row items-center gap-4 p-4">
          {reward.image && (
            <img src={reward.image} alt={reward.title} className="w-24 h-24 object-cover rounded-xl border" />
          )}
          <div className="flex-1">
            <CardHeader>
              <CardTitle>{reward.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-black mb-2">{reward.description}</div>
              <div className="text-xs text-black mb-2">Category: {reward.category}</div>
              <div className="text-lg font-bold text-mint-green mb-2">{reward.coinCost} coins</div>
              <Button onClick={() => handleBuy(reward.id)} variant="mint" isLoading={buyingId === reward.id} disabled={!!buyingId}>
                Buy
              </Button>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  )
} 