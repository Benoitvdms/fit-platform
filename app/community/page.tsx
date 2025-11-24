'use client'

import { useState } from 'react'
import Link from 'next/link'

type CommunityMember = {
  id: string
  username: string
  name: string
  bio: string
  followers: number
  following: number
  workouts: number
  badges: string[]
  isVerified: boolean
}

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'featured' | 'trainers' | 'rising'>('featured')

  const getSampleMembers = (): CommunityMember[] => [
    {
      id: '1',
      username: 'fitness_coach_mike',
      name: 'Mike Johnson',
      bio: 'Certified personal trainer specializing in strength training and HIIT workouts.',
      followers: 12500,
      following: 340,
      workouts: 89,
      badges: ['Verified Trainer', 'Top Creator', '100 Videos'],
      isVerified: true
    },
    {
      id: '2',
      username: 'yoga_zen_anna',
      name: 'Anna Williams',
      bio: 'Yoga instructor helping you find balance and inner peace through movement.',
      followers: 8900,
      following: 220,
      workouts: 67,
      badges: ['Yoga Expert', 'Rising Star', '50 Videos'],
      isVerified: true
    },
    {
      id: '3',
      username: 'stronglifts_ana',
      name: 'Ana Rodriguez',
      bio: 'Powerlifter and strength coach. Let\'s get strong together! 💪',
      followers: 15600,
      following: 180,
      workouts: 134,
      badges: ['Verified Trainer', 'Strength Expert', '100 Videos'],
      isVerified: true
    },
    {
      id: '4',
      username: 'cardio_king_james',
      name: 'James Parker',
      bio: 'Running enthusiast and cardio specialist. Marathon finisher 🏃‍♂️',
      followers: 6700,
      following: 450,
      workouts: 78,
      badges: ['Cardio Expert', 'Marathon Finisher'],
      isVerified: false
    },
    {
      id: '5',
      username: 'pilates_jenny',
      name: 'Jenny Thompson',
      bio: 'Pilates instructor focused on core strength and flexibility.',
      followers: 9800,
      following: 320,
      workouts: 92,
      badges: ['Pilates Expert', 'Core Specialist'],
      isVerified: true
    },
    {
      id: '6',
      username: 'hiit_warrior_sam',
      name: 'Sam Martinez',
      bio: 'HIIT workouts that will challenge you and transform your fitness!',
      followers: 4200,
      following: 280,
      workouts: 45,
      badges: ['Rising Star', 'HIIT Specialist'],
      isVerified: false
    }
  ]

  const members = getSampleMembers()

  const getBadgeColor = (badge: string) => {
    const colors = {
      'Verified Trainer': 'from-blue-500 to-orange-500',
      'Top Creator': 'from-yellow-500 to-orange-500',
      'Rising Star': 'from-green-500 to-emerald-500',
      'Yoga Expert': 'from-teal-500 to-cyan-500',
      'Strength Expert': 'from-red-500 to-orange-500',
      'Cardio Expert': 'from-blue-500 to-indigo-500',
      'Pilates Expert': 'from-purple-500 to-violet-500',
      'HIIT Specialist': 'from-orange-500 to-red-500',
      'Marathon Finisher': 'from-indigo-500 to-purple-500',
      'Core Specialist': 'from-pink-500 to-rose-500',
      '100 Videos': 'from-gray-500 to-gray-600',
      '50 Videos': 'from-gray-400 to-gray-500'
    }
    return colors[badge as keyof typeof colors] || 'from-gray-500 to-gray-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent mb-4">
            Fitness Community
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Connect with trainers, athletes, and fitness enthusiasts from around the world
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Active Members', value: '50K+', color: 'purple' },
            { label: 'Workout Videos', value: '100K+', color: 'pink' },
            { label: 'Community Challenges', value: '500+', color: 'indigo' },
            { label: 'Countries Represented', value: '120+', color: 'emerald' }
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 text-center">
              <div className={`text-3xl font-bold text-${stat.color}-400 mb-2`}>
                {stat.value}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex justify-center">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2 border border-gray-700">
              {[
                { key: 'featured', name: 'Featured' },
                { key: 'trainers', name: 'Top Trainers' },
                { key: 'rising', name: 'Rising Stars' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {members.map((member) => (
            <div key={member.id} className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden hover:scale-105 transition-all duration-300 border border-gray-700/50 hover:border-purple-500/50">
              {/* Profile Header */}
              <div className="p-6 border-b border-gray-700/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-bold text-white">{member.name}</h3>
                        {member.isVerified && (
                          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="text-purple-400 font-medium">@{member.username}</p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {member.bio}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{member.followers.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{member.following}</div>
                    <div className="text-xs text-gray-400">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{member.workouts}</div>
                    <div className="text-xs text-gray-400">Videos</div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {member.badges.slice(0, 2).map((badge) => (
                    <span
                      key={badge}
                      className={`px-3 py-1 bg-gradient-to-r ${getBadgeColor(badge)} text-white text-xs font-medium rounded-full`}
                    >
                      {badge}
                    </span>
                  ))}
                  {member.badges.length > 2 && (
                    <span className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                      +{member.badges.length - 2}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 flex space-x-3">
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105">
                  Follow
                </button>
                <Link
                  href={`/profile/${member.username}`}
                  className="flex-1 px-4 py-2 bg-gray-700/50 backdrop-blur-sm border border-gray-600 hover:bg-gray-600/50 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 text-center"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Join Community CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm rounded-2xl p-12 border border-purple-500/20">
            <h3 className="text-3xl font-bold text-white mb-4">Join Our Community</h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-lg">
              Connect with like-minded fitness enthusiasts, share your progress, and get motivated by others on their journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
              >
                Start Your Journey
              </Link>
              <Link
                href="/explore"
                className="px-8 py-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600 hover:bg-gray-600/50 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                Explore Workouts
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}