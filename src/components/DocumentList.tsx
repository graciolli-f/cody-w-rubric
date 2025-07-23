import React from 'react'
import { Link } from 'react-router-dom'
import type { Document } from '../types'

interface DocumentListProps {
  documents: Document[]
  onDelete: (id: string) => void
  loading: boolean
}

/**
 * Component to display a list of documents
 */
export function DocumentList({ documents, onDelete, loading }: DocumentListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">You haven't created any documents yet.</p>
        <p className="text-sm text-gray-400">
          Click "New Document" to create your first document.
        </p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <div key={document.id} className="card hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <Link 
                to={`/docs/${document.id}`}
                className="block hover:text-blue-600 transition-colors"
              >
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {document.title || 'Untitled Document'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Last updated {formatDate(document.updated_at)}
                </p>
              </Link>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <Link 
                to={`/docs/${document.id}`}
                className="btn-secondary text-sm"
              >
                Edit
              </Link>
              <button
                onClick={() => onDelete(document.id)}
                className="text-red-600 hover:text-red-700 text-sm font-medium px-2 py-1 rounded transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
          
          {document.content && (
            <div className="mt-3 text-sm text-gray-600 line-clamp-2">
              {document.content.replace(/<[^>]*>/g, '').substring(0, 120)}
              {document.content.length > 120 && '...'}
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 