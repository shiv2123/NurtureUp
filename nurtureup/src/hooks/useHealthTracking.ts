'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

export interface HealthRecord {
  id: string
  childId: string
  type: string
  value?: number
  unit?: string
  notes?: string
  recordDate: string
  createdAt: string
  nextAppointment?: string
}

export interface HealthStats {
  totalRecords: number
  lastCheckup?: HealthRecord
  upcomingAppointments: HealthRecord[]
  vitalsHistory: HealthRecord[]
  averageValues: Record<string, number>
}

export interface HealthData {
  healthRecords: HealthRecord[]
  stats: HealthStats
}

export function useHealthTracking(childId: string | null, type?: string) {
  const { data: session } = useSession()
  const [data, setData] = useState<HealthData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHealthData = useCallback(async () => {
    if (!childId || !session) return

    setIsLoading(true)
    setError(null)

    try {
      let url = `/api/child/health?childId=${childId}`
      if (type) {
        url += `&type=${type}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch health data')
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [childId, session, type])

  const createHealthRecord = async (recordData: {
    childId: string
    type: string
    value?: number
    unit?: string
    notes?: string
    recordDate?: string
    nextAppointment?: string
  }) => {
    if (!session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/child/health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...recordData,
          recordDate: recordData.recordDate || new Date().toISOString()
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create health record')
      }

      // Refresh data after creation
      await fetchHealthData()
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateHealthRecord = async (id: string, updateData: any) => {
    if (!session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/child/health', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...updateData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update health record')
      }

      // Refresh data after update
      await fetchHealthData()
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteHealthRecord = async (id: string) => {
    if (!session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/child/health?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete health record')
      }

      // Refresh data after deletion
      await fetchHealthData()
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthData()
  }, [fetchHealthData])

  // Helper functions for pregnancy/TTC specific data
  const getVitalsByType = (vitalType: string) => {
    return data?.healthRecords?.filter(record => record.type === vitalType) || []
  }

  const getLatestVital = (vitalType: string) => {
    const vitals = getVitalsByType(vitalType)
    return vitals.length > 0 ? vitals[0] : null
  }

  const getAverageVital = (vitalType: string, days: number = 7) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    const recentVitals = getVitalsByType(vitalType).filter(vital => 
      new Date(vital.recordDate) >= cutoffDate && vital.value !== undefined
    )
    
    if (recentVitals.length === 0) return null
    
    const sum = recentVitals.reduce((total, vital) => total + (vital.value || 0), 0)
    return Math.round((sum / recentVitals.length) * 10) / 10
  }

  return {
    data,
    isLoading,
    error,
    createHealthRecord,
    updateHealthRecord,
    deleteHealthRecord,
    refetch: fetchHealthData,
    // Helper getters
    getVitalsByType,
    getLatestVital,
    getAverageVital,
  }
}