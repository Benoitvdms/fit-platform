'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import FollowButton from './FollowButton'

interface User {
  id: string
  username: string
  full_name?: string
  avatar_url?: string
}

interface UserListProps {
  userId: string
  type: 'followers' | 'following'
  onClose: () => void
}

export default function UserList({ userId, type, onClose }: UserListProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [userId, type])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      let query
      
      if (type === 'followers') {
        // Get users who follow this user
        query = supabase
          .from('user_follows')
          .select(`
            follower_id,
            users!user_follows_follower_id_fkey(
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('following_id', userId)
      } else {
        // Get users this user follows
        query = supabase
          .from('user_follows')
          .select(`
            following_id,
            users!user_follows_following_id_fkey(
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('follower_id', userId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching users:', error)
        setUsers([])
      } else {
        const userList = data.map((item: any) => {
          const user = type === 'followers' ? item.users : item.users
          return {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            avatar_url: user.avatar_url
          }
        })
        setUsers(userList)
      }
    } catch (error) {
      console.error('Error:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white capitalize">
            {type} ({users.length})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User List */}
        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="p-6 text-center">
              <div className="text-gray-400">Loading...</div>
            </div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-gray-400">
                No {type} yet
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-700/30 transition-colors">
                  <Link
                    href={`/profile/${user.username}`}
                    className="flex items-center space-x-3 flex-1"
                    onClick={onClose}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name || user.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        user.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">
                        {user.full_name || user.username}
                      </p>
                      <p className="text-sm text-gray-400">@{user.username}</p>
                    </div>
                  </Link>
                  
                  <FollowButton targetUserId={user.id} className="text-xs px-4 py-1.5" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}