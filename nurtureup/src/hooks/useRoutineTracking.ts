'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface RoutineStats {
  lastMeal: number // hours ago
  lastNap: number // hours ago
  feedsToday: number
  sleepHoursToday: number
  mealStatus: 'good' | 'warning' | 'urgent'
  napStatus: 'good' | 'warning' | 'urgent'
}

export function useRoutineTracking(childId?: string) {
  const { data: session } = useSession()
  const [stats, setStats] = useState<RoutineStats>({
    lastMeal: 0,
    lastNap: 0,
    feedsToday: 0,
    sleepHoursToday: 0,
    mealStatus: 'good',
    napStatus: 'good'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRoutineData = async () => {
    if (!session || !childId) return

    setLoading(true)
    setError(null)
    
    try {
      // Fetch feeding and sleep data in parallel
      const [feedingResponse, sleepResponse] = await Promise.all([
        fetch(`/api/child/feeding?childId=${childId}&limit=10`),
        fetch(`/api/child/sleep?childId=${childId}&limit=10`)
      ])

      if (!feedingResponse.ok || !sleepResponse.ok) {
        throw new Error('Failed to fetch routine data')
      }

      const [feedingData, sleepData] = await Promise.all([
        feedingResponse.json(),
        sleepResponse.json()
      ])

      // Calculate hours since last meal
      const lastFeedTime = feedingData.stats?.lastFeeding?.startTime
      const lastMealHours = lastFeedTime 
        ? Math.floor((Date.now() - new Date(lastFeedTime).getTime()) / (1000 * 60 * 60))
        : 0

      // Calculate hours since last sleep
      const lastSleepTime = sleepData.stats?.lastSleep?.endTime || sleepData.stats?.lastSleep?.startTime
      const lastNapHours = lastSleepTime
        ? Math.floor((Date.now() - new Date(lastSleepTime).getTime()) / (1000 * 60 * 60))
        : 0

      // Determine status based on time intervals (toddler-appropriate)
      const mealStatus = lastMealHours > 4 ? 'urgent' : lastMealHours > 3 ? 'warning' : 'good'
      const napStatus = lastNapHours > 6 ? 'urgent' : lastNapHours > 4 ? 'warning' : 'good'

      setStats({
        lastMeal: lastMealHours,
        lastNap: lastNapHours,
        feedsToday: feedingData.stats?.todayFeedings || 0,
        sleepHoursToday: Math.round((sleepData.stats?.todaySleep || 0) / 60), // Convert minutes to hours
        mealStatus,
        napStatus
      })

    } catch (error) {
      console.error('Error fetching routine data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load routine data')
    } finally {
      setLoading(false)
    }
  }

  const logMeal = async (type: 'breakfast' | 'lunch' | 'dinner' | 'snack', notes?: string) => {
    if (!session || !childId) return false

    try {
      const response = await fetch('/api/child/feeding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId,
          type: 'solid',
          amount: null,
          notes: `${type}${notes ? ': ' + notes : ''}`,
          startTime: new Date().toISOString()
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to log meal')
      }

      // Refresh data after logging
      await fetchRoutineData()
      return true

    } catch (error) {
      console.error('Error logging meal:', error)
      setError(error instanceof Error ? error.message : 'Failed to log meal')
      return false
    }
  }

  const logNap = async (duration?: number, notes?: string) => {
    if (!session || !childId) return false

    try {
      const startTime = new Date()
      const endTime = duration ? new Date(startTime.getTime() + duration * 60 * 1000) : new Date()

      const response = await fetch('/api/child/sleep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          sleepType: 'nap',
          quality: 'good',
          notes
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to log nap')
      }

      // Refresh data after logging
      await fetchRoutineData()
      return true

    } catch (error) {
      console.error('Error logging nap:', error)
      setError(error instanceof Error ? error.message : 'Failed to log nap')
      return false
    }
  }

  useEffect(() => {
    fetchRoutineData()
  }, [session, childId])

  return {
    stats,
    loading,
    error,
    logMeal,
    logNap,
    refreshData: fetchRoutineData
  }
}