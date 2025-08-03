'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Sparkles, Users, Baby, ArrowRight, Calendar, Settings, Target, Brain } from 'lucide-react'

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
      router.push('/parent/home')
    } else {
      router.push('/child/adventure')
    }
  }

  const parentPhases = [
    { 
      id: 'pregnancy', 
      name: 'Pregnancy', 
      age: 'TTC-Birth', 
      description: 'Track pregnancy, prepare for birth',
      color: 'from-emerald-500 to-teal-500'
    },
    { 
      id: 'newborn', 
      name: 'Newborn', 
      age: '0-12m', 
      description: 'Feeding, sleep, growth tracking',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      id: 'toddler', 
      name: 'Toddler', 
      age: '1-3y', 
      description: 'Potty training, behavior, routines',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      id: 'early-childhood', 
      name: 'Early Childhood', 
      age: '4-6y', 
      description: 'Chores, learning, school prep',
      color: 'from-amber-500 to-orange-500'
    },
    { 
      id: 'school-age', 
      name: 'School Age', 
      age: '7-12y', 
      description: 'Homework, activities, allowance',
      color: 'from-indigo-500 to-purple-500'
    },
    { 
      id: 'adolescence', 
      name: 'Adolescence', 
      age: '13-18y', 
      description: 'Independence, wellbeing, planning',
      color: 'from-rose-500 to-red-500'
    }
  ]

  const childPhases = [
    { 
      id: 'toddler', 
      name: 'Toddler', 
      age: '1-3y', 
      description: 'Star jar, potty monster, emotion wheel',
      color: 'from-emerald-400 to-teal-400'
    },
    { 
      id: 'early-childhood', 
      name: 'Early Childhood', 
      age: '4-6y', 
      description: 'Chore board, learning games, avatar',
      color: 'from-blue-400 to-cyan-400'
    },
    { 
      id: 'school-age', 
      name: 'School Age', 
      age: '7-12y', 
      description: 'Homework tracker, wallet, badges',
      color: 'from-purple-400 to-pink-400'
    },
    { 
      id: 'adolescence', 
      name: 'Adolescence', 
      age: '13-18y', 
      description: 'Personal planner, mood tracking, goals',
      color: 'from-amber-400 to-orange-400'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="backdrop-blur-lg bg-white/70 border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  NurtureUp
                </h1>
                <p className="text-sm text-slate-600">Adaptive Parenting Interface</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium text-slate-700">Demo Mode</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-6">
            Experience Every Phase
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Test and explore adaptive interfaces that grow with your family through every stage of development. 
            From pregnancy tracking to teen independence tools.
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Parent Interface Card */}
          <div className="group">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 h-80 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm"></div>
              <div className="relative z-10 h-full flex flex-col justify-between text-white">
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Parent Interface</h3>
                  <p className="text-indigo-100 leading-relaxed">
                    Comprehensive dashboard adapting from pregnancy through adolescence. 
                    Track development, manage routines, and guide your child's growth.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDemoLogin('parent')}
                    disabled={loading !== null}
                    className="flex-1 py-2 px-4 bg-white/20 backdrop-blur-sm rounded-xl font-medium hover:bg-white/30 transition-all disabled:opacity-50"
                  >
                    {loading === 'parent' ? 'Entering...' : 'Try Demo'}
                  </button>
                  <Link 
                    href="/parent/phases" 
                    className="flex-1 py-2 px-4 bg-white/20 backdrop-blur-sm rounded-xl font-medium hover:bg-white/30 transition-all text-center"
                  >
                    Explore All
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Child Interface Card */}
          <div className="group">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 p-8 h-80 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm"></div>
              <div className="relative z-10 h-full flex flex-col justify-between text-white">
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                    <Baby className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Child Interface</h3>
                  <p className="text-amber-100 leading-relaxed">
                    Age-appropriate interfaces that evolve from toddler games to teen planners. 
                    Engaging, safe, and designed for growing independence.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDemoLogin('child')}
                    disabled={loading !== null}
                    className="flex-1 py-2 px-4 bg-white/20 backdrop-blur-sm rounded-xl font-medium hover:bg-white/30 transition-all disabled:opacity-50"
                  >
                    {loading === 'child' ? 'Entering...' : 'Try Demo'}
                  </button>
                  <Link 
                    href="/child/phases?demo=true" 
                    className="flex-1 py-2 px-4 bg-white/20 backdrop-blur-sm rounded-xl font-medium hover:bg-white/30 transition-all text-center"
                  >
                    Explore All
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Parent Phases Grid */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-slate-800">Parent Interface Phases</h3>
            <Link 
              href="/parent/phases" 
              className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {parentPhases.map((phase) => (
              <Link 
                key={phase.id}
                href={phase.id === 'pregnancy' ? '/parent/ttc-pregnancy' :
                      phase.id === 'newborn' ? '/parent/newborn' :
                      phase.id === 'toddler' ? '/parent/toddler' :
                      phase.id === 'early-childhood' ? '/parent/early-childhood' :
                      phase.id === 'school-age' ? '/parent/school-age' :
                      phase.id === 'adolescence' ? '/parent/adolescence' :
                      '/parent/home'}
                className="group"
              >
                <Card className="h-48 transition-all duration-300 hover:scale-105 hover:shadow-lg border-0 bg-white/60 backdrop-blur-sm">
                  <CardContent className="p-4 h-full flex flex-col">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${phase.color} flex items-center justify-center mb-3`}>
                      <span className="text-white font-bold text-sm">{phase.age}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                      {phase.name}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed flex-1">
                      {phase.description}
                    </p>
                    <div className="flex items-center text-slate-400 group-hover:text-indigo-500 transition-colors mt-2">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Child Phases Grid */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-slate-800">Child Interface Phases</h3>
            <Link 
              href="/child/phases" 
              className="flex items-center text-amber-600 hover:text-amber-700 font-medium"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {childPhases.map((phase) => (
              <Link 
                key={phase.id}
                href={phase.id === 'toddler' ? '/child/toddler/home?demo=true' : 
                      phase.id === 'early-childhood' ? '/child/early-childhood/home?demo=true' :
                      phase.id === 'school-age' ? '/child/school-age/home?demo=true' :
                      phase.id === 'adolescence' ? '/child/adolescence/home?demo=true' :
                      `/child/phases/${phase.id}?demo=true`}
                className="group"
              >
                <Card className="h-56 transition-all duration-300 hover:scale-105 hover:shadow-lg border-0 bg-white/60 backdrop-blur-sm">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${phase.color} flex items-center justify-center mb-4`}>
                      <span className="text-white font-bold">{phase.age}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 mb-3 group-hover:text-amber-600 transition-colors">
                      {phase.name}
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed flex-1">
                      {phase.description}
                    </p>
                    <div className="flex items-center text-slate-400 group-hover:text-amber-500 transition-colors mt-3">
                      <span className="text-sm font-medium">Explore</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-slate-800 mb-8">Core Features</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg border-0 bg-white/60 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">Adaptive Planning</h4>
              <p className="text-sm text-slate-600">Schedules and tools that evolve with developmental stages</p>
            </Card>
            <Card className="p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg border-0 bg-white/60 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">Smart Automation</h4>
              <p className="text-sm text-slate-600">Intelligent suggestions and automated routine tracking</p>
            </Card>
            <Card className="p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg border-0 bg-white/60 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">Goal Tracking</h4>
              <p className="text-sm text-slate-600">Milestone monitoring and achievement celebrations</p>
            </Card>
            <Card className="p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg border-0 bg-white/60 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">Development Focus</h4>
              <p className="text-sm text-slate-600">Evidence-based guidance for healthy growth</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 