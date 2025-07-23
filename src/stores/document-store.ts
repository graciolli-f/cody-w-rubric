import { create } from 'zustand'
import { 
  fetchUserDocuments, 
  fetchDocument as fetchSingleDocument,
  createDocument as createNewDocument,
  updateDocument as updateExistingDocument,
  deleteDocument as removeDocument
} from '../services/document-service'
import type { Document } from '../types'

interface DocumentState {
  documents: Document[]
  currentDocument: Document | null
  loading: boolean
  error: string | null
  fetchDocuments: (userId: string) => Promise<void>
  fetchDocument: (id: string, userId: string) => Promise<void>
  createDocument: (title: string, content: string, userId: string) => Promise<Document>
  updateDocument: (id: string, updates: Partial<Document>, userId: string) => Promise<void>
  deleteDocument: (id: string, userId: string) => Promise<void>
  clearError: () => void
  clearCurrentDocument: () => void
}

// Private state variables
let _documents: Document[] = []
let _currentDocument: Document | null = null
let _loading = false
let _error: string | null = null

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: _documents,
  currentDocument: _currentDocument,
  loading: _loading,
  error: _error,

  fetchDocuments: async (userId: string) => {
    _loading = true
    _error = null
    set({ loading: true, error: null })

    try {
      const documents = await fetchUserDocuments(userId)
      _documents = documents
      set({ documents, loading: false })
    } catch (error) {
      _error = (error as Error).message
      set({ error: (error as Error).message, loading: false })
    } finally {
      _loading = false
    }
  },

  fetchDocument: async (id: string, userId: string) => {
    _loading = true
    _error = null
    set({ loading: true, error: null })

    try {
      const document = await fetchSingleDocument(id, userId)
      _currentDocument = document
      set({ currentDocument: document, loading: false })
    } catch (error) {
      _error = (error as Error).message
      set({ error: (error as Error).message, loading: false })
    } finally {
      _loading = false
    }
  },

  createDocument: async (title: string, content: string, userId: string): Promise<Document> => {
    _loading = true
    _error = null
    set({ loading: true, error: null })

    try {
      const document = await createNewDocument(title, content, userId)
      _documents = [document, ..._documents]
      set({ documents: [document, ..._documents], loading: false })
      return document
    } catch (error) {
      _error = (error as Error).message
      set({ error: (error as Error).message, loading: false })
      throw error
    } finally {
      _loading = false
    }
  },

  updateDocument: async (id: string, updates: Partial<Document>, userId: string) => {
    _loading = true
    _error = null
    set({ loading: true, error: null })

    try {
      await updateExistingDocument(id, updates, userId)
      
      // Update documents list
      _documents = _documents.map(doc => 
        doc.id === id ? { ...doc, ...updates } : doc
      )
      
      // Update current document if it's the one being updated
      if (_currentDocument && _currentDocument.id === id) {
        _currentDocument = { ..._currentDocument, ...updates }
      }
      
      set({ 
        documents: _documents, 
        currentDocument: _currentDocument,
        loading: false 
      })
    } catch (error) {
      _error = (error as Error).message
      set({ error: (error as Error).message, loading: false })
    } finally {
      _loading = false
    }
  },

  deleteDocument: async (id: string, userId: string) => {
    _loading = true
    _error = null
    set({ loading: true, error: null })

    try {
      await removeDocument(id, userId)
      
      // Remove from documents list
      _documents = _documents.filter(doc => doc.id !== id)
      
      // Clear current document if it's the one being deleted
      if (_currentDocument && _currentDocument.id === id) {
        _currentDocument = null
      }
      
      set({ 
        documents: _documents, 
        currentDocument: _currentDocument,
        loading: false 
      })
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
  },

  clearCurrentDocument: () => {
    _currentDocument = null
    set({ currentDocument: null })
  }
})) 