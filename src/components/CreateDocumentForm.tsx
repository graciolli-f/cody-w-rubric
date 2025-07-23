import React, { useState } from 'react'
import { LoadingSpinner } from './LoadingSpinner'

interface CreateDocumentFormProps {
  onSubmit: (title: string) => Promise<void>
  loading: boolean
}

/**
 * Form component for creating new documents
 */
export function CreateDocumentForm({ onSubmit, loading }: CreateDocumentFormProps) {
  const [title, setTitle] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    await onSubmit(title.trim())
    setTitle('')
    setIsVisible(false)
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="btn-primary"
        disabled={loading}
      >
        + New Document
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Document title..."
        className="input-field flex-1"
        disabled={loading}
        autoFocus
        maxLength={100}
      />
      <button
        type="submit"
        className="btn-primary flex items-center"
        disabled={loading || !title.trim()}
      >
        {loading ? (
          <>
            <LoadingSpinner size="small" />
            <span className="ml-2">Creating...</span>
          </>
        ) : (
          'Create'
        )}
      </button>
      <button
        type="button"
        onClick={() => {
          setIsVisible(false)
          setTitle('')
        }}
        className="btn-secondary"
        disabled={loading}
      >
        Cancel
      </button>
    </form>
  )
} 