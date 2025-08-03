/**
 * React hooks for stage-aware UI adaptation
 */

import { useState, useEffect, useMemo } from 'react'
import { 
  ChildStage, 
  ParentStage, 
  calculateChildStage, 
  calculateParentStage, 
  getStageConfig, 
  getStageTheme,
  shouldTransitionStage,
  StageConfig 
} from '@/lib/stage-engine'

export interface Child {
  id: string
  name: string
  dateOfBirth: Date
  stage?: ChildStage
}

export interface UseStageOptions {
  autoTransition?: boolean
  transitionBuffer?: number // days before transition
}

/**
 * Hook to get the current stage for a child
 */
export function useChildStage(child: Child | null, options: UseStageOptions = {}) {
  const { autoTransition = true, transitionBuffer = 14 } = options
  
  const [currentStage, setCurrentStage] = useState<ChildStage | null>(
    child ? child.stage || calculateChildStage(child.dateOfBirth) : null
  )
  
  const stageConfig = useMemo(() => {
    return currentStage ? getStageConfig(currentStage) : null
  }, [currentStage])
  
  const stageTheme = useMemo(() => {
    return currentStage ? getStageTheme(currentStage) : null
  }, [currentStage])
  
  // Check for stage transitions
  const transitionInfo = useMemo(() => {
    if (!child || !currentStage) return null
    
    return shouldTransitionStage(currentStage, child.dateOfBirth, transitionBuffer)
  }, [child, currentStage, transitionBuffer])
  
  // Auto-transition if enabled
  useEffect(() => {
    if (child && autoTransition && transitionInfo?.shouldTransition) {
      setCurrentStage(transitionInfo.nextStage!)
    }
  }, [child, autoTransition, transitionInfo])
  
  // Update stage when child changes
  useEffect(() => {
    if (child) {
      const calculatedStage = child.stage || calculateChildStage(child.dateOfBirth)
      setCurrentStage(calculatedStage)
    } else {
      setCurrentStage(null)
    }
  }, [child])
  
  return {
    stage: currentStage,
    stageConfig,
    stageTheme,
    transitionInfo,
    setStage: setCurrentStage,
  }
}

/**
 * Hook to get the current stage for a parent based on their children
 */
export function useParentStage(children: Child[] = [], options: UseStageOptions = {}) {
  const [currentStage, setCurrentStage] = useState<ParentStage>(
    calculateParentStage(children)
  )
  
  const stageConfig = useMemo(() => {
    return getStageConfig(currentStage)
  }, [currentStage])
  
  const stageTheme = useMemo(() => {
    return getStageTheme(currentStage)
  }, [currentStage])
  
  // Update parent stage when children change
  useEffect(() => {
    const newStage = calculateParentStage(children)
    setCurrentStage(newStage)
  }, [children])
  
  return {
    stage: currentStage,
    stageConfig,
    stageTheme,
    setStage: setCurrentStage,
  }
}

/**
 * Hook to provide stage-aware navigation configuration
 */
export function useStageNavigation(stage: ChildStage | ParentStage | null) {
  return useMemo(() => {
    if (!stage) return null
    
    const config = getStageConfig(stage)
    return config.navigation
  }, [stage])
}

/**
 * Hook to adapt UI based on stage
 */
export function useStageUI(stage: ChildStage | ParentStage | null) {
  return useMemo(() => {
    if (!stage) {
      return {
        cardRadius: 'rounded-card-parent',
        fontFamily: 'font-sans',
        primaryColor: 'primary',
        spacing: 'default',
      }
    }
    
    const config = getStageConfig(stage)
    const theme = getStageTheme(stage)
    
    // UI adapts based on stage and theme
    const isChildUI = config.uiTheme === 'child'
    const isEarlyStage = ['toddler', 'early-childhood'].includes(stage)
    
    return {
      cardRadius: isChildUI || isEarlyStage ? 'rounded-card-child' : 'rounded-card-parent',
      fontFamily: isChildUI ? 'font-child' : 'font-sans',
      primaryColor: theme.primary,
      spacing: isEarlyStage ? 'spacious' : 'default',
      fontSize: isEarlyStage ? 'larger' : 'default',
      touchTargets: isEarlyStage ? 'large' : 'default',
    }
  }, [stage])
}

/**
 * Hook to get stage-specific features
 */
export function useStageFeatures(stage: ChildStage | ParentStage | null) {
  return useMemo(() => {
    if (!stage) return []
    
    const config = getStageConfig(stage)
    return config.features
  }, [stage])
}

/**
 * Hook to check if a feature is available in the current stage
 */
export function useFeatureAvailable(stage: ChildStage | ParentStage | null, feature: string) {
  const features = useStageFeatures(stage)
  return features.includes(feature)
}