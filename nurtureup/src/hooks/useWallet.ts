import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface FinancialTransaction {
  id: string
  childId: string
  amount: number
  description: string
  category: string
  notes?: string
  source: string
  createdAt: string
}

interface SavingsGoal {
  id: string
  childId: string
  item: string
  targetAmount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface WalletStats {
  currentBalance: number
  totalEarnings: number
  totalSpending: number
  monthlyEarnings: number
  monthlySpending: number
  hasPendingPayout: boolean
  pendingPayoutAmount: number
}

interface WalletData {
  transactions: FinancialTransaction[]
  balance: number
  savingsGoal?: SavingsGoal
  stats: WalletStats
  // Legacy compatibility
  stars: number
  coins: number
}

export function useWallet(childId: string | null, type?: 'earning' | 'spending') {
  const { data: session } = useSession()
  const [data, setData] = useState<WalletData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWallet = useCallback(async () => {
    if (!childId || !session) return

    setIsLoading(true)
    setError(null)

    try {
      let url = `/api/child/wallet?childId=${childId}`
      if (type) {
        url += `&type=${type}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch wallet data')
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [childId, session, type])

  const addTransaction = async (transactionData: {
    amount: number
    description: string
    category?: string
    notes?: string
    source?: string
  }) => {
    if (!childId || !session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/child/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId,
          action: 'add_transaction',
          ...transactionData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add transaction')
      }

      // Refresh data after adding transaction
      await fetchWallet()
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const requestPayout = async (amount: number, notes?: string) => {
    if (!childId || !session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/child/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId,
          action: 'request_payout',
          amount,
          notes,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to request payout')
      }

      // Refresh data after payout request
      await fetchWallet()
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const setSavingsGoal = async (goalItem: string, goalAmount: number) => {
    if (!childId || !session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/child/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId,
          action: 'set_savings_goal',
          goalItem,
          goalAmount,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to set savings goal')
      }

      // Refresh data after setting goal
      await fetchWallet()
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateTransaction = async (id: string, updateData: any) => {
    if (!session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/child/wallet', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          action: 'update_transaction',
          ...updateData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update transaction')
      }

      // Refresh data after update
      await fetchWallet()
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTransaction = async (id: string) => {
    if (!session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/child/wallet?id=${id}&type=transaction`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete transaction')
      }

      // Refresh data after deletion
      await fetchWallet()
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWallet()
  }, [fetchWallet])

  // Helper functions
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount))
  }

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      chores: '🧹',
      stars: '⭐',
      bonus: '🎯',
      allowance: '💰',
      food: '🍕',
      toys: '🎮',
      treats: '🍭',
      books: '📚',
      clothes: '👕',
      other: '🛍️'
    }
    return icons[category.toLowerCase()] || '💰'
  }

  const getTransactionColor = (amount: number): string => {
    return amount > 0 ? 'text-green-600' : 'text-red-600'
  }

  const getSavingsProgress = (): number => {
    if (!data?.savingsGoal) return 0
    return Math.min((data.balance / data.savingsGoal.targetAmount) * 100, 100)
  }

  const getSavingsRemaining = (): number => {
    if (!data?.savingsGoal) return 0
    return Math.max(data.savingsGoal.targetAmount - data.balance, 0)
  }

  const canRequestPayout = (amount: number = 5): boolean => {
    return !!(data && data.balance >= amount && !data.stats.hasPendingPayout)
  }

  const getSpendingByCategory = () => {
    if (!data?.transactions) return {}
    
    return data.transactions
      .filter(t => t.amount < 0)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount)
        return acc
      }, {} as Record<string, number>)
  }

  const getEarningsBySource = () => {
    if (!data?.transactions) return {}
    
    return data.transactions
      .filter(t => t.amount > 0)
      .reduce((acc, t) => {
        acc[t.source] = (acc[t.source] || 0) + t.amount
        return acc
      }, {} as Record<string, number>)
  }

  return {
    data,
    isLoading,
    error,
    addTransaction,
    requestPayout,
    setSavingsGoal,
    updateTransaction,
    deleteTransaction,
    refetch: fetchWallet,
    // Helper functions
    formatCurrency,
    getCategoryIcon,
    getTransactionColor,
    getSavingsProgress,
    getSavingsRemaining,
    canRequestPayout,
    getSpendingByCategory,
    getEarningsBySource,
  }
}