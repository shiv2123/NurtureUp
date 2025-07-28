'use client'

import { RewardMarketplace } from '@/components/parent/RewardMarketplace'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { Gift, TrendingUp, Clock, DollarSign } from 'lucide-react'

export default function RewardsPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleToggleActive = async (rewardId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/parent/rewards/${rewardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })
      if (!res.ok) throw new Error('Failed to update reward')
      setRefreshKey(k => k + 1)
    } catch (error) {
      console.error('Error toggling reward:', error)
    }
  }

  const handleEditReward = (reward: any) => {
    // TODO: Open edit dialog
    console.log('Edit reward:', reward)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">Reward Marketplace</h1>
          <p className="text-black mt-1">
            Create and manage exciting rewards for your kids
          </p>
        </div>
        <Button className="gap-2" size="lg">
          <Gift className="w-5 h-5" />
          Create Reward
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-sage-green/5 border-sage-green/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sage-green/20 flex items-center justify-center">
                <Gift className="w-5 h-5 text-sage-green" />
              </div>
              <div>
                <div className="text-2xl font-bold text-black">8</div>
                <div className="text-sm text-black">Active Rewards</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-soft-coral/5 border-soft-coral/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-soft-coral/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-soft-coral" />
              </div>
              <div>
                <div className="text-2xl font-bold text-black">24</div>
                <div className="text-sm text-black">Purchased This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-sky-blue/5 border-sky-blue/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-blue/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-sky-blue" />
              </div>
              <div>
                <div className="text-2xl font-bold text-black">5</div>
                <div className="text-sm text-black">Pending Approval</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-warning/5 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold text-black">125</div>
                <div className="text-sm text-black">Avg Coins Spent</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Marketplace */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Reward Marketplace
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RewardMarketplace
            key={refreshKey}
            viewMode="parent"
            onEdit={handleEditReward}
            onToggleActive={handleToggleActive}
          />
        </CardContent>
      </Card>
    </div>
  )
} 