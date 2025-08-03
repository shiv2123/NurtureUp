'use client'

import React from 'react'
import { StageProvider, useStageContext, useStageTheme } from '@/contexts/StageContext'
import { StageNavigation } from '@/components/navigation/StageNavigation'
import { ParentNavigation } from '@/components/parent/ParentNavigation'
import { Child } from '@/hooks/useStage'
import { getParentStage, getStageTheme } from '@/lib/stage-engine'
import { cn } from '@/lib/utils'

interface StageAdaptiveLayoutProps {
  children: React.ReactNode
  childrenData?: Child[]
  className?: string
}

function StageAdaptiveLayoutInner({ children, childrenData, className }: StageAdaptiveLayoutProps) {
  const { state, setUserType, addChild, setActiveChild, setParentStage } = useStageContext()
  const { theme, isChildUI, isParentUI } = useStageTheme()
  
  // Initialize with children data and calculate parent stage
  React.useEffect(() => {
    if (childrenData && state.children.length === 0) {
      // Only add children if state is empty to prevent infinite loop
      if (childrenData.length > 0) {
        childrenData.forEach(child => addChild(child))
        setActiveChild(childrenData[0].id)
      }
      
      // Calculate and set parent stage
      const parentStage = getParentStage(childrenData)
      setParentStage(parentStage)
      setUserType('parent')
    }
  }, [childrenData, state.children.length, addChild, setActiveChild, setUserType, setParentStage])
  
  // Apply stage-specific styling based on parent stage
  const parentStage = state.parentStage || 'ttc_pregnancy'
  const stageTheme = getStageTheme(parentStage)
  
  const dynamicStyles = {
    '--stage-primary': stageTheme.primary,
    '--nu-color-primary': stageTheme.primary,
  } as React.CSSProperties
  
  return (
    <div 
      className={cn(
        "min-h-screen transition-all duration-normal",
        isChildUI && "font-child",
        isParentUI && "font-sans",
        className
      )}
      style={dynamicStyles}
      data-stage={parentStage}
    >
      {/* Stage transition preview banner */}
      {state.transitionPending && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div 
            className="px-4 py-2 rounded-full text-white text-sm font-medium shadow-lg backdrop-blur-sm"
            style={{ backgroundColor: theme?.primary || '#4F8EF7' }}
          >
            🎉 New features unlocked! Preview upcoming stage
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="pb-20 lg:pb-0">
        {children}
      </div>
      
      {/* Stage-aware navigation - Parent specific */}
      <ParentNavigation />
      
      {/* Stage info overlay for demo purposes */}
      {process.env.NODE_ENV === 'development' && parentStage && (
        <div className="fixed bottom-24 left-4 bg-black/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
          Parent Stage: {parentStage}
        </div>
      )}
    </div>
  )
}

export function StageAdaptiveLayout(props: StageAdaptiveLayoutProps) {
  return (
    <StageProvider>
      <StageAdaptiveLayoutInner {...props} />
    </StageProvider>
  )
}

export default StageAdaptiveLayout