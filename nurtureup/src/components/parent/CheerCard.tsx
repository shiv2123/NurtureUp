'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Share2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface CheerCardProps {
  childName: string
  recentAchievement: string
  avatar?: string
}

const cheerMessages = [
  "You're doing amazing! 🌟",
  "Keep up the great work! 💪",
  "So proud of you! ❤️",
  "You're a superstar! ⭐",
  "Way to go! 🎉",
  "Absolutely fantastic! 🚀",
  "You're incredible! ✨",
  "Outstanding effort! 🏆"
]

export function CheerCard({ childName, recentAchievement, avatar }: CheerCardProps) {
  const [isCheerSent, setIsCheerSent] = useState(false)
  const [cheerMessage] = useState(() => 
    cheerMessages[Math.floor(Math.random() * cheerMessages.length)]
  )

  const handleSendCheer = () => {
    setIsCheerSent(true)
    // TODO: Implement actual cheer sending to child's device
    setTimeout(() => setIsCheerSent(false), 3000)
  }

  const handleShare = () => {
    // TODO: Implement sharing to family group chat
    alert('Shared to family chat! (Feature coming soon)')
  }

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-soft-coral/10 to-sunny-yellow/10 border-soft-coral/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-soft-coral">
          <Heart className="w-5 h-5" />
          Cheer Card
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Child Avatar and Name */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-soft-coral/20 flex items-center justify-center text-2xl">
            {avatar || '👤'}
          </div>
          <div>
            <div className="font-bold text-black">{childName}</div>
            <div className="text-sm text-black">Little Star</div>
          </div>
        </div>

        {/* Achievement Display */}
        <div className="bg-white/60 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-black text-sm">
                Latest Win
              </div>
              <div className="text-black/80 text-sm mt-1">
                {recentAchievement}
              </div>
            </div>
          </div>
        </div>

        {/* Cheer Message */}
        <div className="text-center">
          <div className={cn(
            'text-lg font-bold transition-all duration-300',
            isCheerSent ? 'text-success scale-110' : 'text-black'
          )}>
            {isCheerSent ? '🎉 Cheer Sent! 🎉' : cheerMessage}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleSendCheer}
            disabled={isCheerSent}
            variant="coral"
            size="sm"
            className="flex-1"
          >
            {isCheerSent ? (
              <>
                <Heart className="w-4 h-4 mr-2 text-error" />
                Sent!
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 mr-2" />
                Send Cheer
              </>
            )}
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Fun Stats */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-white/40 rounded-lg p-2">
            <div className="text-lg font-bold text-black">7</div>
            <div className="text-xs text-black">Day Streak</div>
          </div>
          <div className="bg-white/40 rounded-lg p-2">
            <div className="text-lg font-bold text-black">42</div>
            <div className="text-xs text-black">Total Stars</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}