'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

interface FollowButtonProps {
  targetUserId: string
  initialIsFollowing?: boolean
  className?: string
}

export default function FollowButton({ 
  targetUserId, 
  initialIsFollowing = false, 
  className = '' 
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    getCurrentUser()
  }, [])

  useEffect(() => {
    if (currentUserId && targetUserId && currentUserId !== targetUserId) {
      checkFollowStatus()
    }
  }, [currentUserId, targetUserId])

  const checkFollowStatus = async () => {
    if (!currentUserId) return

    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .single()

      if (!error && data) {
        setIsFollowing(true)
      }
    } catch (err) {
      // No follow relationship exists
      setIsFollowing(false)
    }
  }

  const handleFollow = async () => {
    if (!currentUserId || currentUserId === targetUserId) return
    
    setLoading(true)
    
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', targetUserId)

        if (error) throw error
        setIsFollowing(false)
      } else {
        // Follow
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: currentUserId,
            following_id: targetUserId
          })

        if (error) throw error
        setIsFollowing(true)
      }
    } catch (error) {
      console.error('Follow/unfollow error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Don't show button if user is viewing their own profile or not logged in
  if (!currentUserId || currentUserId === targetUserId) {
    return null
  }

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`
        px-6 py-2 rounded-full font-medium text-sm transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
        ${isFollowing 
          ? 'bg-gray-600 hover:bg-gray-700 text-white border border-gray-500' 
          : 'bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white shadow-lg hover:shadow-blue-500/25'
        }
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>{isFollowing ? 'Unfollowing...' : 'Following...'}</span>
        </div>
      ) : (
        isFollowing ? 'Following' : 'Follow'
      )}
    </button>
  )
}