'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import VideoCard from '../../components/video/VideoCard'
import AdvancedSearch from '../../components/search/AdvancedSearch'

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

const SPORTS_CATEGORIES = {
  strength_training: {
    name: 'Strength Training',
    subcategories: ['Weightlifting', 'Bodybuilding', 'Powerlifting', 'CrossFit']
  },
  cardio: {
    name: 'Cardio',
    subcategories: ['Running', 'Cycling', 'HIIT', 'Dance Cardio']
  },
  yoga_pilates: {
    name: 'Yoga & Pilates',
    subcategories: ['Hatha Yoga', 'Vinyasa Yoga', 'Pilates Mat', 'Pilates Reformer']
  },
  combat_sports: {
    name: 'Combat Sports',
    subcategories: ['Boxing', 'Kickboxing', 'Martial Arts', 'MMA']
  },
  dance_fitness: {
    name: 'Dance Fitness',
    subcategories: ['Zumba', 'Hip Hop', 'Latin Dance', 'Ballet Fitness']
  },
  outdoor_sports: {
    name: 'Outdoor Sports',
    subcategories: ['Running', 'Cycling', 'Hiking', 'Rock Climbing']
  }
}


export default function ExplorePage() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('explore')
  const [searchFilters, setSearchFilters] = useState({
    query: '',
    category: 'all',
    subcategory: 'all',
    duration: 'all',
    sortBy: 'recent'
  })

  const fetchVideos = async () => {
    setLoading(true)
    try {
      let query, data, error

      if (activeTab === 'following') {
        // Fetch videos from followed users
        const { data: followingData, error: followsError } = await supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', user?.id)

        if (followsError) {
          console.error('Error fetching following:', followsError)
          setVideos([])
          return
        }

        const followingIds = followingData.map(f => f.following_id)
        
        if (followingIds.length === 0) {
          setVideos([])
          setLoading(false)
          return
        }

        // Get videos from followed users
        const { data: followingVideos, error: videosError } = await supabase
          .from('videos')
          .select('*')
          .eq('is_public', true)
          .in('user_id', followingIds)
          .order('created_at', { ascending: false })

        data = followingVideos
        error = videosError
      } else {
        // Regular explore - fetch all public videos with filters
        let queryBuilder = supabase
          .from('videos')
          .select('*')
          .eq('is_public', true)

        // Apply search filters
        if (searchFilters.query) {
          queryBuilder = queryBuilder.or(`title.ilike.%${searchFilters.query}%,description.ilike.%${searchFilters.query}%`)
        }

        if (searchFilters.category !== 'all') {
          queryBuilder = queryBuilder.eq('main_category', searchFilters.category)
        }

        if (searchFilters.subcategory !== 'all') {
          queryBuilder = queryBuilder.eq('sub_category', searchFilters.subcategory)
        }

        // Duration filter (using duration field instead of duration_seconds for now)
        if (searchFilters.duration !== 'all') {
          // For now, we'll skip duration filtering since we need to add duration_seconds column
          // or parse the duration string
        }

        // Sort order
        switch (searchFilters.sortBy) {
          case 'popular':
            queryBuilder = queryBuilder.order('views', { ascending: false })
            break
          case 'trending':
            queryBuilder = queryBuilder.order('likes_count', { ascending: false })
            break
          default: // recent
            queryBuilder = queryBuilder.order('created_at', { ascending: false })
        }

        const response = await queryBuilder
        data = response.data
        error = response.error
      }

      if (error) {
        console.error('Error fetching videos:', error)
        setVideos([])
      } else {
        console.log('Fetched videos data:', data)
        
        // Get unique user IDs to fetch usernames
        const userIds = [...new Set(data?.map(video => video.user_id).filter(Boolean))]
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

        // Transform the data to match our Video type
        const transformedVideos = data?.map(video => ({
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
        
        console.log('Transformed videos:', transformedVideos)
        setVideos(transformedVideos)
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setVideos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirectTo=/explore')
      return
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchVideos()
    }
  }, [activeTab, searchFilters, isAuthenticated, user])

  const handleSearch = (filters: any) => {
    setSearchFilters(filters)
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-orange-400 to-indigo-400 bg-clip-text text-transparent mb-4">
            {activeTab === 'following' ? 'Following Feed' : 'Explore Workouts'}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {activeTab === 'following' 
              ? 'Stay updated with videos from people you follow'
              : 'Discover amazing fitness videos from our community of trainers and enthusiasts'
            }
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex justify-center">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-2">
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setActiveTab('explore')
                  setSearchFilters({
                    query: '',
                    category: 'all',
                    subcategory: 'all',
                    duration: 'all',
                    sortBy: 'recent'
                  })
                }}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === 'explore'
                    ? 'bg-gradient-to-r from-blue-600 to-orange-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Explore</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab('following')
                  setSearchFilters({
                    query: '',
                    category: 'all',
                    subcategory: 'all',
                    duration: 'all',
                    sortBy: 'recent'
                  })
                }}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === 'following'
                    ? 'bg-gradient-to-r from-blue-600 to-orange-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Following</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Search - Only show in explore tab */}
        {activeTab === 'explore' && (
          <div className="mb-8">
            <AdvancedSearch onSearch={handleSearch} />
          </div>
        )}

        {/* Videos Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-800 rounded-2xl h-80 border border-gray-700" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No videos found</h3>
            <p className="text-gray-400 text-lg">
              {activeTab === 'following' 
                ? 'Follow some users to see their videos here!'
                : searchFilters.query || searchFilters.category !== 'all' || searchFilters.duration !== 'all' || searchFilters.subcategory !== 'all'
                  ? 'Try adjusting your search filters.' 
                  : 'Be the first to upload a video!'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <VideoCard key={video.id} {...video} userId={video.user_id} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}