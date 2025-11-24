import { supabase } from './supabase'
import { User } from '../types/user'

export async function signUp(email: string, password: string, username: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: username,
      },
    },
  })

  if (error) {
    throw error
  }

  // Create user profile in the public users table
  if (data.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        username,
        display_name: username,
        email,
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't throw here as the user account was created successfully
    }
  }

  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw error
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  return {
    id: user.id,
    username: user.user_metadata?.username || '',
    email: user.email || '',
    displayName: user.user_metadata?.display_name || '',
    bio: user.user_metadata?.bio,
    avatarUrl: user.user_metadata?.avatar_url,
    followersCount: 0,
    followingCount: 0,
    videosCount: 0,
    totalLikes: 0,
    isVerified: false,
    createdAt: new Date(user.created_at),
    updatedAt: new Date(user.updated_at || user.created_at),
  }
}