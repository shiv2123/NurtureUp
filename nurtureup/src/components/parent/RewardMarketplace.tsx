'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Gift, 
  Coins,
  Monitor,
  PartyPopper,
  Crown,
  Heart,
  Gamepad2,
  Plus,
  Edit3,
  MoreVertical
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Reward {
  id: string
  title: string
  description?: string
  image?: string
  category: string
  coinCost: number
  isActive: boolean
  quantity?: number
  expiresAt?: string
  minAge?: number
  maxAge?: number
  requiresApproval: boolean
}

const categoryConfig = {
  screentime: {
    icon: Monitor,
    color: 'bg-sky-blue',
    label: 'Screen Time',
    description: 'Extra fun minutes'
  },
  experience: {
    icon: PartyPopper,
    color: 'bg-soft-coral',
    label: 'Experience',
    description: 'Special activities'
  },
  privilege: {
    icon: Crown,
    color: 'bg-sunny-yellow',
    label: 'Privilege',
    description: 'Special rights'
  },
  item: {
    icon: Gift,
    color: 'bg-mint-green',
    label: 'Item',
    description: 'Physical rewards'
  }
}

interface RewardMarketplaceProps {
  viewMode?: 'parent' | 'child'
  childCoins?: number
  onPurchase?: (rewardId: string) => Promise<void>
  onEdit?: (reward: Reward) => void
  onToggleActive?: (rewardId: string, isActive: boolean) => Promise<void>
}

export function RewardMarketplace({ 
  viewMode = 'parent',
  childCoins = 0,
  onPurchase,
  onEdit,
  onToggleActive
}: RewardMarketplaceProps) {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasingId, setPurchasingId] = useState<string | null>(null)

  useEffect(() => {
    fetchRewards()
  }, [])

  const fetchRewards = async () => {
    try {
      const res = await fetch('/api/parent/rewards')
      if (res.ok) {
        const data = await res.json()
        setRewards(data)
      }
    } catch (error) {
      console.error('Failed to fetch rewards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (rewardId: string) => {
    if (!onPurchase) return
    
    try {
      setPurchasingId(rewardId)
      await onPurchase(rewardId)
      await fetchRewards() // Refresh rewards
    } catch (error) {
      console.error('Purchase failed:', error)
    } finally {
      setPurchasingId(null)
    }
  }

  const handleToggleActive = async (rewardId: string, currentStatus: boolean) => {
    if (!onToggleActive) return
    
    try {
      await onToggleActive(rewardId, !currentStatus)
      await fetchRewards()
    } catch (error) {
      console.error('Failed to toggle reward status:', error)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-32 bg-slate-200 rounded-lg mb-3" />
              <div className="h-4 bg-slate-200 rounded mb-2" />
              <div className="h-3 bg-slate-200 rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const activeRewards = viewMode === 'child' 
    ? rewards.filter(r => r.isActive)
    : rewards

  return (
    <div className="space-y-6">
      {/* Header for child view */}
      {viewMode === 'child' && (
        <div className="text-center bg-gradient-to-r from-soft-coral/10 to-sunny-yellow/10 rounded-2xl p-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Coins className="w-8 h-8 text-warning" />
            <span className="text-3xl font-bold text-black">{childCoins}</span>
            <span className="text-black">coins</span>
          </div>
          <p className="text-black">What would you like to earn?</p>
        </div>
      )}

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeRewards.map((reward) => {
          const config = categoryConfig[reward.category as keyof typeof categoryConfig]
          const Icon = config?.icon || Gift
          const canAfford = viewMode === 'child' ? childCoins >= reward.coinCost : true
          const isPurchasing = purchasingId === reward.id

          return (
            <Card 
              key={reward.id}
              className={cn(
                'overflow-hidden transition-all hover:shadow-medium',
                !reward.isActive && viewMode === 'parent' && 'opacity-60',
                !canAfford && viewMode === 'child' && 'opacity-50'
              )}
            >
              {/* Reward Header */}
              <div className={cn(
                'p-4 text-white relative',
                config?.color || 'bg-slate-400'
              )}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-6 h-6" />
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {config?.label || reward.category}
                    </Badge>
                  </div>
                  
                  {viewMode === 'parent' && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-white hover:bg-white/20"
                        onClick={() => onEdit?.(reward)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-white hover:bg-white/20"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5" />
                    <span className="text-2xl font-bold">{reward.coinCost}</span>
                  </div>
                  
                  {reward.requiresApproval && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      <Heart className="w-3 h-3 mr-1" />
                      Parent OK
                    </Badge>
                  )}
                </div>
              </div>

              {/* Reward Content */}
              <CardContent className="p-4">
                <h3 className="font-bold text-black mb-2">{reward.title}</h3>
                {reward.description && (
                  <p className="text-sm text-black mb-4">{reward.description}</p>
                )}

                {/* Reward Details */}
                <div className="space-y-2 mb-4">
                  {reward.quantity && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-black">Available</span>
                      <span className="font-medium text-black">{reward.quantity} left</span>
                    </div>
                  )}
                  
                  {(reward.minAge || reward.maxAge) && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-black">Age Range</span>
                      <span className="font-medium text-black">
                        {reward.minAge && reward.maxAge ? 
                          `${reward.minAge}-${reward.maxAge} years` :
                          reward.minAge ? 
                            `${reward.minAge}+ years` :
                            `Up to ${reward.maxAge} years`
                        }
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {viewMode === 'child' ? (
                  <Button
                    onClick={() => handlePurchase(reward.id)}
                    disabled={!canAfford || isPurchasing}
                    isLoading={isPurchasing}
                    loadingText="Purchasing..."
                    className="w-full"
                    variant={canAfford ? 'default' : 'outline'}
                  >
                    {canAfford ? (
                      <>
                        <Gift className="w-4 h-4 mr-2" />
                        Get Reward
                      </>
                    ) : (
                      <>
                        <Coins className="w-4 h-4 mr-2" />
                        Need {reward.coinCost - childCoins} more
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant={reward.isActive ? 'outline' : 'success'}
                      size="sm"
                      onClick={() => handleToggleActive(reward.id, reward.isActive)}
                      className="flex-1"
                    >
                      {reward.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit?.(reward)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}

        {/* Add New Reward Card (Parent View) */}
        {viewMode === 'parent' && (
          <Card className="border-2 border-dashed border-slate-300 hover:border-sage-green/50 transition-colors cursor-pointer">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-sage-green/10 flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-sage-green" />
              </div>
              <h3 className="font-semibold text-black mb-1">Add New Reward</h3>
              <p className="text-sm text-black">Create exciting rewards for your kids</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Empty State */}
      {activeRewards.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-lg font-semibold text-black mb-2">
            {viewMode === 'child' ? 'No rewards available' : 'No rewards created yet'}
          </h3>
          <p className="text-black mb-4">
            {viewMode === 'child' 
              ? 'Ask your parents to add some exciting rewards!'
              : 'Create your first reward to motivate your kids'
            }
          </p>
          {viewMode === 'parent' && (
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create First Reward
            </Button>
          )}
        </div>
      )}
    </div>
  )
}