'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface Child {
  id: string
  nickname: string
  avatar?: string
  currentStreak: number
  longestStreak: number
  completedTasks: { completedAt: string }[]
  learningScores: { subject: string; score: number; completedAt: string }[]
}

export function ProgressHubWidgets() {
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProgress() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/parent/progress')
        if (!res.ok) throw new Error('Failed to fetch progress')
        const data = await res.json()
        setChildren(data.children)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProgress()
  }, [])

  if (loading) {
    return <div className="text-center text-black py-8">Loading progress...</div>
  }
  if (error) {
    return <div className="text-center text-error py-8">{error}</div>
  }
  if (children.length === 0) {
    return <div className="rounded-2xl border border-slate-200 bg-white shadow-soft p-6 text-center text-black">No children found.</div>
  }

  return (
    <div className="space-y-8">
      {/* Streaks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold mb-2">Streaks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {children.map(child => (
              <div key={child.id} className="flex items-center gap-4">
                <span className="text-2xl">{child.avatar || '👤'}</span>
                <span className="font-bold text-black">{child.nickname}</span>
                <span className="ml-auto text-success font-bold">🔥 {child.currentStreak} day streak</span>
                <span className="text-xs text-black ml-2">Longest: {child.longestStreak}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Learning Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold mb-2">Recent Learning Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {children.map(child => (
              <div key={child.id} className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{child.avatar || '👤'}</span>
                  <span className="font-bold text-black">{child.nickname}</span>
                </div>
                {child.learningScores.length === 0 ? (
                  <div className="text-xs text-black ml-8">No recent quizzes</div>
                ) : (
                  <div className="ml-8 flex flex-col gap-1">
                    {child.learningScores.map((score, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-mint-green">{score.subject}</span>
                        <span>Score: {score.score}%</span>
                        <span className="text-black">{new Date(score.completedAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 