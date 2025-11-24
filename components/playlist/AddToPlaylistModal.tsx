'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import PlaylistCreator from './PlaylistCreator'

interface PlaylistOption {
  id: string
  title: string
  video_count: number
  is_public: boolean
  already_added: boolean
}

interface AddToPlaylistModalProps {
  videoId: string
  videoTitle: string
  onClose: () => void
  onSuccess?: (playlistTitle: string) => void
}

export default function AddToPlaylistModal({ videoId, videoTitle, onClose, onSuccess }: AddToPlaylistModalProps) {
  const { user } = useAuth()
  const [playlists, setPlaylists] = useState<PlaylistOption[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showCreator, setShowCreator] = useState(false)

  const fetchUserPlaylists = async () => {
    if (!user) return

    try {
      // Get user's playlists
      const { data: playlistsData, error: playlistsError } = await supabase
        .from('playlists')
        .select('id, title, video_count, is_public')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (playlistsError) {
        console.error('Error fetching playlists:', playlistsError)
        return
      }

      // Check which playlists already contain this video
      const playlistIds = playlistsData.map(p => p.id)
      let existingAdditions: string[] = []

      if (playlistIds.length > 0) {
        const { data: existingData } = await supabase
          .from('playlist_videos')
          .select('playlist_id')
          .eq('video_id', videoId)
          .in('playlist_id', playlistIds)

        existingAdditions = existingData?.map(item => item.playlist_id) || []
      }

      const transformedPlaylists = playlistsData.map(playlist => ({
        id: playlist.id,
        title: playlist.title,
        video_count: playlist.video_count,
        is_public: playlist.is_public,
        already_added: existingAdditions.includes(playlist.id)
      }))

      setPlaylists(transformedPlaylists)
    } catch (error) {
      console.error('Error fetching user playlists:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToPlaylist = async (playlistId: string) => {
    setActionLoading(playlistId)
    
    try {
      // Get the next position in the playlist
      const { data: positionData } = await supabase
        .from('playlist_videos')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1)

      const nextPosition = positionData && positionData.length > 0 
        ? positionData[0].position + 1 
        : 1

      // Add video to playlist
      const { error } = await supabase
        .from('playlist_videos')
        .insert({
          playlist_id: playlistId,
          video_id: videoId,
          position: nextPosition
        })

      if (error) {
        console.error('Error adding video to playlist:', error)
        return
      }

      // Update local state
      setPlaylists(prev => prev.map(playlist => 
        playlist.id === playlistId 
          ? { ...playlist, already_added: true, video_count: playlist.video_count + 1 }
          : playlist
      ))

      const playlistTitle = playlists.find(p => p.id === playlistId)?.title || 'playlist'
      onSuccess?.(playlistTitle)
    } catch (error) {
      console.error('Error adding video to playlist:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemoveFromPlaylist = async (playlistId: string) => {
    setActionLoading(playlistId)
    
    try {
      const { error } = await supabase
        .from('playlist_videos')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('video_id', videoId)

      if (error) {
        console.error('Error removing video from playlist:', error)
        return
      }

      // Update local state
      setPlaylists(prev => prev.map(playlist => 
        playlist.id === playlistId 
          ? { ...playlist, already_added: false, video_count: Math.max(0, playlist.video_count - 1) }
          : playlist
      ))
    } catch (error) {
      console.error('Error removing video from playlist:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handlePlaylistCreated = (newPlaylist: any) => {
    // Add new playlist to the list
    setPlaylists(prev => [{
      id: newPlaylist.id,
      title: newPlaylist.title,
      video_count: 1, // Video was added during creation
      is_public: newPlaylist.is_public,
      already_added: true
    }, ...prev])
    
    setShowCreator(false)
    onSuccess?.(newPlaylist.title)
  }

  useEffect(() => {
    fetchUserPlaylists()
  }, [user])

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Add to Playlist</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Video Info */}
          <div className="p-4 border-b border-gray-700">
            <p className="text-sm text-gray-400 mb-1">Adding video:</p>
            <p className="text-white font-medium truncate">{videoTitle}</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse h-12 bg-gray-800 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Create New Playlist Button */}
                <button
                  onClick={() => setShowCreator(true)}
                  className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-600/20 to-orange-600/20 border border-blue-500/30 rounded-lg hover:from-blue-600/30 hover:to-orange-600/30 transition-all duration-200"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-orange-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-white font-medium">Create new playlist</p>
                    <p className="text-gray-400 text-sm">Add this video to a new playlist</p>
                  </div>
                </button>

                {/* Existing Playlists */}
                {playlists.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No playlists yet</p>
                    <p className="text-sm text-gray-500 mt-1">Create your first playlist above</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400 mb-3">Your playlists:</p>
                    {playlists.map((playlist) => (
                      <div
                        key={playlist.id}
                        className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{playlist.title}</p>
                          <div className="flex items-center space-x-2 text-xs text-gray-400">
                            <span>{playlist.video_count} videos</span>
                            {!playlist.is_public && (
                              <>
                                <span>•</span>
                                <span>Private</span>
                              </>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => playlist.already_added 
                            ? handleRemoveFromPlaylist(playlist.id) 
                            : handleAddToPlaylist(playlist.id)
                          }
                          disabled={actionLoading === playlist.id}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                            playlist.already_added
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-600 text-white hover:bg-gray-500'
                          }`}
                        >
                          {actionLoading === playlist.id ? '...' : playlist.already_added ? 'Added' : 'Add'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Playlist Creator Modal */}
      {showCreator && (
        <PlaylistCreator
          videoId={videoId}
          onClose={() => setShowCreator(false)}
          onPlaylistCreated={handlePlaylistCreated}
        />
      )}
    </>
  )
}