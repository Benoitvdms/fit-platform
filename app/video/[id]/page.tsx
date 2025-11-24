'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../hooks/useAuth'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import FollowButton from '../../../components/user/FollowButton'
import VideoPlayer from '../../../components/video/VideoPlayer'

interface VideoPageProps {
  params: Promise<{ id: string }>
}

type Video = {
  id: string
  title: string
  description: string
  video_url: string
  duration: number
  main_category: string
  sub_category: string
  tags: string[]
  user_id: string
  is_public: boolean
  views: number
  likes_count: number
  comments_count: number
  created_at: string
  uploader_username?: string
}

type Comment = {
  id: string
  comment: string
  user_id: string
  created_at: string
  username?: string
}

export default function VideoPage({ params }: VideoPageProps) {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  
  // Interaction states
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [loadingComments, setLoadingComments] = useState(false)

  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  const fetchVideo = async (videoId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single()

      if (error) {
        console.error('Error fetching video:', error)
        setError('Video not found')
        setVideo(null)
      } else {
        // Get the uploader's username from auth.users metadata
        let uploaderUsername = 'Unknown User'
        
        // If this is the current user's video, use their username
        if (user && user.id === data.user_id) {
          uploaderUsername = user.user_metadata?.username || 'You'
        } else {
          // For other users, we'll use a placeholder since we can't access other users' metadata from client
          uploaderUsername = 'Fitness Enthusiast'
        }

        setVideo({
          ...data,
          uploader_username: uploaderUsername
        })
        
        // Increment view count
        await supabase
          .from('videos')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', videoId)

        // Check if user has liked this video
        if (user) {
          const { data: likeData } = await supabase
            .from('video_likes')
            .select('id')
            .eq('video_id', videoId)
            .eq('user_id', user.id)
            .single()
          setIsLiked(!!likeData)

          // Check if user has saved this video
          const { data: saveData } = await supabase
            .from('video_saves')
            .select('id')
            .eq('video_id', videoId)
            .eq('user_id', user.id)
            .single()
          setIsSaved(!!saveData)
        }
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setError('Failed to load video')
      setVideo(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (videoId: string) => {
    setLoadingComments(true)
    try {
      const { data, error } = await supabase
        .from('video_comments')
        .select('*')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching comments:', error)
      } else {
        // Add username to comments
        const commentsWithUsernames = data.map(comment => ({
          ...comment,
          username: comment.user_id === user?.id ? (user?.user_metadata?.username || 'You') : 'User'
        }))
        setComments(commentsWithUsernames)
      }
    } catch (error) {
      console.error('Comments fetch error:', error)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleLike = async () => {
    if (!user || !video) return

    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('video_likes')
          .delete()
          .eq('video_id', video.id)
          .eq('user_id', user.id)
        
        setIsLiked(false)
        setVideo(prev => prev ? { ...prev, likes_count: prev.likes_count - 1 } : null)
      } else {
        // Like
        await supabase
          .from('video_likes')
          .insert({ video_id: video.id, user_id: user.id })
        
        setIsLiked(true)
        setVideo(prev => prev ? { ...prev, likes_count: prev.likes_count + 1 } : null)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleSave = async () => {
    if (!user || !video) return

    try {
      if (isSaved) {
        // Unsave
        await supabase
          .from('video_saves')
          .delete()
          .eq('video_id', video.id)
          .eq('user_id', user.id)
        
        setIsSaved(false)
      } else {
        // Save
        await supabase
          .from('video_saves')
          .insert({ video_id: video.id, user_id: user.id })
        
        setIsSaved(true)
      }
    } catch (error) {
      console.error('Error toggling save:', error)
    }
  }

  const handleShare = async () => {
    if (!video) return

    const shareUrl = `${window.location.origin}/video/${video.id}`
    
    try {
      if (navigator.share) {
        // Use native share API if available
        await navigator.share({
          title: video.title,
          text: video.description,
          url: shareUrl
        })
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(shareUrl)
        alert('Video link copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl)
        alert('Video link copied to clipboard!')
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError)
        alert(`Share this video: ${shareUrl}`)
      }
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !video || !newComment.trim()) return

    setSubmittingComment(true)
    try {
      const { data, error } = await supabase
        .from('video_comments')
        .insert({
          video_id: video.id,
          user_id: user.id,
          comment: newComment.trim()
        })
        .select()
        .single()

      if (error) {
        console.error('Error posting comment:', error)
        alert('Failed to post comment')
      } else {
        // Add the new comment to the list
        const newCommentWithUsername = {
          ...data,
          username: user?.user_metadata?.username || 'You'
        }
        setComments(prev => [newCommentWithUsername, ...prev])
        setNewComment('')
        setVideo(prev => prev ? { ...prev, comments_count: prev.comments_count + 1 } : null)
      }
    } catch (error) {
      console.error('Comment submission error:', error)
      alert('Failed to post comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirectTo=/video/' + resolvedParams?.id)
      return
    }
  }, [authLoading, isAuthenticated, router, resolvedParams?.id])

  useEffect(() => {
    if (resolvedParams?.id && isAuthenticated) {
      fetchVideo(resolvedParams.id)
      fetchComments(resolvedParams.id)
    }
  }, [resolvedParams?.id, isAuthenticated, user])

  // Show loading while checking auth
  if (authLoading || !resolvedParams) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading video...</div>
      </div>
    )
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error || 'Video not found'}</div>
          <Link 
            href="/explore" 
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-orange-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-orange-700 transition-all duration-300"
          >
            Back to Explore
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="mb-6">
              <VideoPlayer
                videoUrl={video.video_url}
                videoId={video.id}
                title={video.title}
                className="w-full aspect-video rounded-2xl shadow-2xl"
                autoPlay={false}
                controls={true}
              />
            </div>
            
            {/* Video Info */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700">
              <h1 className="text-3xl font-bold text-white mb-4">
                {video.title}
              </h1>
              
              <div className="flex items-center space-x-4 mb-6 text-gray-400">
                <span>{video.views} views</span>
                <span>•</span>
                <span>{new Date(video.created_at).toLocaleDateString()}</span>
                <span>•</span>
                <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-orange-600 text-white text-sm rounded-full">
                  {video.main_category.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-700 pb-6 mb-6">
                <Link href={`/profile/${video.uploader_username || 'unknown'}`} className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {video.uploader_username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-white">@{video.uploader_username || 'unknown'}</p>
                    <p className="text-sm text-gray-400">Fitness Enthusiast</p>
                  </div>
                </Link>
                <FollowButton targetUserId={video.user_id} />
              </div>

              <div className="flex items-center space-x-6 mb-6">
                <button 
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                    isLiked 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-gray-700/50 hover:bg-gray-600/50 text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{video.likes_count || 0}</span>
                </button>
                
                <button 
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-full transition-all duration-200 text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span>Share</span>
                </button>
                
                <button 
                  onClick={handleSave}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                    isSaved 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-700/50 hover:bg-gray-600/50 text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span>Save</span>
                </button>
              </div>

              {video.description && (
                <div className="prose max-w-none">
                  <p className="text-gray-300 leading-relaxed">
                    {video.description}
                  </p>
                </div>
              )}

              {video.tags && video.tags.length > 0 && (
                <div className="mt-6">
                  <div className="flex flex-wrap gap-2">
                    {video.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-700/50 text-gray-300 text-sm rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Related Videos</h3>
              <div className="text-gray-400 text-center py-8">
                No related videos yet
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">
                Comments ({video.comments_count || 0})
              </h3>
              
              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {user?.user_metadata?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={!newComment.trim() || submittingComment}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                      >
                        {submittingComment ? 'Posting...' : 'Post'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {loadingComments ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400">Loading comments...</div>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400">No comments yet. Be the first to comment!</div>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3 pb-4 border-b border-gray-700/50 last:border-b-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {comment.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-white">@{comment.username}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {comment.comment}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}