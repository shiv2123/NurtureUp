'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Trophy, Star, Zap, Target, Crown, Share, Send, Lock } from 'lucide-react'

/**
 * School Age Badges & Leaderboard (Blueprint 6.4.4)
 * 
 * Per blueprint:
 * - My Achievements Grid: tiles for milestone badges (Streaks, Grades, Chore Master). Locked tiles grayscale; tap shows requirements
 * - Family Leaderboard: horizontal carousel of family avatars ranked by star totals this week
 * - Challenge Button: send friendly challenge ("Beat my streak!") to sibling; parent approval gate
 * - Share Badge long-press ⇒ generates confetti GIF saved locally (share only via parent app)
 */
export default function SchoolAgeBadgesPage() {
  const searchParams = useSearchParams()
  const shouldShowStore = searchParams?.get('store') === 'true'

  const [myStars, setMyStars] = useState(156)
  const [showBadgeDetail, setShowBadgeDetail] = useState<any>(null)
  const [showChallengeModal, setShowChallengeModal] = useState(false)
  const [showRewardStore, setShowRewardStore] = useState(shouldShowStore)
  const [showConfetti, setShowConfetti] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState('')

  const badges = [
    {
      id: 'homework-streak',
      name: 'Homework Hero',
      description: 'Complete homework 7 days in a row',
      icon: '📚',
      progress: 12,
      requirement: 7,
      unlocked: true,
      level: 'gold',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      id: 'grade-master',
      name: 'Grade Master',
      description: 'Achieve 90% or higher on 5 tests',
      icon: '🎓',
      progress: 3,
      requirement: 5,
      unlocked: false,
      level: 'silver',
      color: 'from-gray-400 to-gray-600'
    },
    {
      id: 'chore-champion',
      name: 'Chore Champion',
      description: 'Complete 50 chores',
      icon: '🧹',
      progress: 50,
      requirement: 50,
      unlocked: true,
      level: 'gold',
      color: 'from-green-400 to-emerald-500'
    },
    {
      id: 'star-collector',
      name: 'Star Collector',
      description: 'Earn 100 stars in one week',
      icon: '⭐',
      progress: 75,
      requirement: 100,
      unlocked: false,
      level: 'bronze',
      color: 'from-amber-400 to-yellow-500'
    },
    {
      id: 'money-saver',
      name: 'Money Saver',
      description: 'Save $25 towards a goal',
      icon: '💰',
      progress: 24.50,
      requirement: 25,
      unlocked: false,
      level: 'silver',
      color: 'from-green-400 to-blue-500'
    },
    {
      id: 'learning-master',
      name: 'Learning Master',
      description: 'Complete 20 learning games',
      icon: '🎮',
      progress: 8,
      requirement: 20,
      unlocked: false,
      level: 'bronze',
      color: 'from-purple-400 to-pink-500'
    },
    {
      id: 'time-master',
      name: 'Time Master',
      description: 'Stay within screen time limits for 10 days',
      icon: '⏰',
      progress: 6,
      requirement: 10,
      unlocked: false,
      level: 'silver',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      id: 'family-helper',
      name: 'Family Helper',
      description: 'Help a sibling with their tasks 5 times',
      icon: '🤝',
      progress: 2,
      requirement: 5,
      unlocked: false,
      level: 'gold',
      color: 'from-pink-400 to-rose-500'
    }
  ]

  const familyMembers = [
    { id: 1, name: 'Me', avatar: '👦', stars: 156, rank: 1, isMe: true },
    { id: 2, name: 'Emma', avatar: '👧', stars: 134, rank: 2, isMe: false },
    { id: 3, name: 'Mom', avatar: '👩', stars: 89, rank: 3, isMe: false },
    { id: 4, name: 'Dad', avatar: '👨', stars: 67, rank: 4, isMe: false },
  ]

  const challenges = [
    'Beat my homework streak!',
    'Can you earn more stars this week?',
    'Challenge: Complete more chores than me!',
    'Race to save $30 first!',
    'Who can stay under screen time longer?'
  ]

  const rewards = [
    { id: 1, name: 'Extra Allowance', price: 50, icon: '💵', description: '+$5 bonus this week' },
    { id: 2, name: 'Movie Night Choice', price: 75, icon: '🎬', description: 'Pick the family movie' },
    { id: 3, name: 'Stay Up Late', price: 100, icon: '🌙', description: '1 hour past bedtime' },
    { id: 4, name: 'Special Outing', price: 150, icon: '🎢', description: 'Choose a fun family activity' },
  ]

  const sendChallenge = () => {
    if (selectedChallenge) {
      // TODO: Send challenge to parent for approval
      alert('🎯 Challenge sent to parent for approval! They\'ll forward it to your sibling.')
      setShowChallengeModal(false)
      setSelectedChallenge('')
    }
  }

  const shareBadge = (badge: typeof badges[0]) => {
    if (!badge.unlocked) return
    
    // Generate confetti effect
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
    
    // TODO: Generate and save confetti GIF
    alert(`🎉 Badge shared! Confetti GIF saved to share with family.`)
  }

  const purchaseReward = (reward: typeof rewards[0]) => {
    if (myStars >= reward.price) {
      setMyStars(prev => prev - reward.price)
      alert(`🎁 ${reward.name} purchased! Your parents will be notified.`)
    } else {
      alert(`You need ${reward.price - myStars} more stars!`)
    }
  }

  const getBadgeStatusColor = (badge: typeof badges[0]) => {
    if (badge.unlocked) {
      return badge.level === 'gold' ? 'border-yellow-400 bg-yellow-50' :
             badge.level === 'silver' ? 'border-gray-400 bg-gray-50' :
             'border-amber-400 bg-amber-50'
    }
    return 'border-gray-300 bg-gray-100 opacity-60'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-purple-700 mb-2">Badges & Leaderboard 🏅</h1>
        <p className="text-purple-600">Show off your achievements!</p>
        <div className="bg-yellow-200 px-4 py-2 rounded-full inline-block mt-3 font-bold text-yellow-800">
          {myStars} ⭐ Total Stars
        </div>
      </div>

      {/* Family Leaderboard */}
      <Card className="mb-6 bg-gradient-to-br from-purple-100 to-blue-100 border-purple-200">
        <CardHeader>
          <CardTitle className="text-lg text-purple-700 flex items-center gap-2">
            👨‍👩‍👧‍👦 Family Leaderboard (This Week)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {familyMembers.map((member) => (
              <div
                key={member.id}
                className={`flex-shrink-0 text-center p-4 rounded-xl min-w-[100px] ${
                  member.isMe 
                    ? 'bg-gradient-to-br from-yellow-200 to-orange-200 border-2 border-yellow-400' 
                    : 'bg-white/50 backdrop-blur-sm'
                }`}
              >
                <div className="relative">
                  <div className="text-4xl mb-2">{member.avatar}</div>
                  {member.rank === 1 && (
                    <div className="absolute -top-2 -right-2 text-2xl">👑</div>
                  )}
                </div>
                <div className={`font-bold text-sm ${member.isMe ? 'text-orange-700' : 'text-gray-700'}`}>
                  {member.name}
                </div>
                <div className={`text-xs ${member.isMe ? 'text-orange-600' : 'text-gray-600'}`}>
                  #{member.rank} • {member.stars} ⭐
                </div>
              </div>
            ))}
          </div>
          
          <Button
            onClick={() => setShowChallengeModal(true)}
            className="w-full mt-4 bg-purple-500 hover:bg-purple-600 text-white font-bold"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Challenge to Sibling
          </Button>
        </CardContent>
      </Card>

      {/* My Achievements Grid */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg text-gray-700 flex items-center gap-2">
            🏆 My Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {badges.map((badge) => (
              <button
                key={badge.id}
                onClick={() => setShowBadgeDetail(badge)}
                onLongPress={() => shareBadge(badge)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${getBadgeStatusColor(badge)}`}
              >
                <div className="text-center">
                  <div className="relative">
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    {!badge.unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                  </div>
                  
                  <h4 className={`font-bold text-sm mb-1 ${badge.unlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                    {badge.name}
                  </h4>
                  
                  {badge.unlocked ? (
                    <div className="flex items-center justify-center gap-1 text-xs">
                      <Crown className="w-3 h-3 text-yellow-600" />
                      <span className="text-yellow-700 font-bold">Unlocked!</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Progress 
                        value={(badge.progress / badge.requirement) * 100} 
                        className="h-2"
                      />
                      <div className="text-xs text-gray-600">
                        {badge.progress}/{badge.requirement}
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            💡 Long-press unlocked badges to share with family!
          </div>
        </CardContent>
      </Card>

      {/* Spend Stars Button */}
      <div className="fixed bottom-24 left-4 right-4 z-10">
        <Button 
          onClick={() => setShowRewardStore(true)}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 text-lg shadow-xl"
        >
          <Star className="w-5 h-5 mr-2" />
          Spend {myStars} Stars in Reward Store
        </Button>
      </div>

      {/* Badge Detail Modal */}
      {showBadgeDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white m-4 max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-center text-lg text-purple-700 flex items-center justify-center gap-2">
                {showBadgeDetail.icon} {showBadgeDetail.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-4">{showBadgeDetail.description}</p>
                
                {showBadgeDetail.unlocked ? (
                  <div className="bg-green-100 p-4 rounded-lg">
                    <div className="text-2xl mb-2">🎉</div>
                    <div className="font-bold text-green-700 mb-2">Achievement Unlocked!</div>
                    <div className="text-sm text-green-600">
                      Completed on {new Date().toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="font-bold text-gray-700 mb-2">Progress</div>
                    <Progress 
                      value={(showBadgeDetail.progress / showBadgeDetail.requirement) * 100} 
                      className="h-3 mb-2"
                    />
                    <div className="text-sm text-gray-600">
                      {showBadgeDetail.progress} / {showBadgeDetail.requirement} completed
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      {showBadgeDetail.requirement - showBadgeDetail.progress} more to unlock!
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowBadgeDetail(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
                {showBadgeDetail.unlocked && (
                  <Button 
                    onClick={() => {
                      shareBadge(showBadgeDetail)
                      setShowBadgeDetail(null)
                    }}
                    className="flex-1 bg-purple-500 hover:bg-purple-600"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Challenge Modal */}
      {showChallengeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white m-4 max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-center text-lg text-purple-700">
                Send Challenge 🎯
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-center">
                Choose a challenge to send to your sibling!
              </p>
              
              <div className="space-y-2">
                {challenges.map((challenge, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedChallenge(challenge)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      selectedChallenge === challenge 
                        ? 'border-purple-400 bg-purple-50' 
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {challenge}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowChallengeModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={sendChallenge}
                  className="flex-1 bg-purple-500 hover:bg-purple-600"
                  disabled={!selectedChallenge}
                >
                  Send Challenge
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reward Store Modal */}
      {showRewardStore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white m-4 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-center text-lg text-yellow-700 flex items-center justify-center gap-2">
                🏪 Reward Store ({myStars} ⭐ available)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4">
                {rewards.map((reward) => (
                  <button
                    key={reward.id}
                    onClick={() => purchaseReward(reward)}
                    disabled={myStars < reward.price}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      myStars >= reward.price
                        ? 'border-yellow-300 bg-yellow-50 hover:border-yellow-400'
                        : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{reward.icon}</div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-800">{reward.name}</div>
                        <div className="text-sm text-gray-600">{reward.description}</div>
                        <div className="text-yellow-600 font-bold flex items-center gap-1 mt-1">
                          {reward.price} <Star className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <Button 
                onClick={() => setShowRewardStore(false)}
                className="w-full"
              >
                Close Store
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confetti Overlay */}
      {showConfetti && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-center animate-bounce">
            <div className="text-8xl mb-4">🎉</div>
            <div className="text-4xl font-bold text-white drop-shadow-lg">
              BADGE SHARED!
            </div>
            <div className="text-2xl text-white drop-shadow-lg">
              Confetti GIF saved! 📱
            </div>
          </div>
        </div>
      )}
    </div>
  )
}