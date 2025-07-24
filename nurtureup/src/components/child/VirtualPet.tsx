'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Pet {
  id: string
  name: string
  type: string
  mood: string
  level: number
  xp: number
  happiness: number
  energy: number
  lastFed: string
  lastPlayed: string
  accessories: string[]
  color: string
}

const petEmojis: Record<string, Record<string, string>> = {
  dragon: {
    happy: '🐲',
    neutral: '🐉',
    sad: '😔🐲',
    sleeping: '😴🐲'
  },
  unicorn: {
    happy: '🦄',
    neutral: '🦄',
    sad: '😢🦄',
    sleeping: '😴🦄'
  },
  robot: {
    happy: '🤖',
    neutral: '🤖',
    sad: '😔🤖',
    sleeping: '😴🤖'
  }
}

export function VirtualPet() {
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<'feed' | 'play' | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPet() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/child/pet')
        if (!res.ok) throw new Error('Failed to fetch pet')
        const data = await res.json()
        setPet(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPet()
  }, [success])

  async function handleFeed() {
    setActionLoading('feed')
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch('/api/child/pet/feed', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to feed pet')
      setSuccess('Your pet enjoyed the meal!')
      setPet(data)
      setTimeout(() => setSuccess(null), 1200)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  async function handlePlay() {
    setActionLoading('play')
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch('/api/child/pet/play', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to play with pet')
      setSuccess('Your pet had fun playing!')
      setPet(data)
      setTimeout(() => setSuccess(null), 1200)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return <div className="text-center text-black py-8">Loading pet...</div>
  }
  if (error) {
    return <div className="text-center text-error py-8">{error}</div>
  }
  if (!pet) {
    return <div className="text-center text-black py-8">No pet found.</div>
  }

  const emoji = petEmojis[pet.type]?.[pet.mood] || '🐾'

  return (
    <Card className="rounded-3xl border border-slate-200 bg-white shadow-soft p-8 flex flex-col items-center">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-child mb-2">{pet.name}</CardTitle>
        <div className="text-center text-black mb-2">Level {pet.level}</div>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="text-7xl mb-4">{emoji}</div>
        <div className="text-lg font-bold mb-2">Mood: {pet.mood.charAt(0).toUpperCase() + pet.mood.slice(1)}</div>
        <div className="flex gap-6 mb-4">
          <div className="text-center">
            <div className="text-xs text-black">Happiness</div>
            <div className="font-bold text-success">{pet.happiness}%</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-black">Energy</div>
            <div className="font-bold text-sky-blue">{pet.energy}%</div>
          </div>
        </div>
        {success && <div className="text-success font-bold mb-2">{success}</div>}
        <div className="flex gap-4">
          <Button variant="mint" onClick={handleFeed} isLoading={actionLoading === 'feed'} disabled={!!actionLoading}>Feed</Button>
          <Button variant="primary" onClick={handlePlay} isLoading={actionLoading === 'play'} disabled={!!actionLoading}>Play</Button>
        </div>
      </CardContent>
    </Card>
  )
} 