import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Video Background */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video/Image */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900">
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          {/* Animated Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-cyan-600/20 to-blue-800/20 animate-pulse"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4">
          <div className="mb-8 animate-fadeIn">
            <h1 className="text-6xl md:text-8xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Formly
            </h1>
            <p className="text-xl md:text-3xl font-light mb-2 text-gray-200">
              Perfect Your Form, Perfect Your Fitness
            </p>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              Join the ultimate fitness community. Share your workouts, learn proper form, and discover exercises from expert trainers.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link
              href="/explore"
              className="group relative px-10 py-4 bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white font-bold text-lg rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/25"
            >
              <span className="relative z-10">Start Your Journey</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-orange-400 rounded-full blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </Link>
            <Link
              href="/signup"
              className="px-10 py-4 border-2 border-blue-400 text-blue-100 hover:bg-blue-400 hover:text-white font-bold text-lg rounded-full transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
            >
              Join Community
            </Link>
          </div>
          
          {/* Stats */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-center">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-blue-400">50K+</span>
              <span className="text-gray-300">Active Users</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-pink-400">100K+</span>
              <span className="text-gray-300">Workout Videos</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-indigo-400">1M+</span>
              <span className="text-gray-300">Workouts Completed</span>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-24 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose <span className="text-blue-400">Formly</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Master proper form and technique with our comprehensive platform designed for fitness enthusiasts of all levels
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="group relative p-8 bg-gradient-to-br from-purple-800/50 to-pink-800/50 rounded-2xl shadow-2xl backdrop-blur-sm border border-purple-500/20 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 text-center">Form Analysis</h3>
                <p className="text-gray-300 text-center">Expert guidance on proper technique and form to maximize results and prevent injuries</p>
              </div>
            </div>
            
            <div className="group relative p-8 bg-gradient-to-br from-indigo-800/50 to-blue-800/50 rounded-2xl shadow-2xl backdrop-blur-sm border border-indigo-500/20 transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-blue-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 text-center">Premium Content</h3>
                <p className="text-gray-300 text-center">Access exclusive workout videos from professional trainers and fitness experts</p>
              </div>
            </div>
            
            <div className="group relative p-8 bg-gradient-to-br from-emerald-800/50 to-teal-800/50 rounded-2xl shadow-2xl backdrop-blur-sm border border-emerald-500/20 transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-teal-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 text-center">Community Learning</h3>
                <p className="text-gray-300 text-center">Connect with trainers and athletes. Share techniques, ask questions, and grow together!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Preview */}
      <div className="py-24 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Explore <span className="text-blue-400">Categories</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              From strength training to yoga, find the perfect workout for your fitness journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { name: "Strength Training", emoji: "💪", color: "from-red-500 to-orange-500", users: "25K+" },
              { name: "Cardio", emoji: "🏃‍♂️", color: "from-blue-500 to-cyan-500", users: "18K+" },
              { name: "Yoga & Pilates", emoji: "🧘‍♀️", color: "from-green-500 to-emerald-500", users: "15K+" },
              { name: "Combat Sports", emoji: "🥊", color: "from-blue-500 to-orange-500", users: "12K+" },
              { name: "Dance Fitness", emoji: "💃", color: "from-pink-500 to-rose-500", users: "10K+" },
              { name: "Team Sports", emoji: "⚽", color: "from-indigo-500 to-blue-500", users: "8K+" }
            ].map((category, index) => (
              <div key={category.name} className="group relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300`}></div>
                <div className="relative p-8 bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 transform hover:scale-105">
                  <div className="text-center">
                    <div className="text-4xl mb-4">{category.emoji}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{category.users} active users</p>
                    <button className={`px-6 py-2 bg-gradient-to-r ${category.color} text-white rounded-full text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200`}>
                      Explore
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call-to-Action Section */}
      <div className="py-24 bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Transform?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Join thousands of fitness enthusiasts who are mastering proper form and achieving their goals with Formly
          </p>
          <Link
            href="/signup"
            className="inline-block px-12 py-4 bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white font-bold text-xl rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/25"
          >
            Start Your Journey Today
          </Link>
        </div>
      </div>
    </div>
  );
}
