'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { DollarSign, Plus, Minus, TrendingUp, Edit3, Send, Target } from 'lucide-react'
import { useWallet } from '@/hooks/useWallet'

/**
 * School Age Wallet (Blueprint 6.4.3)
 * 
 * Per blueprint:
 * - Balance Header: total allowance, savings goal progress ring
 * - Earnings Feed: chronological list of chores/stars converted to currency; green + amounts
 * - Spend Log: red − amounts with category icon; tap for detail & note
 * - Request Payout button: sends parent approval push
 * - Savings Goal Editor (pencil icon): set goal item & amount; progress bar updates in real-time
 */
export default function SchoolAgeWalletPage() {
  const searchParams = useSearchParams()
  const shouldAddExpense = searchParams?.get('add') === 'expense'

  const [childId, setChildId] = useState<string | null>(null)
  const [showGoalEditor, setShowGoalEditor] = useState(false)
  const [showAddTransaction, setShowAddTransaction] = useState(shouldAddExpense)
  const [showTransactionDetail, setShowTransactionDetail] = useState<any>(null)

  // Get child ID from session or URL params
  useEffect(() => {
    // TODO: Get actual child ID from context or URL
    setChildId('child-1') // Placeholder
  }, [])

  // Fetch real wallet data
  const { 
    data: walletData, 
    addTransaction, 
    requestPayout, 
    setSavingsGoal: updateSavingsGoal,
    formatCurrency,
    getCategoryIcon,
    getSavingsProgress,
    getSavingsRemaining,
    canRequestPayout,
    isLoading: walletLoading 
  } = useWallet(childId)

  // Use real data or fallback to defaults
  const balance = walletData?.balance || 0
  const savingsGoal = walletData?.savingsGoal ? {
    item: walletData.savingsGoal.item,
    amount: walletData.savingsGoal.targetAmount,
    saved: balance
  } : { item: 'New Goal', amount: 100, saved: 0 }
  const transactions = walletData?.transactions || []
  const stats = walletData?.stats
  const pendingPayout = stats?.hasPendingPayout || false

  // Transform transactions for UI compatibility
  const transformedTransactions = transactions.map(t => ({
    id: t.id,
    type: t.amount > 0 ? 'earning' : 'spending',
    amount: t.amount,
    description: t.description,
    category: t.category,
    icon: getCategoryIcon(t.category),
    date: new Date(t.createdAt),
    note: t.notes || ''
  }))

  const [newTransaction, setNewTransaction] = useState({
    type: 'spending',
    amount: '',
    description: '',
    category: 'other',
    note: ''
  })

  const categories = {
    earning: {
      chores: { icon: '🧹', label: 'Chores' },
      stars: { icon: '⭐', label: 'Stars' },
      bonus: { icon: '🎯', label: 'Bonus' },
      allowance: { icon: '💰', label: 'Allowance' },
    },
    spending: {
      food: { icon: '🍕', label: 'Food' },
      toys: { icon: '🎮', label: 'Toys & Games' },
      treats: { icon: '🍭', label: 'Treats' },
      books: { icon: '📚', label: 'Books' },
      other: { icon: '🛍️', label: 'Other' },
    }
  }

  const savingsProgress = getSavingsProgress()
  const totalEarnings = stats?.totalEarnings || 0
  const totalSpending = stats?.totalSpending || 0

  const handleRequestPayout = async () => {
    try {
      const payoutAmount = Math.min(balance, 50) // Max $50 payout
      await requestPayout(payoutAmount, 'Requested from wallet interface')
      alert('💸 Payout request sent to parent! You\'ll get a notification when approved.')
    } catch (error) {
      alert('Failed to request payout. Please try again.')
    }
  }

  const handleUpdateSavingsGoal = async (newGoal: { item: string, amount: number }) => {
    try {
      await updateSavingsGoal(newGoal.item, newGoal.amount)
      setShowGoalEditor(false)
    } catch (error) {
      alert('Failed to update savings goal. Please try again.')
    }
  }

  const handleAddTransaction = async () => {
    if (newTransaction.amount && newTransaction.description) {
      try {
        const amount = parseFloat(newTransaction.amount)
        const finalAmount = newTransaction.type === 'spending' ? -amount : amount
        
        await addTransaction({
          amount: finalAmount,
          description: newTransaction.description,
          category: newTransaction.category,
          notes: newTransaction.note,
          source: 'manual'
        })
        
        setNewTransaction({ type: 'spending', amount: '', description: '', category: 'other', note: '' })
        setShowAddTransaction(false)
      } catch (error) {
        alert('Failed to add transaction. Please try again.')
      }
    }
  }

  // Remove duplicate formatCurrency - using the one from useWallet hook

  const formatDate = (date: Date) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    
    if (date >= today) return 'Today'
    if (date >= yesterday) return 'Yesterday'
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-green-700 mb-2">My Wallet 💰</h1>
        <p className="text-green-600">Track your money and reach your goals!</p>
      </div>

      {/* Balance Header */}
      <Card className="mb-6 bg-gradient-to-br from-green-100 to-emerald-100 border-green-200">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-green-700 mb-2">
              {formatCurrency(balance)}
            </div>
            <p className="text-green-600">Current Balance</p>
          </div>

          {/* Savings Goal Progress */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-green-700">Savings Goal</h3>
              </div>
              <button
                onClick={() => setShowGoalEditor(true)}
                className="p-1 hover:bg-green-200 rounded-full transition-colors"
              >
                <Edit3 className="w-4 h-4 text-green-600" />
              </button>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-green-700">{savingsGoal.item}</span>
              <span className="font-bold text-green-700">
                {formatCurrency(savingsGoal.saved)} / {formatCurrency(savingsGoal.amount)}
              </span>
            </div>
            
            <Progress value={savingsProgress} className="h-3 mb-2" />
            
            <div className="text-center text-sm text-green-600">
              {savingsProgress >= 100 ? (
                <span className="font-bold text-green-700">🎉 Goal reached!</span>
              ) : (
                <span>
                  {formatCurrency(getSavingsRemaining())} left to save
                </span>
              )}
            </div>
          </div>

          {/* Request Payout Button */}
          <Button
            onClick={handleRequestPayout}
            disabled={pendingPayout || !canRequestPayout(5)}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold"
          >
            <Send className="w-4 h-4 mr-2" />
            {pendingPayout ? 'Request Pending...' : 'Request Payout'}
          </Button>
          
          {!canRequestPayout(5) && !pendingPayout && (
            <p className="text-center text-sm text-gray-500 mt-2">
              Minimum $5.00 required for payout
            </p>
          )}
          
          {pendingPayout && stats?.pendingPayoutAmount && (
            <p className="text-center text-sm text-orange-600 mt-2">
              Pending: {formatCurrency(stats.pendingPayoutAmount)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-green-700">
              {formatCurrency(totalEarnings)}
            </div>
            <p className="text-sm text-green-600">Total Earned</p>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-red-700">
              {formatCurrency(totalSpending)}
            </div>
            <p className="text-sm text-red-600">Total Spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Feed */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg text-gray-700 flex items-center gap-2">
            📊 Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transformedTransactions.map((transaction) => (
              <button
                key={transaction.id}
                onClick={() => setShowTransactionDetail(transaction)}
                className="w-full p-4 rounded-lg border transition-all duration-200 hover:shadow-md text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{transaction.icon}</div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800">{transaction.description}</div>
                    <div className="text-sm text-gray-600">{formatDate(transaction.date)}</div>
                  </div>
                  <div className={`font-bold text-lg ${
                    transaction.type === 'earning' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'earning' ? '+' : ''}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              </button>
            ))}
            
            {transformedTransactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No transactions yet</p>
                <p className="text-sm">Add your first transaction to get started!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Transaction Button */}
      <button
        onClick={() => setShowAddTransaction(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-full shadow-xl hover:scale-110 transition-all flex items-center justify-center z-40"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Savings Goal Editor Modal */}
      {showGoalEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white m-4 max-w-sm w-full">
            <CardHeader>
              <CardTitle className="text-center text-lg text-green-700">
                Edit Savings Goal 🎯
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="What are you saving for?"
                defaultValue={savingsGoal.item}
                onChange={(e) => setSavingsGoal(prev => ({ ...prev, item: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Goal amount"
                defaultValue={savingsGoal.amount}
                onChange={(e) => setSavingsGoal(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              />
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowGoalEditor(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleUpdateSavingsGoal({ item: savingsGoal.item, amount: savingsGoal.amount })}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  Save Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white m-4 max-w-sm w-full">
            <CardHeader>
              <CardTitle className="text-center text-lg text-blue-700">
                Add Transaction 💸
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={() => setNewTransaction(prev => ({ ...prev, type: 'earning' }))}
                  variant={newTransaction.type === 'earning' ? 'default' : 'outline'}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Earning
                </Button>
                <Button
                  onClick={() => setNewTransaction(prev => ({ ...prev, type: 'spending' }))}
                  variant={newTransaction.type === 'spending' ? 'default' : 'outline'}
                  className="flex-1"
                >
                  <Minus className="w-4 h-4 mr-1" />
                  Spending
                </Button>
              </div>

              <Input
                type="number"
                placeholder="Amount"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
              />

              <Input
                placeholder="Description"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
              />

              <select
                value={newTransaction.category}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                {Object.entries(categories[newTransaction.type]).map(([key, cat]) => (
                  <option key={key} value={key}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>

              <Input
                placeholder="Note (optional)"
                value={newTransaction.note}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, note: e.target.value }))}
              />

              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowAddTransaction(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddTransaction}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                  disabled={!newTransaction.amount || !newTransaction.description}
                >
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {showTransactionDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white m-4 max-w-sm w-full">
            <CardHeader>
              <CardTitle className="text-center text-lg text-gray-700 flex items-center justify-center gap-2">
                {showTransactionDetail.icon} Transaction Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-3xl font-bold mb-2 ${
                  showTransactionDetail.type === 'earning' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {showTransactionDetail.type === 'earning' ? '+' : ''}
                  {formatCurrency(showTransactionDetail.amount)}
                </div>
                <div className="font-bold text-gray-800">{showTransactionDetail.description}</div>
                <div className="text-sm text-gray-600">
                  {showTransactionDetail.date.toLocaleDateString()} at {showTransactionDetail.date.toLocaleTimeString()}
                </div>
              </div>
              
              {showTransactionDetail.note && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-bold text-gray-700 mb-1">Note:</h4>
                  <p className="text-gray-600">{showTransactionDetail.note}</p>
                </div>
              )}
              
              <Button 
                onClick={() => setShowTransactionDetail(null)}
                className="w-full"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}