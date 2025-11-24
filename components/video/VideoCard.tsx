import Link from 'next/link'
import { useState } from 'react'
import FollowButton from '../user/FollowButton'
import AddToPlaylistModal from '../playlist/AddToPlaylistModal'
import { useAuth } from '../../hooks/useAuth'

interface VideoCardProps {
  id: string
  title: string
  username: string
  views: number
  duration: string
  thumbnailUrl?: string
  main_category?: string
  userId?: string
}

const categoryColors = {
  strength_training: 'from-red-500 to-orange-500',
  cardio: 'from-blue-500 to-cyan-500',
  yoga_pilates: 'from-green-500 to-emerald-500',
  combat_sports: 'from-purple-500 to-red-500',
  dance_fitness: 'from-pink-500 to-rose-500',
  team_sports: 'from-indigo-500 to-blue-500',
  outdoor_sports: 'from-green-600 to-teal-500',
  flexibility: 'from-teal-500 to-green-500',
  specialized: 'from-gray-500 to-slate-500'
}

const categoryThumbnails = {
  strength_training: [
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=300&fit=crop&crop=center', // Gym training
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=300&fit=crop&crop=center', // Weight training
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=300&fit=crop&crop=center', // Strength
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=300&fit=crop&crop=center'  // Fitness
  ],
  cardio: [
    'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=300&fit=crop&crop=center', // Cardio workout
    'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=300&fit=crop&crop=center', // Running
    'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=300&fit=crop&crop=center', // Cardio exercise
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center'  // Cycling
  ],
  yoga_pilates: [
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop&crop=center', // Yoga
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop&crop=center', // Stretching
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop&crop=center', // Pilates
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop&crop=center'  // Flexibility
  ],
  combat_sports: [
    'https://images.unsplash.com/photo-1549719386-74dfcbf38c62?w=400&h=300&fit=crop&crop=center', // Boxing
    'https://images.unsplash.com/photo-1540664379646-67b13eedef2e?w=400&h=300&fit=crop&crop=center', // Martial arts
    'https://images.unsplash.com/photo-1549719386-74dfcbf38c62?w=400&h=300&fit=crop&crop=center', // Combat
    'https://images.unsplash.com/photo-1540664379646-67b13eedef2e?w=400&h=300&fit=crop&crop=center'  // Fighting
  ],
  dance_fitness: [
    'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400&h=300&fit=crop&crop=center', // Dance
    'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400&h=300&fit=crop&crop=center', // Dancing
    'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400&h=300&fit=crop&crop=center', // Dance fitness
    'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400&h=300&fit=crop&crop=center'  // Zumba
  ],
  outdoor_sports: [
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop&crop=center', // Outdoor fitness
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop&crop=center', // Hiking
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop&crop=center', // Outdoor workout
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop&crop=center'  // Nature fitness
  ],
  flexibility: [
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop&crop=center', // Stretching
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop&crop=center', // Flexibility
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop&crop=center', // Mobility
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop&crop=center'  // Recovery
  ],
  specialized: [
    'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=300&fit=crop&crop=center', // General fitness
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=300&fit=crop&crop=center', // Training
    'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=300&fit=crop&crop=center', // Workout
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=300&fit=crop&crop=center'  // Exercise
  ],
  team_sports: [
    'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&h=300&fit=crop&crop=center', // Soccer
    'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?w=400&h=300&fit=crop&crop=center', // Basketball
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop&crop=center', // Volleyball
    'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&h=300&fit=crop&crop=center'  // Team sports
  ]
}

export default function VideoCard({
  id,
  title,
  username,
  views,
  duration,
  thumbnailUrl,
  main_category = 'specialized',
  userId
}: VideoCardProps) {
  const { isAuthenticated } = useAuth()
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handlePlaylistSuccess = (playlistTitle: string) => {
    setSuccessMessage(`Added to ${playlistTitle}`)
    setTimeout(() => setSuccessMessage(''), 3000)
  }
  // Smart thumbnail selection based on video title and category
  const getSmartThumbnail = () => {
    const titleLower = title.toLowerCase()
    
    // Define specific workout type thumbnails based on title keywords
    const workoutThumbnails = {
      // Boxing/Combat - must come first for specificity
      kickboxing: 'https://images.unsplash.com/photo-1549719386-74dfcbf38c62?w=400&h=300&fit=crop&crop=center',
      boxing: 'https://images.unsplash.com/photo-1549719386-74dfcbf38c62?w=400&h=300&fit=crop&crop=center',
      martial: 'https://images.unsplash.com/photo-1540664379646-67b13eedef2e?w=400&h=300&fit=crop&crop=center',
      mma: 'https://images.unsplash.com/photo-1540664379646-67b13eedef2e?w=400&h=300&fit=crop&crop=center',
      karate: 'https://images.unsplash.com/photo-1540664379646-67b13eedef2e?w=400&h=300&fit=crop&crop=center',
      taekwondo: 'https://images.unsplash.com/photo-1540664379646-67b13eedef2e?w=400&h=300&fit=crop&crop=center',
      jujitsu: 'https://images.unsplash.com/photo-1540664379646-67b13eedef2e?w=400&h=300&fit=crop&crop=center',
      
      // Strength Training
      deadlift: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=300&fit=crop&crop=center',
      squat: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=300&fit=crop&crop=center',
      bench: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=300&fit=crop&crop=center',
      dumbbell: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=300&fit=crop&crop=center',
      weight: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=300&fit=crop&crop=center',
      barbell: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=300&fit=crop&crop=center',
      powerlifting: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=300&fit=crop&crop=center',
      bodybuilding: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=300&fit=crop&crop=center',
      
      // Cardio
      running: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=300&fit=crop&crop=center',
      cycling: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center',
      hiit: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=300&fit=crop&crop=center',
      treadmill: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=300&fit=crop&crop=center',
      cardio: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=300&fit=crop&crop=center',
      
      // Yoga/Pilates
      yoga: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop&crop=center',
      pilates: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop&crop=center',
      meditation: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop&crop=center',
      stretch: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop&crop=center',
      flexibility: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop&crop=center',
      
      // Dance
      dance: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400&h=300&fit=crop&crop=center',
      zumba: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400&h=300&fit=crop&crop=center',
      
      // Team Sports
      soccer: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&h=300&fit=crop&crop=center',
      football: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&h=300&fit=crop&crop=center',
      basketball: 'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?w=400&h=300&fit=crop&crop=center',
      volleyball: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop&crop=center',
      
      // Outdoor
      hiking: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop&crop=center',
      climbing: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop&crop=center',
      outdoor: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop&crop=center',
      
      // Additional specific workouts
      crossfit: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=300&fit=crop&crop=center',
      calisthenics: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=300&fit=crop&crop=center',
      abs: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=300&fit=crop&crop=center',
      core: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=300&fit=crop&crop=center',
      workout: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=300&fit=crop&crop=center'
    }
    
    // Check for specific keywords in title
    for (const [keyword, thumbnail] of Object.entries(workoutThumbnails)) {
      if (titleLower.includes(keyword)) {
        return thumbnail
      }
    }
    
    // Fall back to category-based selection
    const categoryImages = categoryThumbnails[main_category as keyof typeof categoryThumbnails] || categoryThumbnails.strength_training
    const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const imageIndex = hash % categoryImages.length
    return categoryImages[imageIndex]
  }
  
  const categoryThumbnail = getSmartThumbnail()
  const categoryColor = categoryColors[main_category as keyof typeof categoryColors] || categoryColors.specialized

  return (
    <div className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden hover:scale-105 transition-all duration-300 border border-gray-700/50 hover:border-blue-500/50">
      <Link href={`/video/${id}`} className="block">
        <div className="relative aspect-video overflow-hidden">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="relative w-full h-full">
              <img
                src={categoryThumbnail}
                alt={`${main_category.replace('_', ' ')} workout`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
          )}
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
          
          {/* Duration Badge */}
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-sm text-white text-xs font-medium rounded-md">
            {duration}
          </div>

          {/* Add to Playlist Button */}
          {isAuthenticated && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowAddToPlaylist(true)
              }}
              className="absolute top-3 right-3 w-8 h-8 bg-black/70 backdrop-blur-sm hover:bg-black/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
              title="Add to playlist"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
          
          {/* Category Badge */}
          <div className={`absolute top-3 left-3 px-3 py-1 bg-gradient-to-r ${categoryColor} text-white text-xs font-medium rounded-full shadow-lg`}>
            {main_category.replace('_', ' ').toUpperCase()}
          </div>
        </div>
      </Link>
      
      <div className="p-6">
        <Link href={`/video/${id}`} className="block mb-3">
          <h3 className="font-bold text-white text-lg line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors duration-200">
            {title}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between">
          <Link 
            href={`/profile/${username}`}
            className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors duration-200"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {username.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium">@{username}</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-sm font-medium">
                {views > 1000 ? `${(views/1000).toFixed(1)}K` : views}
              </span>
            </div>
            {userId && (
              <div onClick={(e) => e.stopPropagation()}>
                <FollowButton targetUserId={userId} className="text-xs px-3 py-1" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="absolute top-4 left-4 right-4 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium text-center z-10">
          {successMessage}
        </div>
      )}

      {/* Add to Playlist Modal */}
      {showAddToPlaylist && (
        <AddToPlaylistModal
          videoId={id}
          videoTitle={title}
          onClose={() => setShowAddToPlaylist(false)}
          onSuccess={handlePlaylistSuccess}
        />
      )}
    </div>
  )
}