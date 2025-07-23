import { create } from 'zustand'
import { signIn as authSignIn, signUp as authSignUp, signOut as authSignOut, getCurrentUser } from '../services/auth-service'
import type { User } from '../types'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

// Private state variables
let _user: User | null = null
let _loading = false
let _error: string | null = null

export const useAuthStore = create<AuthState>((set, get) => ({
  user: _user,
  loading: _loading,
  error: _error,

  signIn: async (email: string, password: string) => {
    _loading = true
    _error = null
    set({ loading: true, error: null })

    try {
      const result = await authSignIn(email, password)
      if (result.error) {
        _error = result.error
        set({ error: result.error, loading: false })
      } else {
        _user = result.user
        set({ user: result.user, loading: false })
      }
    } catch (error) {
      _error = (error as Error).message
      set({ error: (error as Error).message, loading: false })
    } finally {
      _loading = false
    }
  },

  signUp: async (email: string, password: string) => {
    _loading = true
    _error = null
    set({ loading: true, error: null })

    try {
      const result = await authSignUp(email, password)
      if (result.error) {
        _error = result.error
        set({ error: result.error, loading: false })
      } else {
        _user = result.user
        set({ user: result.user, loading: false })
      }
    } catch (error) {
      _error = (error as Error).message
      set({ error: (error as Error).message, loading: false })
    } finally {
      _loading = false
    }
  },

  signOut: async () => {
    _loading = true
    set({ loading: true })

    try {
      await authSignOut()
      _user = null
      _error = null
      set({ user: null, error: null, loading: false })
    } catch (error) {
      _error = (error as Error).message
      set({ error: (error as Error).message, loading: false })
    } finally {
      _loading = false
    }
  },

  clearError: () => {
    _error = null
    set({ error: null })
  }
}))

// Initialize with current user if available
const currentUser = getCurrentUser()
if (currentUser) {
  _user = currentUser
  useAuthStore.setState({ user: currentUser })
} 