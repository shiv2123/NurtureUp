'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'

export function WalletDisplay() {
  const [stars, setStars] = useState(0)
  const [coins, setCoins] = useState(0)
  const [savingsGoals, setSavingsGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWallet() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/child/wallet')
        if (!res.ok) throw new Error('Failed to fetch wallet')
        const data = await res.json()
        setStars(data.stars)
        setCoins(data.coins)
        setSavingsGoals(data.savingsGoals)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchWallet()
  }, [])

  if (loading) {
    return <div className="text-center text-black py-8">Loading wallet...</div>
  }
  if (error) {
    return <div className="text-center text-error py-8">{error}</div>
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-sunny-yellow/30 text-center">
          <CardContent className="p-6">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-lg font-bold">Star Jar</div>
            <div className="text-2xl font-child">{stars}</div>
          </CardContent>
        </Card>
        <Card className="bg-mint-green/30 text-center">
          <CardContent className="p-6">
            <div className="text-4xl mb-2">💰</div>
            <div className="text-lg font-bold">Coin Bank</div>
            <div className="text-2xl font-child">{coins}</div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="p-6 text-center text-black">
          {savingsGoals.length === 0 ? (
            <>No savings goals yet. Ask your grown-up to help you set one!</>
          ) : (
            <div>/* Savings goals UI here */</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 