'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import PlaylistCard from '../../components/playlist/PlaylistCard'
import PlaylistCreator from '../../components/playlist/PlaylistCreator'

type Playlist = {
  id: string
  title: string
  description?: string
  thumbnail_url?: string
  video_count: number
  total_duration: number
  followers_count: number
  is_public: boolean
  user_id: string
  username: string
  created_at: string
}

export default function PlaylistsPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'my' | 'following' | 'discover'>('my')
  const [showCreator, setShowCreator] = useState(false)

  const fetchMyPlaylists = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('playlists')
        .select(`
          *,
          users!playlists_user_id_fkey(username)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching my playlists:', error)
      } else {
        const transformedPlaylists = data?.map(playlist => ({
          id: playlist.id,
          title: playlist.title,
          description: playlist.description,
          thumbnail_url: playlist.thumbnail_url,
          video_count: playlist.video_count,
          total_duration: playlist.total_duration,
          followers_count: playlist.followers_count,
          is_public: playlist.is_public,
          user_id: playlist.user_id,
          username: playlist.users?.username || 'Unknown',
          created_at: playlist.created_at
        })) || []
        
        setPlaylists(transformedPlaylists)
      }
    } catch (error) {
      console.error('Error fetching my playlists:', error)
    }
  }

  const fetchFollowingPlaylists = async () => {
    if (!user) return

    try {
      // Get playlists from users I follow
      const { data: followingData, error: followsError } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id)

      if (followsError) {
        console.error('Error fetching following:', followsError)
        return
      }

      const followingIds = followingData.map(f => f.following_id)
      
      if (followingIds.length === 0) {
        setPlaylists([])
        return
      }

      const { data, error } = await supabase
        .from('playlists')
        .select(`
          *,
          users!playlists_user_id_fkey(username)
        `)
        .eq('is_public', true)
        .in('user_id', followingIds)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching following playlists:', error)
      } else {
        const transformedPlaylists = data?.map(playlist => ({
          id: playlist.id,
          title: playlist.title,
          description: playlist.description,
          thumbnail_url: playlist.thumbnail_url,
          video_count: playlist.video_count,
          total_duration: playlist.total_duration,
          followers_count: playlist.followers_count,
          is_public: playlist.is_public,
          user_id: playlist.user_id,
          username: playlist.users?.username || 'Unknown',
          created_at: playlist.created_at
        })) || []
        
        setPlaylists(transformedPlaylists)
      }
    } catch (error) {
      console.error('Error fetching following playlists:', error)
    }
  }

  const fetchDiscoverPlaylists = async () => {
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select(`
          *,
          users!playlists_user_id_fkey(username)
        `)
        .eq('is_public', true)
        .gt('video_count', 0) // Only show playlists with videos
        .order('followers_count', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error fetching discover playlists:', error)
      } else {
        const transformedPlaylists = data?.map(playlist => ({
          id: playlist.id,
          title: playlist.title,
          description: playlist.description,
          thumbnail_url: playlist.thumbnail_url,
          video_count: playlist.video_count,
          total_duration: playlist.total_duration,
          followers_count: playlist.followers_count,
          is_public: playlist.is_public,
          user_id: playlist.user_id,
          username: playlist.users?.username || 'Unknown',
          created_at: playlist.created_at
        })) || []
        
        setPlaylists(transformedPlaylists)
      }
    } catch (error) {
      console.error('Error fetching discover playlists:', error)
    }
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirectTo=/playlists')
      return
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && user) {
      setLoading(true)
      
      const fetchPlaylists = async () => {
        switch (activeTab) {
          case 'my':
            await fetchMyPlaylists()
            break
          case 'following':
            await fetchFollowingPlaylists()
            break
          case 'discover':
            await fetchDiscoverPlaylists()
            break
        }
        setLoading(false)
      }

      fetchPlaylists()
    }
  }, [activeTab, isAuthenticated, user])

  const handlePlaylistCreated = (newPlaylist: any) => {
    if (activeTab === 'my') {
      // Add the new playlist to the beginning of the list
      setPlaylists(prev => [{
        id: newPlaylist.id,
        title: newPlaylist.title,
        description: newPlaylist.description,
        thumbnail_url: newPlaylist.thumbnail_url,
        video_count: newPlaylist.video_count || 0,
        total_duration: newPlaylist.total_duration || 0,
        followers_count: newPlaylist.followers_count || 0,
        is_public: newPlaylist.is_public,
        user_id: newPlaylist.user_id,
        username: user?.user_metadata?.username || 'You',
        created_at: newPlaylist.created_at
      }, ...prev])
    }
  }

  const handlePlaylistDeleted = (playlistId: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId))
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
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-orange-400 to-indigo-400 bg-clip-text text-transparent mb-4">
            Workout Playlists
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Organize your workouts into collections and discover curated playlists from the community
          </p>
        </div>

        {/* Tab Navigation and Create Button */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex justify-center sm:justify-start">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-2">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('my')}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'my'
                      ? 'bg-gradient-to-r from-blue-600 to-orange-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>My Playlists</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('following')}
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
                <button
                  onClick={() => setActiveTab('discover')}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === 'discover'
                      ? 'bg-gradient-to-r from-blue-600 to-orange-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Discover</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Create Playlist Button */}
          <button
            onClick={() => setShowCreator(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Playlist</span>
            </div>
          </button>
        </div>

        {/* Playlists Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-800 rounded-2xl h-80 border border-gray-700" />
            ))}
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No playlists found</h3>
            <p className="text-gray-400 text-lg mb-6">
              {activeTab === 'my' 
                ? 'Create your first playlist to organize your favorite workouts!'
                : activeTab === 'following'
                  ? 'Follow some users to see their public playlists here!'
                  : 'No public playlists available yet.'
              }
            </p>
            {activeTab === 'my' && (
              <button
                onClick={() => setShowCreator(true)}
                className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
              >
                Create Your First Playlist
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {playlists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                id={playlist.id}
                title={playlist.title}
                description={playlist.description}
                thumbnailUrl={playlist.thumbnail_url}
                videoCount={playlist.video_count}
                totalDuration={playlist.total_duration}
                followersCount={playlist.followers_count}
                isPublic={playlist.is_public}
                userId={playlist.user_id}
                userName={playlist.username}
                createdAt={playlist.created_at}
                isOwner={playlist.user_id === user?.id}
                onDelete={handlePlaylistDeleted}
              />
            ))}
          </div>
        )}
      </div>

      {/* Playlist Creator Modal */}
      {showCreator && (
        <PlaylistCreator
          onClose={() => setShowCreator(false)}
          onPlaylistCreated={handlePlaylistCreated}
        />
      )}
    </div>
  )
}