'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

interface PlaylistCardProps {
  id: string
  title: string
  description?: string
  thumbnailUrl?: string
  videoCount: number
  totalDuration: number
  followersCount: number
  isPublic: boolean
  userId: string
  userName: string
  createdAt: string
  isOwner?: boolean
  onDelete?: (playlistId: string) => void
}

export default function PlaylistCard({
  id,
  title,
  description,
  thumbnailUrl,
  videoCount,
  totalDuration,
  followersCount,
  isPublic,
  userId,
  userName,
  createdAt,
  isOwner = false,
  onDelete
}: PlaylistCardProps) {
  const { user } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleFollowToggle = async () => {
    if (!user || isOwner) return

    setLoading(true)
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('playlist_follows')
          .delete()
          .eq('user_id', user.id)
          .eq('playlist_id', id)

        if (!error) {
          setIsFollowing(false)
        }
      } else {
        const { error } = await supabase
          .from('playlist_follows')
          .insert({
            user_id: user.id,
            playlist_id: id
          })

        if (!error) {
          setIsFollowing(true)
        }
      }
    } catch (error) {
      console.error('Error toggling playlist follow:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!isOwner || !onDelete) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', id)

      if (!error) {
        onDelete(id)
      }
    } catch (error) {
      console.error('Error deleting playlist:', error)
    } finally {
      setLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-700 to-gray-800">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <p className="text-sm text-gray-400">{videoCount} videos</p>
            </div>
          </div>
        )}
        
        {/* Overlay with video count */}
        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
          {videoCount} videos
        </div>

        {/* Privacy indicator */}
        {!isPublic && (
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-white flex items-center space-x-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Private</span>
          </div>
        )}

        {/* Owner controls */}
        {isOwner && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex space-x-1">
              <Link
                href={`/playlist/${id}/edit`}
                className="p-1.5 bg-black/70 backdrop-blur-sm text-white rounded hover:bg-black/90 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 bg-red-600/70 backdrop-blur-sm text-white rounded hover:bg-red-600/90 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <Link href={`/playlist/${id}`}>
              <h3 className="text-lg font-semibold text-white truncate hover:text-blue-400 transition-colors">
                {title}
              </h3>
            </Link>
            {description && (
              <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                {description}
              </p>
            )}
          </div>
          
          {!isOwner && user && (
            <button
              onClick={handleFollowToggle}
              disabled={loading}
              className={`ml-2 px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                isFollowing
                  ? 'bg-gray-600 text-white hover:bg-gray-500'
                  : 'bg-gradient-to-r from-blue-600 to-orange-600 text-white hover:from-blue-700 hover:to-orange-700'
              }`}
            >
              {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        {/* Creator info */}
        <div className="flex items-center space-x-2 mb-3">
          <Link href={`/profile/${userName}`} className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
            by {userName}
          </Link>
          <span className="text-gray-600">•</span>
          <span className="text-xs text-gray-500">{formatDate(createdAt)}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <span>{formatDuration(totalDuration)}</span>
            {followersCount > 0 && (
              <>
                <span>•</span>
                <span>{followersCount} followers</span>
              </>
            )}
          </div>
          {isPublic && (
            <div className="flex items-center space-x-1 text-green-400">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">Public</span>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Playlist</h3>
            <p className="text-gray-400 mb-4">
              Are you sure you want to delete "{title}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg transition-colors"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}