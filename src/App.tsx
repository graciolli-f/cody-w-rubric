import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/auth-store'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { DashboardPage } from './pages/DashboardPage'
import { DocumentEditorPage } from './pages/DocumentEditorPage'
import { ProtectedRoute } from './components/ProtectedRoute'

/**
 * Main application component with routing
 */
function App() {
  const { user } = useAuthStore()

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Document editor route */}
      <Route 
        path="/docs/:id" 
        element={
          <ProtectedRoute>
            <DocumentEditorPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Default redirect */}
      <Route 
        path="/" 
        element={
          <Navigate to={user ? "/dashboard" : "/login"} replace />
        } 
      />
      
      {/* 404 fallback */}
      <Route 
        path="*" 
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600">Page not found</p>
            </div>
          </div>
        } 
      />
    </Routes>
  )
}

export default App 