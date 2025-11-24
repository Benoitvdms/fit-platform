'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../hooks/useAuth'
import { supabase } from '../../../lib/supabase'
import VideoCard from '../../../components/video/VideoCard'
import Link from 'next/link'

type PlaylistVideo = {
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
  position: number
}

type PlaylistData = {
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
  updated_at: string
}

export default function PlaylistPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [playlist, setPlaylist] = useState<PlaylistData | null>(null)
  const [videos, setVideos] = useState<PlaylistVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  const fetchPlaylistData = async () => {
    try {
      // Fetch playlist details
      const { data: playlistData, error: playlistError } = await supabase
        .from('playlists')
        .select(`
          *,
          users!playlists_user_id_fkey(username)
        `)
        .eq('id', params.id)
        .single()

      if (playlistError) {
        console.error('Error fetching playlist:', playlistError)
        router.push('/playlists')
        return
      }

      // Check if user can access this playlist
      if (!playlistData.is_public && playlistData.user_id !== user?.id) {
        router.push('/playlists')
        return
      }

      const transformedPlaylist: PlaylistData = {
        id: playlistData.id,
        title: playlistData.title,
        description: playlistData.description,
        thumbnail_url: playlistData.thumbnail_url,
        video_count: playlistData.video_count,
        total_duration: playlistData.total_duration,
        followers_count: playlistData.followers_count,
        is_public: playlistData.is_public,
        user_id: playlistData.user_id,
        username: playlistData.users?.username || 'Unknown',
        created_at: playlistData.created_at,
        updated_at: playlistData.updated_at
      }

      setPlaylist(transformedPlaylist)

      // Fetch playlist videos
      const { data: videosData, error: videosError } = await supabase
        .from('playlist_videos')
        .select(`
          position,
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
        .eq('playlist_id', params.id)
        .order('position', { ascending: true })

      if (videosError) {
        console.error('Error fetching playlist videos:', videosError)
      } else {
        // Get unique user IDs to fetch usernames
        const userIds = [...new Set(videosData?.map(item => item.videos?.user_id).filter(Boolean))]
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

        const transformedVideos = videosData
          ?.filter(item => item.videos) // Filter out any null videos
          ?.map(item => ({
            id: item.videos.id,
            title: item.videos.title,
            username: usersMap[item.videos.user_id] || 'Unknown User',
            views: item.videos.views || 0,
            duration: item.videos.duration || '0:00',
            thumbnailUrl: item.videos.thumbnail_url,
            main_category: item.videos.main_category,
            sub_category: item.videos.sub_category,
            created_at: item.videos.created_at,
            user_id: item.videos.user_id,
            position: item.position
          })) || []

        setVideos(transformedVideos)
      }

      // Check if user is following this playlist
      if (user && playlistData.user_id !== user.id) {
        const { data: followData } = await supabase
          .from('playlist_follows')
          .select('id')
          .eq('user_id', user.id)
          .eq('playlist_id', params.id)
          .single()

        setIsFollowing(!!followData)
      }

    } catch (error) {
      console.error('Error fetching playlist data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollowToggle = async () => {
    if (!user || !playlist || playlist.user_id === user.id) return

    setFollowLoading(true)
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('playlist_follows')
          .delete()
          .eq('user_id', user.id)
          .eq('playlist_id', playlist.id)

        if (!error) {
          setIsFollowing(false)
          setPlaylist(prev => prev ? { ...prev, followers_count: prev.followers_count - 1 } : null)
        }
      } else {
        const { error } = await supabase
          .from('playlist_follows')
          .insert({
            user_id: user.id,
            playlist_id: playlist.id
          })

        if (!error) {
          setIsFollowing(true)
          setPlaylist(prev => prev ? { ...prev, followers_count: prev.followers_count + 1 } : null)
        }
      }
    } catch (error) {
      console.error('Error toggling playlist follow:', error)
    } finally {
      setFollowLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirectTo=/playlists')
      return
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchPlaylistData()
    }
  }, [isAuthenticated, params.id, user])

  // Show loading while checking auth
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated || !playlist) {
    return null
  }

  const isOwner = playlist.user_id === user?.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/playlists"
            className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Playlists</span>
          </Link>
        </div>

        {/* Playlist Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Playlist Thumbnail */}
            <div className="flex-shrink-0">
              <div className="w-64 h-64 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl overflow-hidden">
                {playlist.thumbnail_url ? (
                  <img
                    src={playlist.thumbnail_url}
                    alt={playlist.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      <p className="text-gray-400">{playlist.video_count} videos</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Playlist Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm text-gray-400">Playlist</span>
                    {!playlist.is_public && (
                      <div className="flex items-center space-x-1 text-orange-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">Private</span>
                      </div>
                    )}
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-4 break-words">
                    {playlist.title}
                  </h1>
                  {playlist.description && (
                    <p className="text-gray-300 text-lg mb-6 break-words">
                      {playlist.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {!isOwner && user && (
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`px-6 py-3 font-medium rounded-xl transition-all duration-200 ${
                      isFollowing
                        ? 'bg-gray-600 text-white hover:bg-gray-500'
                        : 'bg-gradient-to-r from-blue-600 to-orange-600 text-white hover:from-blue-700 hover:to-orange-700'
                    }`}
                  >
                    {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}

                {isOwner && (
                  <div className="flex space-x-2">
                    <Link
                      href={`/playlist/${playlist.id}/edit`}
                      className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors"
                    >
                      Edit Playlist
                    </Link>
                  </div>
                )}
              </div>

              {/* Creator and Stats */}
              <div className="flex flex-wrap items-center gap-4 text-gray-400">
                <Link
                  href={`/profile/${playlist.username}`}
                  className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
                >
                  <span>by {playlist.username}</span>
                </Link>
                <span>•</span>
                <span>{playlist.video_count} videos</span>
                <span>•</span>
                <span>{formatDuration(playlist.total_duration)}</span>
                {playlist.followers_count > 0 && (
                  <>
                    <span>•</span>
                    <span>{playlist.followers_count} followers</span>
                  </>
                )}
                <span>•</span>
                <span>Updated {formatDate(playlist.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Videos */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Videos ({videos.length})
            </h2>
            {isOwner && (
              <Link
                href={`/playlist/${playlist.id}/manage`}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                Manage Videos
              </Link>
            )}
          </div>

          {videos.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No videos yet</h3>
              <p className="text-gray-400 text-lg">
                {isOwner ? 'Add some videos to get started!' : 'This playlist is empty.'}
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
    </div>
  )
}