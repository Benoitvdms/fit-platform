import { MainCategory, SubCategory } from './categories'

export interface Video {
  id: string
  title: string
  description?: string
  thumbnailUrl?: string
  videoUrl: string
  duration: number
  mainCategory: MainCategory
  subCategory: SubCategory
  tags?: string[]
  views: number
  likes: number
  commentsCount: number
  userId: string
  username: string
  userAvatarUrl?: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

export interface VideoComment {
  id: string
  videoId: string
  userId: string
  username: string
  userAvatarUrl?: string
  content: string
  parentCommentId?: string
  createdAt: Date
}

export interface VideoLike {
  id: string
  videoId: string
  userId: string
  createdAt: Date
}

export interface VideoUpload {
  title: string
  description?: string
  mainCategory: MainCategory
  subCategory: SubCategory
  tags?: string[]
  file: File
  isPublic: boolean
}