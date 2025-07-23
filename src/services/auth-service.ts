import { signIn as supabaseSignIn, signUp as supabaseSignUp, signOut as supabaseSignOut, getCurrentUser as getSupabaseUser } from '../lib/supabase'
import type { User } from '../types'

// Private state
let _currentUser: User | null = null

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<{user: User | null, error?: string}> {
  try {
    const response = await supabaseSignIn(email, password)
    _currentUser = response.user
    return response
  } catch (error) {
    return { user: null, error: (error as Error).message }
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string): Promise<{user: User | null, error?: string}> {
  try {
    const response = await supabaseSignUp(email, password)
    _currentUser = response.user
    return response
  } catch (error) {
    return { user: null, error: (error as Error).message }
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  try {
    await supabaseSignOut()
    _currentUser = null
  } catch (error) {
    throw error
  }
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): User | null {
  if (_currentUser) return _currentUser
  return getSupabaseUser()
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {valid: boolean, message?: string} {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' }
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' }
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' }
  }
  return { valid: true }
} 