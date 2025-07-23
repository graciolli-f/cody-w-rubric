import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/auth-store'
import { useDocumentStore } from '../stores/document-store'
import { DocumentEditor } from '../components/DocumentEditor'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { VersionHistory } from '../components/VersionHistory'

/**
 * Document editor page component
 */
export function DocumentEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const { 
    currentDocument, 
    loading, 
    error, 
    fetchDocument, 
    updateDocument,
    restoreDocumentVersion,
    clearError,
    clearCurrentDocument
  } = useDocumentStore()
  
  const [title, setTitle] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false)

  useEffect(() => {
    if (id && user) {
      fetchDocument(id, user.id)
    }
    
    return () => {
      clearCurrentDocument()
    }
  }, [id, user, fetchDocument, clearCurrentDocument])

  useEffect(() => {
    if (currentDocument) {
      setTitle(currentDocument.title)
    }
  }, [currentDocument])

  const handleSaveContent = async (content: string) => {
    if (!id || !user || !currentDocument) return
    
    try {
      await updateDocument(id, { content }, user.id)
      setLastSaved(new Date())
    } catch (error) {
      // Error handled by store
    }
  }

  const handleSaveTitle = async () => {
    if (!id || !user || !currentDocument || title === currentDocument.title) {
      setIsEditingTitle(false)
      return
    }
    
    try {
      await updateDocument(id, { title }, user.id)
      setIsEditingTitle(false)
    } catch (error) {
      setTitle(currentDocument.title) // Revert on error
      setIsEditingTitle(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle()
    } else if (e.key === 'Escape') {
      setTitle(currentDocument?.title || '')
      setIsEditingTitle(false)
    }
  }

  const handleRestoreVersion = async (versionId: string) => {
    if (!id || !user) return
    
    try {
      await restoreDocumentVersion(id, versionId, user.id)
      setLastSaved(new Date())
    } catch (error) {
      // Error handled by store
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={clearError} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!currentDocument) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Document not found</p>
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Dashboard
              </Link>
              
              <div className="flex items-center space-x-2">
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleSaveTitle}
                    onKeyDown={handleKeyPress}
                    className="text-lg font-medium bg-transparent border-b border-blue-500 focus:outline-none"
                    autoFocus
                    maxLength={100}
                  />
                ) : (
                  <h1 
                    className="text-lg font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {currentDocument.title || 'Untitled Document'}
                  </h1>
                )}
                
                {lastSaved && (
                  <span className="text-xs text-gray-500">
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsVersionHistoryOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Version History
              </button>
              
              <span className="text-sm text-gray-600">
                {user?.email}
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

      {/* Editor */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <DocumentEditor
          documentId={currentDocument.id}
          initialContent={currentDocument.content}
          onSave={handleSaveContent}
          editable={true}
        />
      </main>

      {/* Version History Modal */}
      <VersionHistory
        documentId={currentDocument.id}
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        onRestore={handleRestoreVersion}
      />
    </div>
  )
} 