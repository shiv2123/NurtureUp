'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { EditRewardDialog } from './EditRewardDialog'

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
  minAge?: number | null
  maxAge?: number | null
  requiresApproval?: boolean
}

export function RewardList() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  async function fetchRewards() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/parent/rewards')
      if (!res.ok) throw new Error('Failed to fetch rewards')
      const data = await res.json()
      setRewards(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRewards()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete this reward?')) return
    setDeletingId(id)
    setError(null)
    try {
      const res = await fetch(`/api/parent/rewards/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete reward')
      await fetchRewards()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  function handleEdit(reward: Reward) {
    setEditingReward(reward)
    setEditOpen(true)
  }

  function handleRewardUpdated() {
    setEditOpen(false)
    setEditingReward(null)
    fetchRewards()
  }

  if (loading) {
    return <div className="text-center text-black py-8">Loading rewards...</div>
  }
  if (error) {
    return <div className="text-center text-error py-8">{error}</div>
  }
  if (rewards.length === 0) {
    return <div className="rounded-2xl border border-slate-200 bg-white shadow-soft p-6 text-center text-black">No rewards yet. Add your first family perk!</div>
  }

  return (
    <div className="space-y-6">
      <EditRewardDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        reward={editingReward}
        onRewardUpdated={handleRewardUpdated}
      />
      {rewards.map((reward) => (
        <Card key={reward.id} className="flex flex-col md:flex-row items-center gap-4 p-4">
          {reward.image && (
            <img src={reward.image} alt={reward.title} className="w-24 h-24 object-cover rounded-xl border" />
          )}
          <div className="flex-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{reward.title}</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" title="Edit" onClick={() => handleEdit(reward)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" title="Delete" onClick={() => handleDelete(reward.id)} isLoading={deletingId === reward.id}>
                  <Trash2 className="w-4 h-4 text-error" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-black mb-2">{reward.description}</div>
              <div className="text-xs text-black mb-2">Category: {reward.category}</div>
              <div className="text-lg font-bold text-mint-green mb-2">{reward.coinCost} coins</div>
              {reward.quantity !== null && (
                <div className="text-xs text-black mb-2">Stock: {reward.quantity}</div>
              )}
              {reward.expiresAt && (
                <div className="text-xs text-warning mb-2">Expires: {new Date(reward.expiresAt).toLocaleDateString()}</div>
              )}
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  )
} 