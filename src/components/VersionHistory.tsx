import React, { useEffect, useState } from 'react'
import { useDocumentStore } from '../stores/document-store'
import { formatRelativeTime, formatAbsoluteTime, groupVersionsByDay } from '../lib/time-utils'
import type { DocumentVersion } from '../types'

interface VersionHistoryProps {
  documentId: string
  isOpen: boolean
  onClose: () => void
  onRestore: (versionId: string) => void
}

/**
 * Version history component that displays document versions in a modal
 */
export function VersionHistory({ documentId, isOpen, onClose, onRestore }: VersionHistoryProps) {
  const { 
    versions, 
    versionsLoading, 
    error, 
    fetchDocumentVersions,
    clearError
  } = useDocumentStore()
  
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'preview'>('list')
  const [relativeTimeUpdate, setRelativeTimeUpdate] = useState(0)

  // Update relative times every minute
  useEffect(() => {
    if (!isOpen) return
    
    const interval = setInterval(() => {
      setRelativeTimeUpdate(prev => prev + 1)
    }, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [isOpen])

  // Fetch versions when modal opens
  useEffect(() => {
    if (isOpen && documentId) {
      fetchDocumentVersions(documentId)
    }
  }, [isOpen, documentId, fetchDocumentVersions])

  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle version selection for preview
  const handleVersionClick = (version: DocumentVersion) => {
    setSelectedVersion(version)
    setViewMode('preview')
  }

  // Handle restore confirmation
  const handleRestoreClick = (versionId: string) => {
    if (window.confirm('Are you sure you want to restore this version? This will create a new version with the restored content.')) {
      onRestore(versionId)
      onClose()
    }
  }

  // Get content preview (first 100 characters)
  const getContentPreview = (content: string): string => {
    const plainText = content.replace(/<[^>]*>/g, '') // Remove HTML tags
    return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText
  }

  if (!isOpen) return null

  if (versionsLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={clearError}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Retry
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  const groupedVersions = groupVersionsByDay(versions)

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex">
        {/* Version List */}
        <div className={`${viewMode === 'preview' ? 'w-1/3' : 'w-full'} border-r border-gray-200 flex flex-col`}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Version History</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {versions.length} version{versions.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {Array.from(groupedVersions.entries()).map(([dayHeader, dayVersions]) => (
              <div key={dayHeader}>
                <div className="sticky top-0 bg-gray-50 px-6 py-2 border-b border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700">{dayHeader}</h3>
                </div>
                
                {dayVersions.map((version) => (
                  <div
                    key={version.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedVersion?.id === version.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => handleVersionClick(version)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {version.change_description}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            v{version.version_number}
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-600 mb-2">
                          <span title={formatAbsoluteTime(version.created_at)}>
                            {formatRelativeTime(version.created_at)}
                          </span>
                          <span className="mx-2">•</span>
                          <span>{version.created_by_email}</span>
                        </div>
                        
                        <div className="text-sm text-gray-700 bg-gray-50 rounded p-2">
                          <div className="font-medium mb-1 truncate">{version.title}</div>
                          <div className="text-xs text-gray-600">
                            {getContentPreview(version.content)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleVersionClick(version)
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRestoreClick(version.id)
                        }}
                        className="text-xs text-green-600 hover:text-green-800"
                      >
                        Restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            
            {versions.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No versions found for this document.
              </div>
            )}
          </div>
        </div>
        
        {/* Version Preview */}
        {viewMode === 'preview' && selectedVersion && (
          <div className="w-2/3 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedVersion.title}
                </h3>
                <button
                  onClick={() => setViewMode('list')}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  ← Back to list
                </button>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  <span className="font-medium">Version {selectedVersion.version_number}</span>
                  <span className="mx-2">•</span>
                  <span>{selectedVersion.change_description}</span>
                </div>
                <button
                  onClick={() => handleRestoreClick(selectedVersion.id)}
                  className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  Restore This Version
                </button>
              </div>
              
              <div className="text-xs text-gray-500 mt-1">
                {formatAbsoluteTime(selectedVersion.created_at)} by {selectedVersion.created_by_email}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedVersion.content }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 