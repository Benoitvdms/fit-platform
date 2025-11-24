'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import FollowButton from '../../../components/user/FollowButton'
import VideoCard from '../../../components/video/VideoCard'
import UserList from '../../../components/user/UserList'

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

interface UserProfile {
  id: string
  username: string
  full_name?: string
  bio?: string
  avatar_url?: string
  created_at: string
}

interface UserStats {
  videos_count: number
  followers_count: number
  following_count: number
}

interface Video {
  id: string
  title: string
  description?: string
  duration: string
  views_count: number
  thumbnail_url?: string
  main_category?: string
  created_at: string
}

export default function UserProfilePage({ params }: ProfilePageProps) {
  const [username, setUsername] = useState<string>('')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats>({ videos_count: 0, followers_count: 0, following_count: 0 })
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [showUserList, setShowUserList] = useState<'followers' | 'following' | null>(null)

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setUsername(resolvedParams.username)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (username) {
      fetchUserProfile()
    }
  }, [username])

  const fetchUserProfile = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      if (profileError) {
        console.error('Profile fetch error:', profileError)
        return
      }

      setProfile(profileData)

      // Fetch user stats
      const { data: statsData } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', profileData.id)
        .single()

      if (statsData) {
        setStats(statsData)
      }

      // Fetch user videos
      const { data: videosData } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', profileData.id)
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (videosData) {
        setVideos(videosData)
      }

    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">User Not Found</h1>
          <p className="text-gray-400">The user @{username} does not exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || profile.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  profile.username.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                {profile.full_name || profile.username}
              </h1>
              <p className="text-blue-400 text-lg mb-4">@{profile.username}</p>
              
              {profile.bio && (
                <p className="text-gray-300 mb-4 max-w-2xl">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="flex space-x-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats.videos_count}</div>
                  <div className="text-gray-400">Videos</div>
                </div>
                <button
                  onClick={() => setShowUserList('followers')}
                  className="text-center hover:bg-gray-700/30 rounded-lg p-2 transition-colors"
                >
                  <div className="text-2xl font-bold text-white">{stats.followers_count}</div>
                  <div className="text-gray-400 hover:text-blue-400">Followers</div>
                </button>
                <button
                  onClick={() => setShowUserList('following')}
                  className="text-center hover:bg-gray-700/30 rounded-lg p-2 transition-colors"
                >
                  <div className="text-2xl font-bold text-white">{stats.following_count}</div>
                  <div className="text-gray-400 hover:text-blue-400">Following</div>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              <FollowButton targetUserId={profile.id} />
              <button className="px-6 py-2 border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white rounded-full font-medium text-sm transition-all duration-200">
                Message
              </button>
            </div>
          </div>
        </div>

        {/* Videos Section */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">
            Videos ({videos.length})
          </h2>
          
          {videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  id={video.id}
                  title={video.title}
                  username={profile.username}
                  views={video.views_count}
                  duration={video.duration}
                  thumbnailUrl={video.thumbnail_url}
                  main_category={video.main_category}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-300 mb-2">No videos yet</h3>
              <p className="text-gray-500">@{profile.username} hasn't shared any videos yet.</p>
            </div>
          )}
        </div>

        {/* User List Modal */}
        {showUserList && profile && (
          <UserList
            userId={profile.id}
            type={showUserList}
            onClose={() => setShowUserList(null)}
          />
        )}
      </div>
    </div>
  )
}