'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Home, Calendar, Users, Baby, GraduationCap, Heart, BookOpen, Target, Brain, Gamepad2, Smartphone } from 'lucide-react'

export default function ParentPhasesPage() {
  const phases = [
    {
      id: 'pregnancy',
      name: 'Pregnancy & TTC',
      age: 'TTC - Birth',
      description: 'Track conception, pregnancy milestones, and prepare for birth with comprehensive monitoring tools.',
      color: 'from-emerald-500 to-teal-500',
      icon: Heart,
      features: ['Cycle tracking', 'Fetal development', 'Vitals monitoring', 'Birth preparation'],
      pages: [
        { name: 'Today Dashboard', path: '/parent/ttc-pregnancy' },
        { name: 'Tracker', path: '/parent/ttc-pregnancy' },
        { name: 'Library', path: '/parent/ttc-pregnancy' },
        { name: 'Profile', path: '/parent/ttc-pregnancy' }
      ]
    },
    {
      id: 'newborn',
      name: 'Newborn & Infant',
      age: '0 - 12 months',
      description: 'Monitor feeding, sleep patterns, and early development milestones with easy logging tools.',
      color: 'from-blue-500 to-cyan-500',
      icon: Baby,
      features: ['Feed tracking', 'Sleep monitoring', 'Growth charts', 'Milestone capture'],
      pages: [
        { name: 'Today Dashboard', path: '/parent/newborn' },
        { name: 'Log Center', path: '/parent/newborn' },
        { name: 'Growth Tracker', path: '/parent/newborn' },
        { name: 'Moments', path: '/parent/newborn' }
      ]
    },
    {
      id: 'toddler',
      name: 'Toddler',
      age: '1 - 3 years',
      description: 'Build routines, manage behavior positively, and support potty training with star rewards.',
      color: 'from-purple-500 to-pink-500',
      icon: Gamepad2,
      features: ['Behavior tracking', 'Potty training', 'Routine building', 'Tantrum tools'],
      pages: [
        { name: 'Today Dashboard', path: '/parent/toddler' },
        { name: 'Routine Center', path: '/parent/toddler' },
        { name: 'Play Hub', path: '/parent/toddler' },
        { name: 'Calm Tools', path: '/parent/toddler' }
      ]
    },
    {
      id: 'early-childhood',
      name: 'Early Childhood',
      age: '4 - 6 years',
      description: 'Introduce chores, support learning, and prepare for school with structured activities.',
      color: 'from-amber-500 to-orange-500',
      icon: BookOpen,
      features: ['Chore management', 'Learning games', 'School readiness', 'Family calendar'],
      pages: [
        { name: 'Today Dashboard', path: '/parent/early-childhood' },
        { name: 'Chores Board', path: '/parent/early-childhood' },
        { name: 'Learning Hub', path: '/parent/early-childhood' },
        { name: 'School Prep', path: '/parent/early-childhood' }
      ]
    },
    {
      id: 'school-age',
      name: 'School Age',
      age: '7 - 12 years',
      description: 'Coordinate academics, manage allowance, and balance screen time with responsibility.',
      color: 'from-indigo-500 to-purple-500',
      icon: GraduationCap,
      features: ['Homework tracking', 'Allowance system', 'Screen time', 'Achievement badges'],
      pages: [
        { name: 'Today Dashboard', path: '/parent/school-age' },
        { name: 'School Center', path: '/parent/school-age' },
        { name: 'Wallet Manager', path: '/parent/school-age' },
        { name: 'Screen Time', path: '/parent/school-age' }
      ]
    },
    {
      id: 'adolescence',
      name: 'Adolescence',
      age: '13 - 18 years',
      description: 'Guide independence, support wellbeing, and prepare for college with privacy-first tools.',
      color: 'from-rose-500 to-red-500',
      icon: Target,
      features: ['Independence coaching', 'Mood tracking', 'College planning', 'Life skills'],
      pages: [
        { name: 'Today Feed', path: '/parent/adolescence' },
        { name: 'Planner', path: '/parent/adolescence' },
        { name: 'Wellbeing', path: '/parent/adolescence' },
        { name: 'Life Skills', path: '/parent/adolescence' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="backdrop-blur-lg bg-white/70 border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="w-10 h-10 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center hover:scale-105 transition-transform">
                <Home className="w-5 h-5 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Parent Interface Phases
                </h1>
                <p className="text-sm text-slate-600">Adaptive tools for every stage of parenting</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-medium text-slate-700">Parent View</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
            Explore All Parent Phases
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Navigate through comprehensive parenting tools that adapt and evolve with your child's development from conception through independence.
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
                      href={phase.id === 'pregnancy' ? '/parent/ttc-pregnancy' :
                            phase.id === 'newborn' ? '/parent/newborn' :
                            phase.id === 'toddler' ? '/parent/toddler' :
                            phase.id === 'early-childhood' ? '/parent/early-childhood' :
                            phase.id === 'school-age' ? '/parent/school-age' :
                            phase.id === 'adolescence' ? '/parent/adolescence' :
                            '/parent/home'}
                      className={`w-full mt-6 py-3 px-4 bg-gradient-to-r ${phase.color} text-white rounded-xl font-semibold flex items-center justify-center space-x-2 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
                    >
                      <span>Explore {phase.name} Phase</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
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