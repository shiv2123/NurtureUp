'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { ChildStage, ParentStage, StageConfig } from '@/lib/stage-engine'
import { useChildStage, useParentStage, Child } from '@/hooks/useStage'

// Stage Context Types
export interface StageState {
  currentUser: 'parent' | 'child' | null
  activeChildId: string | null
  children: Child[]
  parentStage: ParentStage | null
  childStage: ChildStage | null
  stageConfig: StageConfig | null
  stageTheme: any
  transitionPending: boolean
  previewMode: boolean
}

export type StageAction =
  | { type: 'SET_USER_TYPE'; payload: 'parent' | 'child' }
  | { type: 'SET_ACTIVE_CHILD'; payload: string }
  | { type: 'ADD_CHILD'; payload: Child }
  | { type: 'UPDATE_CHILD'; payload: { id: string; updates: Partial<Child> } }
  | { type: 'REMOVE_CHILD'; payload: string }
  | { type: 'SET_CHILDREN'; payload: Child[] }
  | { type: 'SET_PARENT_STAGE'; payload: ParentStage }
  | { type: 'FORCE_STAGE_TRANSITION'; payload: { childId: string; newStage: ChildStage } }
  | { type: 'ENABLE_PREVIEW_MODE'; payload: ChildStage | ParentStage }
  | { type: 'DISABLE_PREVIEW_MODE' }

const initialState: StageState = {
  currentUser: null,
  activeChildId: null,
  children: [],
  parentStage: null,
  childStage: null,
  stageConfig: null,
  stageTheme: null,
  transitionPending: false,
  previewMode: false,
}

function stageReducer(state: StageState, action: StageAction): StageState {
  switch (action.type) {
    case 'SET_USER_TYPE':
      return {
        ...state,
        currentUser: action.payload,
      }
      
    case 'SET_ACTIVE_CHILD':
      return {
        ...state,
        activeChildId: action.payload,
      }
      
    case 'ADD_CHILD':
      return {
        ...state,
        children: [...state.children, action.payload],
      }
      
    case 'UPDATE_CHILD':
      return {
        ...state,
        children: state.children.map(child =>
          child.id === action.payload.id
            ? { ...child, ...action.payload.updates }
            : child
        ),
      }
      
    case 'REMOVE_CHILD':
      return {
        ...state,
        children: state.children.filter(child => child.id !== action.payload),
        activeChildId: state.activeChildId === action.payload ? null : state.activeChildId,
      }
      
    case 'SET_CHILDREN':
      return {
        ...state,
        children: action.payload,
      }
      
    case 'SET_PARENT_STAGE':
      return {
        ...state,
        parentStage: action.payload,
      }
      
    case 'FORCE_STAGE_TRANSITION':
      return {
        ...state,
        children: state.children.map(child =>
          child.id === action.payload.childId
            ? { ...child, stage: action.payload.newStage }
            : child
        ),
      }
      
    case 'ENABLE_PREVIEW_MODE':
      return {
        ...state,
        previewMode: true,
      }
      
    case 'DISABLE_PREVIEW_MODE':
      return {
        ...state,
        previewMode: false,
      }
      
    default:
      return state
  }
}

// Create Context
const StageContext = createContext<{
  state: StageState
  dispatch: React.Dispatch<StageAction>
  activeChild: Child | null
  // Helper functions
  setUserType: (type: 'parent' | 'child') => void
  setActiveChild: (childId: string) => void
  addChild: (child: Child) => void
  updateChild: (id: string, updates: Partial<Child>) => void
  removeChild: (childId: string) => void
  setParentStage: (stage: ParentStage) => void
  forceStageTransition: (childId: string, newStage: ChildStage) => void
  enablePreviewMode: (stage: ChildStage | ParentStage) => void
  disablePreviewMode: () => void
} | null>(null)

// Stage Provider Component
export function StageProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(stageReducer, initialState)
  
  // Get active child
  const activeChild = state.children.find(child => child.id === state.activeChildId) || null
  
  // Use stage hooks to calculate current stages
  const parentStageHook = useParentStage(state.children)
  const childStageHook = useChildStage(activeChild)
  
  // Update state when stage hooks change
  useEffect(() => {
    // This will trigger re-renders when stages change
    // The actual stage values come from the hooks, not the reducer state
  }, [parentStageHook.stage, childStageHook.stage])
  
  // Helper functions
  const setUserType = (type: 'parent' | 'child') => {
    dispatch({ type: 'SET_USER_TYPE', payload: type })
  }
  
  const setActiveChild = (childId: string) => {
    dispatch({ type: 'SET_ACTIVE_CHILD', payload: childId })
  }
  
  const addChild = (child: Child) => {
    dispatch({ type: 'ADD_CHILD', payload: child })
  }
  
  const updateChild = (id: string, updates: Partial<Child>) => {
    dispatch({ type: 'UPDATE_CHILD', payload: { id, updates } })
  }
  
  const removeChild = (childId: string) => {
    dispatch({ type: 'REMOVE_CHILD', payload: childId })
  }
  
  const setParentStage = (stage: ParentStage) => {
    dispatch({ type: 'SET_PARENT_STAGE', payload: stage })
  }
  
  const forceStageTransition = (childId: string, newStage: ChildStage) => {
    dispatch({ type: 'FORCE_STAGE_TRANSITION', payload: { childId, newStage } })
  }
  
  const enablePreviewMode = (stage: ChildStage | ParentStage) => {
    dispatch({ type: 'ENABLE_PREVIEW_MODE', payload: stage })
  }
  
  const disablePreviewMode = () => {
    dispatch({ type: 'DISABLE_PREVIEW_MODE' })
  }
  
  // Enhanced state with computed values
  const enhancedState: StageState = {
    ...state,
    parentStage: state.parentStage || parentStageHook.stage,
    childStage: childStageHook.stage,
    stageConfig: state.currentUser === 'parent' ? parentStageHook.stageConfig : childStageHook.stageConfig,
    stageTheme: state.currentUser === 'parent' ? parentStageHook.stageTheme : childStageHook.stageTheme,
    transitionPending: childStageHook.transitionInfo?.shouldTransition || false,
  }
  
  const value = {
    state: enhancedState,
    dispatch,
    activeChild,
    setUserType,
    setActiveChild,
    addChild,
    updateChild,
    removeChild,
    setParentStage,
    forceStageTransition,
    enablePreviewMode,
    disablePreviewMode,
  }
  
  return (
    <StageContext.Provider value={value}>
      {children}
    </StageContext.Provider>
  )
}

// Hook to use Stage Context
export function useStageContext() {
  const context = useContext(StageContext)
  
  if (!context) {
    throw new Error('useStageContext must be used within a StageProvider')
  }
  
  return context
}

// Hook for theme-aware styling based on current stage
export function useStageTheme() {
  const { state } = useStageContext()
  
  return {
    theme: state.stageTheme,
    primaryColor: state.stageTheme?.primary || '#4F8EF7',
    isChildUI: state.stageConfig?.uiTheme === 'child',
    isParentUI: state.stageConfig?.uiTheme === 'parent',
    stage: state.currentUser === 'parent' ? state.parentStage : state.childStage,
  }
}

export default StageContext