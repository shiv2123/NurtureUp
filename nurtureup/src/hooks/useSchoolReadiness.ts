'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

export interface SchoolReadinessSkill {
  id: string
  childId: string
  category: string
  skill: string
  level: number // 1-4 scale
  notes?: string
  assessedAt: string
  assessedBy?: string
}

export interface ReadinessCategory {
  name: string
  skills: SchoolReadinessSkill[]
  averageLevel: number
  progress: number
}

export interface SchoolReadinessData {
  skills: SchoolReadinessSkill[]
  categories: ReadinessCategory[]
  overallReadiness: number
  recommendations: string[]
}

export function useSchoolReadiness(childId: string | null) {
  const { data: session } = useSession()
  const [data, setData] = useState<SchoolReadinessData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReadinessData = useCallback(async () => {
    if (!childId || !session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/child/school-readiness?childId=${childId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch school readiness data')
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [childId, session])

  const assessSkill = async (skillData: {
    childId: string
    category: string
    skill: string
    level: number
    notes?: string
  }) => {
    if (!session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/child/school-readiness', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...skillData,
          assessedAt: new Date().toISOString()
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to assess skill')
      }

      // Refresh data after assessment
      await fetchReadinessData()
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateSkillAssessment = async (id: string, updateData: {
    level?: number
    notes?: string
  }) => {
    if (!session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/child/school-readiness', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...updateData,
          assessedAt: new Date().toISOString()
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update skill assessment')
      }

      // Refresh data after update
      await fetchReadinessData()
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReadinessData()
  }, [fetchReadinessData])

  // Helper functions for readiness analysis
  const getSkillsByCategory = (category: string) => {
    return data?.skills?.filter(skill => skill.category === category) || []
  }

  const getCategoryProgress = (category: string) => {
    const skills = getSkillsByCategory(category)
    if (skills.length === 0) return 0
    
    const totalPoints = skills.reduce((sum, skill) => sum + skill.level, 0)
    const maxPoints = skills.length * 4 // 4 is max level
    return Math.round((totalPoints / maxPoints) * 100)
  }

  const getOverallReadiness = () => {
    if (!data?.skills || data.skills.length === 0) return 0
    
    const totalPoints = data.skills.reduce((sum, skill) => sum + skill.level, 0)
    const maxPoints = data.skills.length * 4
    return Math.round((totalPoints / maxPoints) * 100)
  }

  const getRecommendations = () => {
    if (!data?.skills) return []
    
    const recommendations: string[] = []
    const categories = ['social', 'emotional', 'cognitive', 'physical', 'communication']
    
    categories.forEach(category => {
      const skills = getSkillsByCategory(category)
      const lowSkills = skills.filter(skill => skill.level < 3)
      
      if (lowSkills.length > 0) {
        recommendations.push(`Focus on ${category} skills: ${lowSkills.map(s => s.skill).join(', ')}`)
      }
    })
    
    if (recommendations.length === 0) {
      recommendations.push('Great progress! Continue practicing all areas for school readiness.')
    }
    
    return recommendations
  }

  return {
    data,
    isLoading,
    error,
    assessSkill,
    updateSkillAssessment,
    refetch: fetchReadinessData,
    // Helper getters
    getSkillsByCategory,
    getCategoryProgress,
    getOverallReadiness,
    getRecommendations,
  }
}