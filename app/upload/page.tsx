'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

const SPORTS_CATEGORIES = {
  strength_training: {
    name: 'Strength Training',
    subcategories: ['Weightlifting', 'Bodybuilding', 'Powerlifting', 'CrossFit']
  },
  cardio: {
    name: 'Cardio',
    subcategories: ['Running', 'Cycling', 'HIIT', 'Dance Cardio']
  },
  yoga_pilates: {
    name: 'Yoga & Pilates',
    subcategories: ['Hatha Yoga', 'Vinyasa Yoga', 'Pilates Mat', 'Pilates Reformer']
  },
  combat_sports: {
    name: 'Combat Sports',
    subcategories: ['Boxing', 'Kickboxing', 'Muay Thai', 'Taekwondo', 'Karate', 'Jiu Jitsu', 'MMA', 'Kung Fu', 'Judo', 'Krav Maga']
  },
  dance_fitness: {
    name: 'Dance Fitness',
    subcategories: ['Zumba', 'Hip Hop', 'Latin Dance', 'Ballet Fitness']
  },
  outdoor_sports: {
    name: 'Outdoor Sports',
    subcategories: ['Running', 'Cycling', 'Hiking', 'Rock Climbing']
  }
}

export default function UploadPage() {
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuth()
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?redirectTo=/upload')
    }
  }, [loading, isAuthenticated, router])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mainCategory: '',
    subCategory: '',
    tags: '',
    isPublic: true
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Reset subcategory when main category changes
    if (field === 'mainCategory') {
      setFormData(prev => ({
        ...prev,
        subCategory: ''
      }))
    }
  }

  const handleVideoUpload = (files: FileList | null) => {
    const file = files?.[0]
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file)
    } else {
      alert('Please select a valid video file')
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleVideoUpload(e.dataTransfer.files)
  }

  // Show loading while checking auth
  if (loading) {
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

  const uploadVideoToSupabase = async () => {
    if (!videoFile || !user) return
    
    setUploadProgress(10)
    
    // Create unique filename
    const fileExt = videoFile.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`
    
    setUploadProgress(30)
    
    // Upload video file to Supabase Storage
    const { data: videoUpload, error: videoError } = await supabase.storage
      .from('videos')
      .upload(fileName, videoFile)
    
    if (videoError) {
      throw new Error(`Video upload failed: ${videoError.message}`)
    }
    
    setUploadProgress(60)
    
    // Get video URL
    const { data: videoUrl } = supabase.storage
      .from('videos')
      .getPublicUrl(fileName)
    
    setUploadProgress(80)
    
    // Save video metadata to database
    const { data, error: dbError } = await supabase
      .from('videos')
      .insert({
        title: formData.title,
        description: formData.description,
        video_url: videoUrl.publicUrl,
        duration: 0, // We'll set this to 0 for now, could calculate from video file
        main_category: formData.mainCategory,
        sub_category: formData.subCategory,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        user_id: user.id,
        is_public: formData.isPublic
      })
      .select()
    
    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`)
    }
    
    setUploadProgress(100)
    return data[0]
  }

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault()
    
    if (!videoFile || !formData.title || !formData.mainCategory || !formData.subCategory) {
      alert('Please fill in all required fields and select a video file')
      return
    }

    setUploading(true)
    
    try {
      const uploadedVideo = await uploadVideoToSupabase()
      alert(isDraft ? 'Video saved as draft!' : 'Video uploaded successfully!')
      router.push('/explore')
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Please try again.'}`)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-orange-400 to-indigo-400 bg-clip-text text-transparent mb-4">
            Upload Your Workout
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Share your fitness journey with the community. Upload workout videos, tutorials, and inspire others!
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700">
          {/* Upload Progress */}
          {uploading && (
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-300 mb-2">
                <span>Uploading your workout...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-orange-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
            {/* Video Upload */}
            <div>
              <label className="block text-lg font-medium text-white mb-4">
                Video File *
              </label>
              <div 
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  dragActive || videoFile
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleVideoUpload(e.target.files)}
                      className="hidden"
                      id="video-upload"
                      disabled={uploading}
                    />
                    <label 
                      htmlFor="video-upload" 
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white font-medium rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 inline-block"
                    >
                      Choose Video File
                    </label>
                  </div>
                  <p className="text-gray-400">or drag and drop your video here</p>
                  <p className="text-sm text-gray-500">MP4, MOV, AVI up to 500MB</p>
                  {videoFile && (
                    <div className="mt-4 p-4 bg-green-900/30 border border-green-500 rounded-xl">
                      <p className="text-green-400 font-medium">
                        ✓ {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)}MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-lg font-medium text-white mb-4">
                Thumbnail (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all duration-200"
                disabled={uploading}
              />
              {thumbnailFile && (
                <p className="text-green-400 text-sm mt-2">
                  ✓ {thumbnailFile.name}
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-lg font-medium text-white mb-4">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Give your workout an amazing title..."
                required
                disabled={uploading}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-lg font-medium text-white mb-4">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Describe your workout, what makes it special, who it's for..."
                disabled={uploading}
              />
            </div>

            {/* Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="mainCategory" className="block text-lg font-medium text-white mb-4">
                  Main Category *
                </label>
                <select
                  id="mainCategory"
                  value={formData.mainCategory}
                  onChange={(e) => handleInputChange('mainCategory', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                  disabled={uploading}
                >
                  <option value="">Select main category</option>
                  {Object.entries(SPORTS_CATEGORIES).map(([key, category]) => (
                    <option key={key} value={key}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="subCategory" className="block text-lg font-medium text-white mb-4">
                  Subcategory *
                </label>
                <select
                  id="subCategory"
                  value={formData.subCategory}
                  onChange={(e) => handleInputChange('subCategory', e.target.value)}
                  disabled={!formData.mainCategory || uploading}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                  required
                >
                  <option value="">Select subcategory</option>
                  {formData.mainCategory && SPORTS_CATEGORIES[formData.mainCategory as keyof typeof SPORTS_CATEGORIES].subcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-lg font-medium text-white mb-4">
                Tags (comma separated)
              </label>
              <input
                type="text"
                id="tags"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="beginner, no-equipment, 20-min, full-body"
                disabled={uploading}
              />
            </div>

            {/* Public Toggle */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                disabled={uploading}
              />
              <label htmlFor="isPublic" className="text-white font-medium">
                Make this video public (others can view it)
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={(e) => handleSubmit(e as any, true)}
                className="flex-1 px-8 py-4 bg-gray-700/50 border border-gray-600 hover:bg-gray-600/50 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                disabled={uploading}
              >
                Save as Draft
              </button>
              <button
                type="submit"
                className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Publish Video'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}