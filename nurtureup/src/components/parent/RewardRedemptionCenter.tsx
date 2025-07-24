'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Gift, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Coins,
  Calendar,
  MessageSquare,
  Star,
  AlertCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface RewardPurchase {
  id: string
  purchasedAt: string
  coinCost: number
  isRedeemed: boolean
  redeemedAt?: string
  notes?: string
  reward: {
    id: string
    title: string
    description?: string
    category: string
    coinCost: number
    requiresApproval: boolean
  }
  child: {
    id: string
    nickname: string
    avatar?: string
    user: {
      name: string
    }
  }
}

interface RedemptionCenterProps {
  onRewardRedeemed?: () => void
}

export function RewardRedemptionCenter({ onRewardRedeemed }: RedemptionCenterProps) {
  const [purchases, setPurchases] = useState<RewardPurchase[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPurchase, setSelectedPurchase] = useState<RewardPurchase | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [filter, setFilter] = useState<'pending' | 'redeemed' | 'all'>('pending')

  useEffect(() => {
    fetchPurchases()
  }, [filter])

  const fetchPurchases = async () => {
    try {
      const res = await fetch(`/api/parent/reward-purchases?status=${filter}`)
      if (res.ok) {
        const data = await res.json()
        if (filter === 'all') {
          setPurchases(data.all || [])
        } else {
          setPurchases(data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch purchases:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: 'fulfill' | 'deny') => {
    if (!selectedPurchase) return

    setActionLoading(true)
    try {
      const res = await fetch(`/api/parent/reward-purchases/${selectedPurchase.id}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes })
      })

      if (res.ok) {
        setSelectedPurchase(null)
        setNotes('')
        fetchPurchases()
        onRewardRedeemed?.()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to process reward')
      }
    } catch (error) {
      console.error('Failed to process reward:', error)
      alert('Failed to process reward')
    } finally {
      setActionLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'experience': return '🎪'
      case 'item': return '🎁'
      case 'privilege': return '👑'
      case 'screentime': return '📱'
      default: return '🎯'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'experience': return 'bg-purple-100 text-purple-700'
      case 'item': return 'bg-blue-100 text-blue-700'
      case 'privilege': return 'bg-yellow-100 text-yellow-700'
      case 'screentime': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-black'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-slate-200 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const pendingCount = purchases.filter(p => !p.isRedeemed && p.reward.requiresApproval).length
  const redeemedCount = purchases.filter(p => p.isRedeemed).length

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-sage-green" />
            Reward Redemption Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
              <div className="text-sm text-orange-600">Awaiting Fulfillment</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{redeemedCount}</div>
              <div className="text-sm text-green-600">Recently Fulfilled</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{purchases.length}</div>
              <div className="text-sm text-blue-600">Total Purchases</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'pending', label: 'Pending', count: pendingCount },
          { key: 'redeemed', label: 'Fulfilled', count: redeemedCount },
          { key: 'all', label: 'All', count: purchases.length }
        ].map(tab => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(tab.key as any)}
            className="gap-2"
          >
            {tab.label}
            <Badge variant="secondary" className="text-xs">
              {tab.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Purchases List */}
      <div className="space-y-4">
        {purchases.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Gift className="w-12 h-12 mx-auto mb-4 text-black" />
              <h3 className="font-medium text-black mb-2">No Rewards Found</h3>
              <p className="text-sm text-black">
                {filter === 'pending' 
                  ? "No rewards are waiting for fulfillment"
                  : "No reward purchases to display"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          purchases.map(purchase => (
            <Card key={purchase.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Reward Icon */}
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-2xl">
                      {getCategoryIcon(purchase.reward.category)}
                    </div>

                    {/* Reward Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-black">
                          {purchase.reward.title}
                        </h3>
                        <Badge 
                          variant="secondary" 
                          className={getCategoryColor(purchase.reward.category)}
                        >
                          {purchase.reward.category}
                        </Badge>
                        {!purchase.isRedeemed && purchase.reward.requiresApproval && (
                          <Badge variant="warning" className="gap-1">
                            <Clock className="w-3 h-3" />
                            Pending
                          </Badge>
                        )}
                        {purchase.isRedeemed && (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Fulfilled
                          </Badge>
                        )}
                      </div>

                      {purchase.reward.description && (
                        <p className="text-sm text-black mb-3">
                          {purchase.reward.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-black">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {purchase.child.nickname}
                        </div>
                        <div className="flex items-center gap-1">
                          <Coins className="w-4 h-4" />
                          {purchase.coinCost} coins
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDistanceToNow(new Date(purchase.purchasedAt), { addSuffix: true })}
                        </div>
                      </div>

                      {purchase.notes && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="w-4 h-4 text-black" />
                            <span className="text-sm font-medium text-black">Notes</span>
                          </div>
                          <p className="text-sm text-black">{purchase.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!purchase.isRedeemed && purchase.reward.requiresApproval && (
                      <Button
                        size="sm"
                        onClick={() => setSelectedPurchase(purchase)}
                        className="bg-sage-green hover:bg-sage-green/90"
                      >
                        Review
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Redemption Dialog */}
      <Dialog open={!!selectedPurchase} onOpenChange={() => setSelectedPurchase(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-sage-green" />
              Review Reward Request
            </DialogTitle>
          </DialogHeader>

          {selectedPurchase && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-3xl mb-2">
                  {getCategoryIcon(selectedPurchase.reward.category)}
                </div>
                <h3 className="font-semibold text-black mb-1">
                  {selectedPurchase.reward.title}
                </h3>
                <p className="text-sm text-black mb-2">
                  Requested by {selectedPurchase.child.nickname}
                </p>
                <Badge className="gap-1">
                  <Coins className="w-3 h-3" />
                  {selectedPurchase.coinCost} coins
                </Badge>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Add a note (optional)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add instructions, comments, or restrictions..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleAction('deny')}
                  disabled={actionLoading}
                  className="flex-1 gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Deny & Refund
                </Button>
                <Button
                  onClick={() => handleAction('fulfill')}
                  disabled={actionLoading}
                  isLoading={actionLoading}
                  className="flex-1 gap-2 bg-sage-green hover:bg-sage-green/90"
                >
                  <CheckCircle className="w-4 h-4" />
                  Fulfill Reward
                </Button>
              </div>

              <div className="text-xs text-black/60 text-center">
                Fulfilling will mark the reward as ready and notify {selectedPurchase.child.nickname}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}