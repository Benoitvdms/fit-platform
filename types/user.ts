export interface User {
  id: string
  username: string
  email: string
  displayName: string
  bio?: string
  avatarUrl?: string
  followersCount: number
  followingCount: number
  videosCount: number
  totalLikes: number
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Profile extends User {
  isFollowing?: boolean
  isCurrentUser?: boolean
}

export interface UserFollow {
  id: string
  followerId: string
  followingId: string
  createdAt: Date
}