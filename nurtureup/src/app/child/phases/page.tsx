'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Home, Baby, Gamepad2, BookOpen, GraduationCap, Target, Heart, Star, Calendar, Wallet } from 'lucide-react'

export default function ChildPhasesPage() {
  const phases = [
    {
      id: 'toddler',
      name: 'Toddler Interface',
      age: '1 - 3 years',
      description: 'Large tappable targets, star jar rewards, potty monster timer, and emotion wheel for early development.',
      color: 'from-emerald-400 to-teal-400',
      icon: Heart,
      features: ['Star jar rewards', 'Potty monster timer', 'Emotion wheel', 'Calm-down tools'],
      pages: [
        { name: 'Star Jar Home', path: '/child/toddler/home?demo=true' },
        { name: 'Potty Monster', path: '/child/toddler/potty?demo=true' },
        { name: 'Play Ideas', path: '/child/toddler/play?demo=true' },
        { name: 'Calm Space', path: '/child/toddler/calm?demo=true' }
      ]
    },
    {
      id: 'early-childhood',
      name: 'Early Childhood',
      age: '4 - 6 years',
      description: 'Interactive chore board, learning games, daily quest system, and avatar customization for school readiness.',
      color: 'from-blue-400 to-cyan-400',
      icon: BookOpen,
      features: ['Chore board game', 'Learning arcade', 'Avatar dress-up', 'Daily quests'],
      pages: [
        { name: 'Quest Home', path: '/child/early-childhood/home?demo=true' },
        { name: 'Chore Board', path: '/child/early-childhood/chores?demo=true' },
        { name: 'Learning Games', path: '/child/early-childhood/learn?demo=true' },
        { name: 'Avatar Studio', path: '/child/early-childhood/avatar?demo=true' }
      ]
    },
    {
      id: 'school-age',
      name: 'School Age',
      age: '7 - 12 years',
      description: 'Smart homework tracker, virtual wallet, achievement badges, and family leaderboard for academic success.',
      color: 'from-purple-400 to-pink-400',
      icon: GraduationCap,
      features: ['Homework tracker', 'Virtual wallet', 'Badge collection', 'Family leaderboard'],
      pages: [
        { name: 'Smart Agenda', path: '/child/school-age/home?demo=true' },
        { name: 'School Center', path: '/child/school-age/school?demo=true' },
        { name: 'My Wallet', path: '/child/school-age/wallet?demo=true' },
        { name: 'Badge Gallery', path: '/child/school-age/badges?demo=true' }
      ]
    },
    {
      id: 'adolescence',
      name: 'Teen Interface',
      age: '13 - 18 years',
      description: 'Personal planner, mood tracking, life skills XP, and privacy controls for growing independence.',
      color: 'from-amber-400 to-orange-400',
      icon: Target,
      features: ['Personal planner', 'Mood journal', 'Life skills XP', 'Privacy settings'],
      pages: [
        { name: 'Personal Feed', path: '/child/adolescence/home?demo=true' },
        { name: 'My Planner', path: '/child/adolescence/planner?demo=true' },
        { name: 'Wellbeing', path: '/child/adolescence/wellbeing?demo=true' },
        { name: 'Privacy Hub', path: '/child/adolescence/privacy?demo=true' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="backdrop-blur-lg bg-white/70 border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="w-10 h-10 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center hover:scale-105 transition-transform">
                <Home className="w-5 h-5 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Child Interface Phases
                </h1>
                <p className="text-sm text-slate-600">Age-appropriate interfaces that grow with you</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Baby className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium text-slate-700">Child View</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
            Growing Interfaces for Growing Kids
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Safe, engaging, and age-appropriate interfaces that evolve from simple taps to complex planning tools as children develop.
          </p>
        </div>

        {/* Phases Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {phases.map((phase) => {
            const IconComponent = phase.icon
            return (
              <Card key={phase.id} className="overflow-hidden border-0 bg-white/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-0">
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${phase.color} p-6 text-white`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">{phase.name}</h3>
                          <p className="text-white/80 font-medium">{phase.age}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-white/90 leading-relaxed">{phase.description}</p>
                  </div>

                  {/* Features */}
                  <div className="p-6">
                    <h4 className="font-semibold text-slate-800 mb-3">Key Features</h4>
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {phase.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${phase.color}`}></div>
                          <span className="text-sm text-slate-600">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Pages */}
                    <h4 className="font-semibold text-slate-800 mb-3">Interface Pages</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {phase.pages.map((page, index) => (
                        <Link
                          key={index}
                          href={page.path}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
                        >
                          <span className="text-sm font-medium text-slate-700">{page.name}</span>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                        </Link>
                      ))}
                    </div>

                    {/* Main CTA */}
                    <Link
                      href={phase.id === 'toddler' ? '/child/toddler/home?demo=true' : 
                            phase.id === 'early-childhood' ? '/child/early-childhood/home?demo=true' :
                            phase.id === 'school-age' ? '/child/school-age/home?demo=true' :
                            phase.id === 'adolescence' ? '/child/adolescence/home?demo=true' :
                            `/child/phases/${phase.id}?demo=true`}
                      className={`w-full mt-6 py-3 px-4 bg-gradient-to-r ${phase.color} text-white rounded-xl font-semibold flex items-center justify-center space-x-2 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
                    >
                      <span>Try {phase.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Design Principles */}
        <div className="mt-16">
          <h3 className="text-3xl font-bold text-center text-slate-800 mb-8">Child-Centered Design</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6 text-center border-0 bg-white/60 backdrop-blur-sm hover:shadow-lg transition-all hover:scale-105">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">Age-Appropriate</h4>
              <p className="text-sm text-slate-600">Interfaces adapt to cognitive and motor development</p>
            </Card>
            <Card className="p-6 text-center border-0 bg-white/60 backdrop-blur-sm hover:shadow-lg transition-all hover:scale-105">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">Positive Rewards</h4>
              <p className="text-sm text-slate-600">Gamification that builds confidence and motivation</p>
            </Card>
            <Card className="p-6 text-center border-0 bg-white/60 backdrop-blur-sm hover:shadow-lg transition-all hover:scale-105">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center mx-auto mb-4">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">Safe & Secure</h4>
              <p className="text-sm text-slate-600">COPPA compliant with parental oversight</p>
            </Card>
            <Card className="p-6 text-center border-0 bg-white/60 backdrop-blur-sm hover:shadow-lg transition-all hover:scale-105">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">Independence</h4>
              <p className="text-sm text-slate-600">Gradually increases autonomy as children grow</p>
            </Card>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-white/60 backdrop-blur-sm rounded-2xl font-medium text-slate-700 hover:bg-white/80 transition-all hover:scale-105"
          >
            <Home className="w-4 h-4" />
            <span>Back to Main Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  )
}