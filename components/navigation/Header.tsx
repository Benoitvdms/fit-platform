'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../../hooks/useAuth'
import { signOut } from '../../lib/auth'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, isAuthenticated } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-gray-900/95 shadow-2xl backdrop-blur-md' 
        : 'bg-gray-900/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="group">
              <div className="text-3xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent hover:from-blue-300 hover:via-cyan-300 hover:to-blue-400 transition-all duration-300">
                Formly
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-8">
              {isAuthenticated && (
                <Link href="/feed" className="relative group">
                  <span className="text-white/90 hover:text-white font-medium transition-colors duration-200">
                    Feed
                  </span>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-full transition-all duration-300"></div>
                </Link>
              )}
              <Link href="/explore" className="relative group">
                <span className="text-white/90 hover:text-white font-medium transition-colors duration-200">
                  Explore
                </span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-full transition-all duration-300"></div>
              </Link>
              {isAuthenticated && (
                <>
                  <Link href="/playlists" className="relative group">
                    <span className="text-white/90 hover:text-white font-medium transition-colors duration-200">
                      Playlists
                    </span>
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-full transition-all duration-300"></div>
                  </Link>
                  <Link href="/upload" className="relative group">
                    <span className="text-white/90 hover:text-white font-medium transition-colors duration-200">
                      Upload
                    </span>
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-full transition-all duration-300"></div>
                  </Link>
                </>
              )}
              <Link href="/community" className="relative group">
                <span className="text-white/90 hover:text-white font-medium transition-colors duration-200">
                  Community
                </span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-full transition-all duration-300"></div>
              </Link>
            </nav>
          </div>
          
          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="hidden md:block relative">
              <input
                type="text"
                placeholder="Search workouts..."
                className="w-80 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
              />
              <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    className="px-4 py-2 text-white/90 hover:text-white font-medium transition-colors duration-200"
                  >
                    @{user?.user_metadata?.username || 'profile'}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="px-6 py-2 text-white/90 hover:text-white font-medium transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-6 py-2 text-white/90 hover:text-white font-medium transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white font-medium rounded-full shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white hover:text-blue-400 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <div className="flex flex-col space-y-4">
              {isAuthenticated && (
                <Link href="/feed" className="text-white/90 hover:text-white font-medium">
                  Feed
                </Link>
              )}
              <Link href="/explore" className="text-white/90 hover:text-white font-medium">
                Explore
              </Link>
              {isAuthenticated && (
                <>
                  <Link href="/playlists" className="text-white/90 hover:text-white font-medium">
                    Playlists
                  </Link>
                  <Link href="/upload" className="text-white/90 hover:text-white font-medium">
                    Upload
                  </Link>
                </>
              )}
              <Link href="/community" className="text-white/90 hover:text-white font-medium">
                Community
              </Link>
              <div className="pt-4 border-t border-white/20">
                {isAuthenticated ? (
                  <>
                    <Link href="/profile" className="block text-white/90 hover:text-white font-medium mb-3">
                      @{user?.user_metadata?.username || 'profile'}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block text-white/90 hover:text-white font-medium"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block text-white/90 hover:text-white font-medium mb-3">
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-orange-600 text-white font-medium rounded-full"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}