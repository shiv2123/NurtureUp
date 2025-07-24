'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [loading, setLoading] = useState<'parent' | 'child' | null>(null)
  const router = useRouter()

  const handleDemoLogin = async (role: 'parent' | 'child') => {
    setLoading(role)
    const email = role === 'parent' ? 'parent@demo.com' : 'child@demo.com'
    const password = 'demo123'
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false
    })
    if (result?.error) {
      alert('Demo login failed: ' + result.error)
      setLoading(null)
      return
    }
    // Redirect based on role
    if (role === 'parent') {
      router.push('/parent/dashboard')
    } else {
      router.push('/child/adventure')
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="text-center max-w-md px-6">
        <h1 className="text-5xl font-bold mb-6 text-black">Welcome to NurtureUp!</h1>
        <p className="mb-8 text-black text-lg leading-relaxed">Transform parenting into an adventure. Choose your portal to get started with the demo.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => handleDemoLogin('parent')}
            className="bg-primary-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-primary-700 transition-all disabled:opacity-60 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
            disabled={loading !== null}
          >
            {loading === 'parent' ? 'Entering as Parent...' : '👨‍👩‍👧‍👦 Parent Portal'}
          </button>
          <button
            onClick={() => handleDemoLogin('child')}
            className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-indigo-700 transition-all disabled:opacity-60 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
            disabled={loading !== null}
          >
            {loading === 'child' ? 'Entering as Child...' : '🌟 Adventure Portal'}
          </button>
        </div>
      </div>
    </main>
  )
} 