import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth-store'
import { useDocumentStore } from '../stores/document-store'
import { DocumentList } from '../components/DocumentList'
import { CreateDocumentForm } from '../components/CreateDocumentForm'
import { LoadingSpinner } from '../components/LoadingSpinner'

/**
 * Dashboard page displaying user's document list
 */
export function DashboardPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const {
    documents,
    loading,
    error,
    fetchDocuments,
    createDocument,
    deleteDocument,
    clearError
  } = useDocumentStore()

  useEffect(() => {
    if (user) {
      fetchDocuments(user.id)
    }
  }, [user, fetchDocuments])

  const handleCreateDocument = async (title: string) => {
    if (!user) return
    try {
      const document = await createDocument(title, '', user.id)
      navigate(`/docs/${document.id}`)
    } catch (error) {
      // Error is handled by the store
    }
  }

  const handleDeleteDocument = async (id: string) => {
    if (!user) return
    if (window.confirm('Are you sure you want to delete this document?')) {
      await deleteDocument(id, user.id)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Document Editor
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="btn-secondary text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Documents</h2>
            <CreateDocumentForm 
              onSubmit={handleCreateDocument}
              loading={loading}
            />
          </div>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={clearError}
                className="text-red-600 text-sm underline hover:no-underline mt-1"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        <DocumentList
          documents={documents}
          onDelete={handleDeleteDocument}
          loading={loading && documents.length === 0}
        />
      </main>
    </div>
  )
} 