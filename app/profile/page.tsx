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
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [videos, setVideos] = useState<Video[]>([])
  const [savedVideos, setSavedVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'videos' | 'saved'>('videos')
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalViews: 0,
    totalSaved: 0,
    joinedDate: ''
  })
  
  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editForm, setEditForm] = useState({
    username: '',
    email: ''
  })
  const [updatingProfile, setUpdatingProfile] = useState(false)

  const fetchUserVideos = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user videos:', error)
        setVideos([])
      } else {
        // Transform the data to match our Video type
        const transformedVideos = data.map(video => ({
          id: video.id,
          title: video.title,
          username: user?.user_metadata?.username || 'You',
          views: video.views || 0,
          duration: video.duration || '0:00',
          thumbnailUrl: video.thumbnail_url,
          main_category: video.main_category,
          sub_category: video.sub_category,
          created_at: video.created_at
        }))
        setVideos(transformedVideos)
        
        // Calculate stats
        const totalViews = transformedVideos.reduce((sum, video) => sum + video.views, 0)
        setStats(prev => ({
          ...prev,
          totalVideos: transformedVideos.length,
          totalViews,
          joinedDate: user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''
        }))
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setVideos([])
    } finally {
      setLoading(false)
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

      if (error) {
        console.error('Error fetching saved videos:', error)
        setSavedVideos([])
      } else {
        // Transform the data to match our Video type
        const transformedSavedVideos = data
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
            created_at: save.videos.created_at
          }))
        setSavedVideos(transformedSavedVideos)
        
        // Update saved count in stats
        setStats(prev => ({
          ...prev,
          totalSaved: transformedSavedVideos.length
        }))
      }
    } catch (error) {
      console.error('Saved videos fetch error:', error)
      setSavedVideos([])
    }
  }

  const handleEditProfile = () => {
    setEditForm({
      username: user?.user_metadata?.username || '',
      email: user?.email || ''
    })
    setIsEditingProfile(true)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setUpdatingProfile(true)
    try {
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        email: editForm.email,
        data: {
          username: editForm.username
        }
      })

      if (error) {
        console.error('Error updating profile:', error)
        alert('Failed to update profile: ' + error.message)
      } else {
        alert('Profile updated successfully!')
        setIsEditingProfile(false)
        // Refresh the page to show updated data
        window.location.reload()
      }
    } catch (error) {
      console.error('Profile update error:', error)
      alert('Failed to update profile')
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditingProfile(false)
    setEditForm({
      username: user?.user_metadata?.username || '',
      email: user?.email || ''
    })
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirectTo=/profile')
      return
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserVideos()
      fetchSavedVideos()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Picture */}
            <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-orange-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {user?.user_metadata?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-white mb-2">
                {user?.user_metadata?.username || 'User'}
              </h1>
              <p className="text-gray-400 text-lg mb-4">@{user?.user_metadata?.username || 'user'}</p>
              
              {/* Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{stats.totalVideos}</div>
                  <div className="text-gray-400">Videos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.totalViews.toLocaleString()}</div>
                  <div className="text-gray-400">Total Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.totalSaved}</div>
                  <div className="text-gray-400">Saved</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.joinedDate}</div>
                  <div className="text-gray-400">Joined</div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              <Link
                href="/upload"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 text-center"
              >
                Upload Video
              </Link>
              <button 
                onClick={handleEditProfile}
                className="px-6 py-3 bg-gray-700/50 border border-gray-600 hover:bg-gray-600/50 text-white font-medium rounded-xl transition-all duration-300"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Videos Section */}
        <div className="mb-8">
          {/* Tab Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'videos'
                    ? 'bg-gradient-to-r from-blue-600 to-orange-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Your Videos ({stats.totalVideos})
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'saved'
                    ? 'bg-gradient-to-r from-blue-600 to-orange-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Saved Videos ({stats.totalSaved})
              </button>
            </div>
            <span className="text-gray-400">
              {activeTab === 'videos' 
                ? `${stats.totalVideos} ${stats.totalVideos === 1 ? 'video' : 'videos'}`
                : `${stats.totalSaved} saved ${stats.totalSaved === 1 ? 'video' : 'videos'}`
              }
            </span>
          </div>

          {/* Videos Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-800 rounded-2xl h-80 border border-gray-700" />
              ))}
            </div>
          ) : activeTab === 'videos' ? (
            videos.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">No videos yet</h3>
                <p className="text-gray-400 text-lg mb-6">
                  Start sharing your fitness journey with the community!
                </p>
                <Link
                  href="/upload"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  Upload Your First Video
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {videos.map((video) => (
                  <VideoCard key={video.id} {...video} />
                ))}
              </div>
            )
          ) : (
            savedVideos.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">No saved videos yet</h3>
                <p className="text-gray-400 text-lg mb-6">
                  Save videos you like to watch them later!
                </p>
                <Link
                  href="/explore"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  Explore Videos
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {savedVideos.map((video) => (
                  <VideoCard key={video.id} {...video} />
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Profile Edit Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Edit Profile</h3>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <label htmlFor="edit-username" className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  id="edit-username"
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 px-6 py-3 bg-gray-700/50 border border-gray-600 hover:bg-gray-600/50 text-white font-medium rounded-xl transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                >
                  {updatingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}