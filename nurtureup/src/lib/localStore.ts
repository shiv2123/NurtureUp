'use client'

// Local storage keys
const STORAGE_KEYS = {
  TASKS: 'nurtureup_tasks',
  CHILD_STATS: 'nurtureup_child_stats',
  FAMILY_DATA: 'nurtureup_family_data',
  BADGES: 'nurtureup_badges',
  PET_DATA: 'nurtureup_pet_data',
  PENDING_OPERATIONS: 'nurtureup_pending_operations',
  LAST_SYNC: 'nurtureup_last_sync'
} as const

interface PendingOperation {
  id: string
  type: 'task_complete' | 'task_create' | 'badge_claim' | 'pet_action'
  data: any
  timestamp: Date
  retryCount: number
}

interface CachedData<T> {
  data: T
  timestamp: Date
  ttl?: number // Time to live in milliseconds
}

class LocalStore {
  private isClient = typeof window !== 'undefined'

  // Generic storage methods
  private setItem<T>(key: string, value: T, ttl?: number): void {
    if (!this.isClient) return

    try {
      const cachedData: CachedData<T> = {
        data: value,
        timestamp: new Date(),
        ttl
      }
      localStorage.setItem(key, JSON.stringify(cachedData))
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  }

  private getItem<T>(key: string): T | null {
    if (!this.isClient) return null

    try {
      const item = localStorage.getItem(key)
      if (!item) return null

      const cachedData: CachedData<T> = JSON.parse(item)
      
      // Check if data has expired
      if (cachedData.ttl) {
        const now = new Date().getTime()
        const timestamp = new Date(cachedData.timestamp).getTime()
        if (now - timestamp > cachedData.ttl) {
          localStorage.removeItem(key)
          return null
        }
      }

      return cachedData.data
    } catch (error) {
      console.warn('Failed to read from localStorage:', error)
      return null
    }
  }

  private removeItem(key: string): void {
    if (!this.isClient) return
    localStorage.removeItem(key)
  }

  // Task-specific methods
  cacheTasks(tasks: any[], familyId: string): void {
    this.setItem(`${STORAGE_KEYS.TASKS}_${familyId}`, tasks, 5 * 60 * 1000) // 5 minute TTL
  }

  getCachedTasks(familyId: string): any[] | null {
    return this.getItem(`${STORAGE_KEYS.TASKS}_${familyId}`)
  }

  // Child stats methods
  cacheChildStats(stats: any, childId: string): void {
    this.setItem(`${STORAGE_KEYS.CHILD_STATS}_${childId}`, stats, 10 * 60 * 1000) // 10 minute TTL
  }

  getCachedChildStats(childId: string): any | null {
    return this.getItem(`${STORAGE_KEYS.CHILD_STATS}_${childId}`)
  }

  // Family data methods
  cacheFamilyData(data: any, familyId: string): void {
    this.setItem(`${STORAGE_KEYS.FAMILY_DATA}_${familyId}`, data, 30 * 60 * 1000) // 30 minute TTL
  }

  getCachedFamilyData(familyId: string): any | null {
    return this.getItem(`${STORAGE_KEYS.FAMILY_DATA}_${familyId}`)
  }

  // Badge methods
  cacheBadges(badges: any[], childId: string): void {
    this.setItem(`${STORAGE_KEYS.BADGES}_${childId}`, badges, 60 * 60 * 1000) // 1 hour TTL
  }

  getCachedBadges(childId: string): any[] | null {
    return this.getItem(`${STORAGE_KEYS.BADGES}_${childId}`)
  }

  // Pet data methods
  cachePetData(petData: any, childId: string): void {
    this.setItem(`${STORAGE_KEYS.PET_DATA}_${childId}`, petData, 5 * 60 * 1000) // 5 minute TTL
  }

  getCachedPetData(childId: string): any | null {
    return this.getItem(`${STORAGE_KEYS.PET_DATA}_${childId}`)
  }

  // Pending operations methods
  addPendingOperation(operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>): string {
    const operations = this.getPendingOperations()
    const id = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const newOperation: PendingOperation = {
      id,
      ...operation,
      timestamp: new Date(),
      retryCount: 0
    }

    operations.push(newOperation)
    this.setItem(STORAGE_KEYS.PENDING_OPERATIONS, operations)
    
    return id
  }

  getPendingOperations(): PendingOperation[] {
    return this.getItem(STORAGE_KEYS.PENDING_OPERATIONS) || []
  }

  removePendingOperation(operationId: string): void {
    const operations = this.getPendingOperations()
    const filteredOperations = operations.filter(op => op.id !== operationId)
    this.setItem(STORAGE_KEYS.PENDING_OPERATIONS, filteredOperations)
  }

  incrementRetryCount(operationId: string): void {
    const operations = this.getPendingOperations()
    const operation = operations.find(op => op.id === operationId)
    if (operation) {
      operation.retryCount++
      this.setItem(STORAGE_KEYS.PENDING_OPERATIONS, operations)
    }
  }

  // Sync timestamp methods
  setLastSyncTime(timestamp: Date): void {
    this.setItem(STORAGE_KEYS.LAST_SYNC, timestamp)
  }

  getLastSyncTime(): Date | null {
    return this.getItem(STORAGE_KEYS.LAST_SYNC)
  }

  // Clear methods
  clearCache(pattern?: string): void {
    if (!this.isClient) return

    if (pattern) {
      // Clear specific pattern
      Object.keys(localStorage).forEach(key => {
        if (key.includes(pattern)) {
          localStorage.removeItem(key)
        }
      })
    } else {
      // Clear all NurtureUp data
      Object.values(STORAGE_KEYS).forEach(key => {
        Object.keys(localStorage).forEach(storageKey => {
          if (storageKey.startsWith(key)) {
            localStorage.removeItem(storageKey)
          }
        })
      })
    }
  }

  // Utility methods
  isOnline(): boolean {
    if (!this.isClient) return true
    return navigator.onLine
  }

  getStorageInfo(): { used: number; available: number } {
    if (!this.isClient) return { used: 0, available: 0 }

    try {
      let used = 0
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('nurtureup_')) {
          used += localStorage.getItem(key)?.length || 0
        }
      })

      // Estimate available space (typical browser limit is 5-10MB)
      const estimated = 5 * 1024 * 1024 // 5MB
      return {
        used,
        available: Math.max(0, estimated - used)
      }
    } catch (error) {
      return { used: 0, available: 0 }
    }
  }
}

export const localStore = new LocalStore()