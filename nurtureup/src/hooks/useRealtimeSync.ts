'use client'

import { useEffect, useCallback, useReducer } from 'react'
import { useSession } from 'next-auth/react'
import { pusherClient } from '@/lib/pusher'

// Sync event types for real-time updates
export type SyncEventType = 
  | 'task_updated'
  | 'task_completed'  
  | 'task_approved'
  | 'task_rejected'
  | 'task_created'
  | 'child_stats_updated'
  | 'badge_earned'
  | 'reward_purchased'
  | 'pet_updated'
  | 'family_member_online'
  | 'family_member_offline'

export interface SyncEvent {
  type: SyncEventType
  data: any
  timestamp: Date
  userId?: string
  familyId: string
}

interface SyncState {
  isConnected: boolean
  lastSync: Date | null
  onlineMembers: Set<string>
  pendingOperations: Map<string, any>
}

type SyncAction = 
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'UPDATE_LAST_SYNC'; payload: Date }
  | { type: 'ADD_ONLINE_MEMBER'; payload: string }
  | { type: 'REMOVE_ONLINE_MEMBER'; payload: string }
  | { type: 'ADD_PENDING_OPERATION'; payload: { id: string; operation: any } }
  | { type: 'REMOVE_PENDING_OPERATION'; payload: string }

const initialState: SyncState = {
  isConnected: false,
  lastSync: null,
  onlineMembers: new Set(),
  pendingOperations: new Map()
}

function syncReducer(state: SyncState, action: SyncAction): SyncState {
  switch (action.type) {
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload }
    case 'UPDATE_LAST_SYNC':
      return { ...state, lastSync: action.payload }
    case 'ADD_ONLINE_MEMBER':
      return { ...state, onlineMembers: new Set([...state.onlineMembers, action.payload]) }
    case 'REMOVE_ONLINE_MEMBER':
      const newOnlineMembers = new Set(state.onlineMembers)
      newOnlineMembers.delete(action.payload)
      return { ...state, onlineMembers: newOnlineMembers }
    case 'ADD_PENDING_OPERATION':
      const newPendingOps = new Map(state.pendingOperations)
      newPendingOps.set(action.payload.id, action.payload.operation)
      return { ...state, pendingOperations: newPendingOps }
    case 'REMOVE_PENDING_OPERATION':
      const removePendingOps = new Map(state.pendingOperations)
      removePendingOps.delete(action.payload)
      return { ...state, pendingOperations: removePendingOps }
    default:
      return state
  }
}

export interface UseRealtimeSyncOptions {
  onEvent?: (event: SyncEvent) => void
  onMemberOnline?: (userId: string) => void
  onMemberOffline?: (userId: string) => void
  onConnectionChange?: (isConnected: boolean) => void
}

export function useRealtimeSync(options: UseRealtimeSyncOptions = {}) {
  const { data: session } = useSession()
  const [state, dispatch] = useReducer(syncReducer, initialState)

  const { onEvent, onMemberOnline, onMemberOffline, onConnectionChange } = options

  // Set up Pusher subscriptions
  useEffect(() => {
    if (!session?.user?.id || !session?.user?.familyId || !pusherClient) return

    const userId = session.user.id
    const familyId = session.user.familyId
    const userRole = session.user.role

    try {
      // Subscribe to real-time sync channels
      const syncChannel = pusherClient.subscribe(`family-${familyId}-sync`)
      const presenceChannel = pusherClient.subscribe(`presence-family-${familyId}`)
      const userChannel = pusherClient.subscribe(`user-${userId}`)

      // Handle sync events
      const handleSyncEvent = (event: SyncEvent) => {
        dispatch({ type: 'UPDATE_LAST_SYNC', payload: new Date() })
        onEvent?.(event)
      }

      // Handle presence events (who's online)
      const handleMemberAdded = (member: { id: string; info: any }) => {
        dispatch({ type: 'ADD_ONLINE_MEMBER', payload: member.id })
        onMemberOnline?.(member.id)
      }

      const handleMemberRemoved = (member: { id: string }) => {
        dispatch({ type: 'REMOVE_ONLINE_MEMBER', payload: member.id })
        onMemberOffline?.(member.id)
      }

      // Bind to sync events
      syncChannel.bind('sync_event', handleSyncEvent)
      userChannel.bind('sync_event', handleSyncEvent)
      
      // Bind to presence events
      presenceChannel.bind('pusher:member_added', handleMemberAdded)
      presenceChannel.bind('pusher:member_removed', handleMemberRemoved)

      // Connection state handlers
      pusherClient.connection.bind('connected', () => {
        dispatch({ type: 'SET_CONNECTED', payload: true })
        onConnectionChange?.(true)
      })

      pusherClient.connection.bind('disconnected', () => {
        dispatch({ type: 'SET_CONNECTED', payload: false })
        onConnectionChange?.(false)
      })

      // Mark as connected if already connected
      if (pusherClient.connection.state === 'connected') {
        dispatch({ type: 'SET_CONNECTED', payload: true })
      }

      return () => {
        syncChannel.unbind('sync_event', handleSyncEvent)
        userChannel.unbind('sync_event', handleSyncEvent)
        presenceChannel.unbind('pusher:member_added', handleMemberAdded)
        presenceChannel.unbind('pusher:member_removed', handleMemberRemoved)
        
        pusherClient.unsubscribe(`family-${familyId}-sync`)
        pusherClient.unsubscribe(`presence-family-${familyId}`)
        pusherClient.unsubscribe(`user-${userId}`)
      }
    } catch (error) {
      console.warn('Failed to set up realtime sync:', error)
    }
  }, [session, onEvent, onMemberOnline, onMemberOffline, onConnectionChange])

  // Optimistic update function
  const performOptimisticUpdate = useCallback(async (
    operationId: string,
    optimisticUpdate: () => void,
    serverOperation: () => Promise<any>,
    rollback?: () => void
  ) => {
    // Apply optimistic update immediately
    optimisticUpdate()
    
    // Track pending operation
    dispatch({ 
      type: 'ADD_PENDING_OPERATION', 
      payload: { id: operationId, operation: { optimisticUpdate, rollback } }
    })

    try {
      // Perform server operation
      const result = await serverOperation()
      
      // Remove from pending operations on success
      dispatch({ type: 'REMOVE_PENDING_OPERATION', payload: operationId })
      
      return result
    } catch (error) {
      // Rollback optimistic update on failure
      if (rollback) {
        rollback()
      }
      
      // Remove from pending operations
      dispatch({ type: 'REMOVE_PENDING_OPERATION', payload: operationId })
      
      throw error
    }
  }, [])

  // Emit sync event to family
  const emitSyncEvent = useCallback(async (eventType: SyncEventType, data: any) => {
    if (!session?.user?.familyId) return

    try {
      // Send to server to broadcast to family
      await fetch('/api/sync/emit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: eventType,
          data,
          familyId: session.user.familyId
        })
      })
    } catch (error) {
      console.warn('Failed to emit sync event:', error)
    }
  }, [session?.user?.familyId])

  return {
    ...state,
    performOptimisticUpdate,
    emitSyncEvent,
    onlineMembers: Array.from(state.onlineMembers),
    hasPendingOperations: state.pendingOperations.size > 0
  }
}