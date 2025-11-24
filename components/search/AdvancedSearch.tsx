'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

interface SearchFilters {
  query: string
  category: string
  subcategory: string
  duration: string
  sortBy: string
}

interface SearchSuggestion {
  type: 'video' | 'user' | 'category'
  title: string
  subtitle?: string
  id: string
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void
}

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
    subcategories: ['Boxing', 'Kickboxing', 'Martial Arts', 'MMA']
  },
  dance_fitness: {
    name: 'Dance Fitness',
    subcategories: ['Zumba', 'Hip Hop', 'Latin Dance', 'Ballet Fitness']
  },
  outdoor_sports: {
    name: 'Outdoor Sports',
    subcategories: ['Running', 'Cycling', 'Hiking', 'Rock Climbing']
  },
  flexibility: {
    name: 'Flexibility & Mobility',
    subcategories: ['Stretching', 'Foam Rolling', 'Recovery', 'Mobility']
  },
  specialized: {
    name: 'Specialized Training',
    subcategories: ['Rehabilitation', 'Senior Fitness', 'Prenatal', 'Youth Training']
  }
}

export default function AdvancedSearch({ onSearch, onSuggestionSelect }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'all',
    subcategory: 'all',
    duration: 'all',
    sortBy: 'recent'
  })
  
  const [showFilters, setShowFilters] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    // Debounce search suggestions
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (filters.query.length >= 2) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(filters.query)
      }, 300)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [filters.query])

  const fetchSuggestions = async (query: string) => {
    setLoading(true)
    try {
      const suggestions: SearchSuggestion[] = []

      // Search videos
      const { data: videos } = await supabase
        .from('videos')
        .select('id, title, main_category')
        .eq('is_public', true)
        .ilike('title', `%${query}%`)
        .limit(3)

      videos?.forEach(video => {
        suggestions.push({
          type: 'video',
          title: video.title,
          subtitle: `${video.main_category.replace('_', ' ')} workout`,
          id: video.id
        })
      })

      // Search users
      const { data: users } = await supabase
        .from('users')
        .select('id, username, full_name')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(3)

      users?.forEach(user => {
        suggestions.push({
          type: 'user',
          title: user.full_name || user.username,
          subtitle: `@${user.username}`,
          id: user.id
        })
      })

      // Search categories
      Object.entries(SPORTS_CATEGORIES).forEach(([key, category]) => {
        if (category.name.toLowerCase().includes(query.toLowerCase())) {
          suggestions.push({
            type: 'category',
            title: category.name,
            subtitle: 'Category',
            id: key
          })
        }
      })

      setSuggestions(suggestions)
      setShowSuggestions(suggestions.length > 0)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    
    // Reset subcategory when category changes
    if (key === 'category' && value !== filters.category) {
      newFilters.subcategory = 'all'
    }
    
    setFilters(newFilters)
    onSearch(newFilters)
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'video') {
      window.location.href = `/video/${suggestion.id}`
    } else if (suggestion.type === 'user') {
      // We need to get username for the profile URL
      // For now, we'll use the suggestion title as username
      const username = suggestion.subtitle?.replace('@', '') || suggestion.title
      window.location.href = `/profile/${username}`
    } else if (suggestion.type === 'category') {
      handleFilterChange('category', suggestion.id)
      setFilters(prev => ({ ...prev, query: '' }))
    }
    
    setShowSuggestions(false)
    onSuggestionSelect?.(suggestion)
  }

  const availableSubcategories = filters.category !== 'all' && SPORTS_CATEGORIES[filters.category as keyof typeof SPORTS_CATEGORIES]
    ? SPORTS_CATEGORIES[filters.category as keyof typeof SPORTS_CATEGORIES].subcategories
    : []

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div ref={searchRef} className="relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Search videos, users, or categories..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="w-full px-6 py-4 pl-14 pr-20 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          />
          <svg className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
              showFilters ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
            </svg>
          </button>
          
          {loading && (
            <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.id}-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-700/50 transition-colors text-left border-b border-gray-700/50 last:border-b-0"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                  suggestion.type === 'video' ? 'bg-blue-600' :
                  suggestion.type === 'user' ? 'bg-orange-600' :
                  'bg-green-600'
                }`}>
                  {suggestion.type === 'video' ? '🎥' :
                   suggestion.type === 'user' ? '👤' : '📂'}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{suggestion.title}</p>
                  {suggestion.subtitle && (
                    <p className="text-gray-400 text-sm">{suggestion.subtitle}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {Object.entries(SPORTS_CATEGORIES).map(([key, category]) => (
                  <option key={key} value={key}>{category.name}</option>
                ))}
              </select>
            </div>

            {/* Subcategory Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Subcategory</label>
              <select
                value={filters.subcategory}
                onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                disabled={availableSubcategories.length === 0}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="all">All Subcategories</option>
                {availableSubcategories.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Duration Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
              <select
                value={filters.duration}
                onChange={(e) => handleFilterChange('duration', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Any Duration</option>
                <option value="short">Under 10 minutes</option>
                <option value="medium">10-30 minutes</option>
                <option value="long">Over 30 minutes</option>
              </select>
            </div>

            {/* Sort By Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Trending</option>
                <option value="duration">Duration</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                const resetFilters = {
                  query: '',
                  category: 'all',
                  subcategory: 'all',
                  duration: 'all',
                  sortBy: 'recent'
                }
                setFilters(resetFilters)
                onSearch(resetFilters)
              }}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}