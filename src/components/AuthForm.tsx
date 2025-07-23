import React, { useState } from 'react'
import { LoadingSpinner } from './LoadingSpinner'

interface AuthFormProps {
  type: 'login' | 'signup'
  onSubmit: (email: string, password: string) => Promise<void>
  loading: boolean
  error: string | null
}

/**
 * Reusable authentication form for login and signup
 */
export function AuthForm({ type, onSubmit, loading, error }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError('Email is required')
      return false
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address')
      return false
    }
    setEmailError('')
    return true
  }

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required')
      return false
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return false
    }
    if (type === 'signup') {
      if (!/(?=.*[a-z])/.test(password)) {
        setPasswordError('Password must contain at least one lowercase letter')
        return false
      }
      if (!/(?=.*[A-Z])/.test(password)) {
        setPasswordError('Password must contain at least one uppercase letter')
        return false
      }
    }
    setPasswordError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)
    
    if (!isEmailValid || !isPasswordValid) {
      return
    }

    await onSubmit(email, password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          placeholder="Enter your email"
          disabled={loading}
          autoComplete="email"
        />
        {emailError && <p className="error-message">{emailError}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
          placeholder={type === 'signup' ? 'Create a strong password' : 'Enter your password'}
          disabled={loading}
          autoComplete={type === 'login' ? 'current-password' : 'new-password'}
        />
        {passwordError && <p className="error-message">{passwordError}</p>}
        {type === 'signup' && !passwordError && (
          <p className="text-xs text-gray-500 mt-1">
            Must be at least 6 characters with uppercase and lowercase letters
          </p>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

      <button 
        type="submit" 
        className="btn-primary w-full flex items-center justify-center"
        disabled={loading}
      >
        {loading ? (
          <>
            <LoadingSpinner size="small" />
            <span className="ml-2">
              {type === 'login' ? 'Signing in...' : 'Creating account...'}
            </span>
          </>
        ) : (
          type === 'login' ? 'Sign In' : 'Create Account'
        )}
      </button>
    </form>
  )
} 