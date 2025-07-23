import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth-store'
import { AuthForm } from '../components/AuthForm'

/**
 * Login page component
 */
export function LoginPage() {
  const { user, loading, error, signIn, clearError } = useAuthStore()

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSignIn = async (email: string, password: string) => {
    clearError()
    await signIn(email, password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link 
              to="/signup" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>
        
        <div className="card">
          <AuthForm
            type="login"
            onSubmit={handleSignIn}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  )
} 