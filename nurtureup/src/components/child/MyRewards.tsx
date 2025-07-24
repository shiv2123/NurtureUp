'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Gift, 
  Clock, 
  CheckCircle, 
  Coins, 
  Calendar,
  Star,
  Sparkles,
  AlertTriangle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useNotifications } from '@/components/providers/NotificationProvider'

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
}

interface MyRewardsProps {
  onRefresh?: () => void
}

export function MyRewards({ onRefresh }: MyRewardsProps) {
  const [data, setData] = useState<{
    purchases: {
      pending: RewardPurchase[]
      redeemed: RewardPurchase[]
      awaitingApproval: RewardPurchase[]
      readyToUse: RewardPurchase[]
    }
    metadata: {
      totalSpent: number
      pendingValue: number
      rewardCount: {
        total: number
        pending: number
        redeemed: number
        awaitingApproval: number
        readyToUse: number
      }
    }
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'ready' | 'waiting' | 'all'>('ready')
  const { notifications } = useNotifications()

  useEffect(() => {
    fetchRewards()
  }, [])

  // Listen for reward-related notifications and refresh
  useEffect(() => {
    const rewardNotifications = notifications.filter(
      n => n.type === 'reward_purchased' && n.data?.rewardId
    )
    
    if (rewardNotifications.length > 0) {
      // Refresh rewards when purchases are made or approved
      fetchRewards()
    }
  }, [notifications])

  const fetchRewards = async () => {
    try {
      const res = await fetch('/api/child/reward-purchases')
      if (res.ok) {
        const fetchedData = await res.json()
        setData(fetchedData)
        onRefresh?.()
      }
    } catch (error) {
      console.error('Failed to fetch rewards:', error)
    } finally {
      setLoading(false)
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

  if (!data) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Gift className="w-12 h-12 mx-auto mb-4 text-black" />
          <p className="text-black">Failed to load rewards</p>
        </CardContent>
      </Card>
    )
  }

  const getTabRewards = () => {
    switch (activeTab) {
      case 'ready': return data.purchases.readyToUse
      case 'waiting': return data.purchases.awaitingApproval
      case 'all': return [...data.purchases.pending, ...data.purchases.redeemed].sort((a, b) => 
        new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()
      )
      default: return []
    }
  }

  const tabRewards = getTabRewards()

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <Card className="bg-gradient-to-r from-mint-green/10 to-sky-blue/10 border-mint-green/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-child">
            <Gift className="w-5 h-5 text-mint-green" />
            My Treasure Chest
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-sage-green">
                {data.metadata.rewardCount.readyToUse}
              </div>
              <div className="text-sm text-black">Ready to Use</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {data.metadata.rewardCount.awaitingApproval}
              </div>
              <div className="text-sm text-black">Waiting</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-sky-blue">
                {data.metadata.totalSpent}
              </div>
              <div className="text-sm text-black">Coins Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-black">
                {data.metadata.rewardCount.total}
              </div>
              <div className="text-sm text-black">Total Rewards</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'ready', label: 'Ready to Use', count: data.metadata.rewardCount.readyToUse, icon: CheckCircle },
          { key: 'waiting', label: 'Waiting', count: data.metadata.rewardCount.awaitingApproval, icon: Clock },
          { key: 'all', label: 'All Rewards', count: data.metadata.rewardCount.total, icon: Gift }
        ].map(tab => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab.key as any)}
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <Badge variant="secondary" className="text-xs">
                {tab.count}
              </Badge>
            </Button>
          )
        })}
      </div>

      {/* Rewards List */}
      <div className="space-y-4">
        {tabRewards.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              {activeTab === 'ready' && (
                <>
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-black" />
                  <h3 className="font-medium text-black mb-2 font-child">
                    No rewards ready yet!
                  </h3>
                  <p className="text-sm text-black">
                    Complete more quests to earn coins and buy awesome rewards!
                  </p>
                </>
              )}
              {activeTab === 'waiting' && (
                <>
                  <Clock className="w-12 h-12 mx-auto mb-4 text-black" />
                  <h3 className="font-medium text-black mb-2 font-child">
                    Nothing waiting for approval
                  </h3>
                  <p className="text-sm text-black">
                    Your recent reward purchases will appear here while waiting for parent approval.
                  </p>
                </>
              )}
              {activeTab === 'all' && (
                <>
                  <Gift className="w-12 h-12 mx-auto mb-4 text-black" />
                  <h3 className="font-medium text-black mb-2 font-child">
                    No reward purchases yet
                  </h3>
                  <p className="text-sm text-black">
                    Visit the Reward Store to spend your hard-earned coins!
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          tabRewards.map(purchase => (
            <Card key={purchase.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Reward Icon */}
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-2xl">
                    {getCategoryIcon(purchase.reward.category)}
                  </div>

                  {/* Reward Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-black font-child">
                        {purchase.reward.title}
                      </h3>
                      <Badge 
                        variant="secondary" 
                        className={getCategoryColor(purchase.reward.category)}
                      >
                        {purchase.reward.category}
                      </Badge>
                    </div>

                    {purchase.reward.description && (
                      <p className="text-sm text-black mb-3">
                        {purchase.reward.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-black mb-3">
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4" />
                        {purchase.coinCost} coins
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDistanceToNow(new Date(purchase.purchasedAt), { addSuffix: true })}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      {!purchase.isRedeemed && purchase.reward.requiresApproval && (
                        <Badge variant="warning" className="gap-1">
                          <Clock className="w-3 h-3" />
                          Waiting for parent approval
                        </Badge>
                      )}
                      {purchase.isRedeemed && (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Ready to enjoy!
                        </Badge>
                      )}
                      {!purchase.isRedeemed && !purchase.reward.requiresApproval && (
                        <Badge variant="default" className="gap-1">
                          <Star className="w-3 h-3" />
                          Ready to use
                        </Badge>
                      )}
                    </div>

                    {/* Parent Notes */}
                    {purchase.notes && purchase.isRedeemed && (
                      <div className="mt-3 p-3 bg-mint-green/10 rounded-lg border border-mint-green/20">
                        <div className="text-sm font-medium text-mint-green mb-1">
                          Message from parent:
                        </div>
                        <p className="text-sm text-black">{purchase.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Call to Action */}
      {data.metadata.rewardCount.total === 0 && (
        <Card className="bg-gradient-to-r from-sunny-yellow/10 to-soft-coral/10 border-sunny-yellow/20">
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4">💎</div>
            <h3 className="font-bold text-black mb-2 font-child">
              Start Earning Rewards!
            </h3>
            <p className="text-sm text-black mb-4">
              Complete quests to earn coins, then spend them on amazing rewards!
            </p>
            <Button 
              className="bg-sunny-yellow hover:bg-sunny-yellow/90 text-black gap-2"
              onClick={() => window.location.href = '/child/rewards'}
            >
              <Gift className="w-4 h-4" />
              Visit Reward Store
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}