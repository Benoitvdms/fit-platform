'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import VideoCard from '../../components/video/VideoCard'
import Link from 'next/link'

type Video = {
  id: string
  title: string
  username: string
  views: number
  duration: string
  thumbnailUrl?: string
  main_category: string
  sub_category: string
  created_at: string
  user_id: string
}

export default function FeedPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [followingVideos, setFollowingVideos] = useState<Video[]>([])
  const [savedVideos, setSavedVideos] = useState<Video[]>([])
  const [recommendedVideos, setRecommendedVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<'following' | 'saved' | 'recommended'>('following')

  const fetchFollowingVideos = async () => {
    if (!user) return
    
    try {
      // Get users that the current user follows
      const { data: followingData, error: followsError } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id)

      if (followsError) {
        console.error('Error fetching following:', followsError)
        setFollowingVideos([])
        return
      }

      const followingIds = followingData.map(f => f.following_id)
      
      if (followingIds.length === 0) {
        setFollowingVideos([])
        return
      }

      // Get videos from followed users
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('is_public', true)
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .limit(12)

      if (videosError) {
        console.error('Error fetching following videos:', videosError)
        setFollowingVideos([])
        return
      }

      // Get unique user IDs to fetch usernames
      const userIds = [...new Set(videosData?.map(video => video.user_id).filter(Boolean))]
      let usersMap = {}
      
      if (userIds.length > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, username')
          .in('id', userIds)
        
        usersMap = usersData?.reduce((acc, user) => ({
          ...acc,
          [user.id]: user.username
        }), {}) || {}
      }

      const transformedVideos = videosData?.map(video => ({
        id: video.id,
        title: video.title,
        username: usersMap[video.user_id] || 'Unknown User',
        views: video.views || 0,
        duration: video.duration || '0:00',
        thumbnailUrl: video.thumbnail_url,
        main_category: video.main_category,
        sub_category: video.sub_category,
        created_at: video.created_at,
        user_id: video.user_id
      })) || []
      
      setFollowingVideos(transformedVideos)
    } catch (error) {
      console.error('Following videos fetch error:', error)
      setFollowingVideos([])
    }
  }

  const fetchSavedVideos = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('video_saves')
        .select(`
          videos (
            id,
            title,
            views,
            duration,
            thumbnail_url,
            main_category,
            sub_category,
            created_at,
            user_id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(12)

      if (error) {
        console.error('Error fetching saved videos:', error)
      } else {
        const transformedVideos = data
          .filter(save => save.videos) // Filter out any null videos
          .map(save => ({
            id: save.videos.id,
            title: save.videos.title,
            username: save.videos.user_id === user.id ? (user?.user_metadata?.username || 'You') : 'Fitness Enthusiast',
            views: save.videos.views || 0,
            duration: save.videos.duration || '0:00',
            thumbnailUrl: save.videos.thumbnail_url,
            main_category: save.videos.main_category,
            sub_category: save.videos.sub_category,
            created_at: save.videos.created_at,
            user_id: save.videos.user_id
          }))
        setSavedVideos(transformedVideos)
      }
    } catch (error) {
      console.error('Saved videos fetch error:', error)
    }
  }

  const fetchRecommendedVideos = async () => {
    if (!user) return
    
    try {
      // Get user's preferred categories from their saved/liked videos
      const { data: userPreferences } = await supabase
        .from('video_saves')
        .select(`
          videos (main_category)
        `)
        .eq('user_id', user.id)
        .limit(10)

      // Extract preferred categories
      const preferredCategories = userPreferences
        ?.map(save => save.videos?.main_category)
        .filter(Boolean) || []

      let query = supabase
        .from('videos')
        .select('*')
        .eq('is_public', true)
        .neq('user_id', user.id) // Don't recommend own videos

      // If user has preferences, prioritize those categories
      if (preferredCategories.length > 0) {
        query = query.in('main_category', preferredCategories)
      }

      const { data, error } = await query
        .order('likes_count', { ascending: false })
        .limit(12)

      if (error) {
        console.error('Error fetching recommended videos:', error)
      } else {
        const transformedVideos = data.map(video => ({
          id: video.id,
          title: video.title,
          username: 'Fitness Enthusiast',
          views: video.views || 0,
          duration: video.duration || '0:00',
          thumbnailUrl: video.thumbnail_url,
          main_category: video.main_category,
          sub_category: video.sub_category,
          created_at: video.created_at,
          user_id: video.user_id
        }))
        setRecommendedVideos(transformedVideos)
      }
    } catch (error) {
      console.error('Recommended videos fetch error:', error)
    }
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirectTo=/feed')
      return
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchAllVideos = async () => {
        setLoading(true)
        await Promise.all([
          fetchFollowingVideos(),
          fetchSavedVideos(),
          fetchRecommendedVideos()
        ])
        setLoading(false)
      }
      fetchAllVideos()
    }
  }, [isAuthenticated, user])

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  const getCurrentVideos = () => {
    switch (activeSection) {
      case 'following':
        return followingVideos
      case 'saved':
        return savedVideos
      case 'recommended':
        return recommendedVideos
      default:
        return followingVideos
    }
  }

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'following':
        return 'From People You Follow'
      case 'saved':
        return 'Your Saved Videos'
      case 'recommended':
        return 'Recommended For You'
      default:
        return 'From People You Follow'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-orange-400 to-indigo-400 bg-clip-text text-transparent mb-4">
            Your Fitness Feed
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover trending workouts, latest uploads, and personalized recommendations
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-4 justify-center">
          <Link
            href="/upload"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
          >
            Upload Workout
          </Link>
          <Link
            href="/profile"
            className="px-6 py-3 bg-gray-700/50 border border-gray-600 hover:bg-gray-600/50 text-white font-medium rounded-xl transition-all duration-300"
          >
            View Profile
          </Link>
          <Link
            href="/explore"
            className="px-6 py-3 bg-gray-700/50 border border-gray-600 hover:bg-gray-600/50 text-white font-medium rounded-xl transition-all duration-300"
          >
            Explore All
          </Link>
        </div>

        {/* Section Navigation */}
        <div className="mb-8">
          <div className="flex justify-center">
            <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-xl">
              <button
                onClick={() => setActiveSection('following')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeSection === 'following'
                    ? 'bg-gradient-to-r from-blue-600 to-orange-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                👥 Following
              </button>
              <button
                onClick={() => setActiveSection('saved')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeSection === 'saved'
                    ? 'bg-gradient-to-r from-blue-600 to-orange-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                💾 Saved
              </button>
              <button
                onClick={() => setActiveSection('recommended')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeSection === 'recommended'
                    ? 'bg-gradient-to-r from-blue-600 to-orange-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                ⭐ For You
              </button>
            </div>
          </div>
        </div>

        {/* Current Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">{getSectionTitle()}</h2>
          
          {/* Videos Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-800 rounded-2xl h-80 border border-gray-700" />
              ))}
            </div>
          ) : getCurrentVideos().length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No videos found</h3>
              <p className="text-gray-400 text-lg mb-6">
                {activeSection === 'following' 
                  ? 'Follow some users to see their videos here!'
                  : activeSection === 'saved'
                    ? 'Save some videos to see them here!'
                    : 'Be the first to upload a video and get the community started!'
                }
              </p>
              <Link
                href="/upload"
                className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
              >
                Upload First Video
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getCurrentVideos().map((video) => (
                <VideoCard key={video.id} {...video} userId={video.user_id} />
              ))}
            </div>
          )}
        </div>

        {/* Category Quick Access */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">Browse by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Strength', emoji: '💪', category: 'strength_training', color: 'from-red-500 to-orange-500' },
              { name: 'Cardio', emoji: '🏃‍♂️', category: 'cardio', color: 'from-blue-500 to-cyan-500' },
              { name: 'Yoga', emoji: '🧘‍♀️', category: 'yoga_pilates', color: 'from-green-500 to-emerald-500' },
              { name: 'Combat', emoji: '🥊', category: 'combat_sports', color: 'from-orange-500 to-red-500' },
              { name: 'Dance', emoji: '💃', category: 'dance_fitness', color: 'from-pink-500 to-rose-500' },
              { name: 'Outdoor', emoji: '🌲', category: 'outdoor_sports', color: 'from-green-500 to-teal-500' }
            ].map((cat) => (
              <Link
                key={cat.category}
                href={`/explore?category=${cat.category}`}
                className="group relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300`}></div>
                <div className="relative p-4 bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300 transform hover:scale-105 text-center">
                  <div className="text-2xl mb-2">{cat.emoji}</div>
                  <div className="text-white font-medium text-sm">{cat.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}