import { 
  fetchDocuments as supabaseFetchDocuments,
  fetchDocument as supabaseFetchDocument,
  createDocument as supabaseCreateDocument,
  updateDocument as supabaseUpdateDocument,
  deleteDocument as supabaseDeleteDocument,
  fetchDocumentVersions as supabaseFetchDocumentVersions,
  restoreDocumentVersion as supabaseRestoreDocumentVersion
} from '../lib/supabase'
import type { Document, DocumentVersion } from '../types'

// Private state
const _cache = new Map<string, Document>()
const _versionCache = new Map<string, DocumentVersion[]>()
let _lastFetch = 0

/**
 * Fetch all documents for a user
 */
export async function fetchUserDocuments(userId: string): Promise<Document[]> {
  try {
    const documents = await supabaseFetchDocuments(userId)
    documents.forEach(doc => _cache.set(doc.id, doc))
    _lastFetch = Date.now()
    return documents
  } catch (error) {
    throw new Error(`Failed to fetch documents: ${(error as Error).message}`)
  }
}

/**
 * Fetch a single document by ID
 */
export async function fetchDocument(id: string, userId: string): Promise<Document | null> {
  try {
    // Check cache first if recently fetched
    if (_cache.has(id) && Date.now() - _lastFetch < 30000) {
      return _cache.get(id)!
    }

    const document = await supabaseFetchDocument(id, userId)
    if (document) {
      _cache.set(document.id, document)
    }
    return document
  } catch (error) {
    throw new Error(`Failed to fetch document: ${(error as Error).message}`)
  }
}

/**
 * Create a new document
 */
export async function createDocument(title: string, content: string, userId: string): Promise<Document> {
  try {
    const sanitizedTitle = sanitizeTitle(title)
    const sanitizedContent = sanitizeContent(content)
    
    const document = await supabaseCreateDocument(sanitizedTitle, sanitizedContent, userId)
    _cache.set(document.id, document)
    return document
  } catch (error) {
    throw new Error(`Failed to create document: ${(error as Error).message}`)
  }
}

/**
 * Update a document
 */
export async function updateDocument(id: string, updates: Partial<Document>, userId: string): Promise<void> {
  try {
    const sanitizedUpdates = {
      ...updates,
      title: updates.title ? sanitizeTitle(updates.title) : undefined,
      content: updates.content ? sanitizeContent(updates.content) : undefined
    }
    
    await supabaseUpdateDocument(id, sanitizedUpdates, userId)
    
    // Update cache
    if (_cache.has(id)) {
      const cached = _cache.get(id)!
      const updatedDoc = { ...cached }
      if (sanitizedUpdates.title !== undefined) updatedDoc.title = sanitizedUpdates.title
      if (sanitizedUpdates.content !== undefined) updatedDoc.content = sanitizedUpdates.content
      _cache.set(id, updatedDoc)
    }
    
    // Clear version cache for this document to force refresh
    _versionCache.delete(id)
  } catch (error) {
    throw new Error(`Failed to update document: ${(error as Error).message}`)
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(id: string, userId: string): Promise<void> {
  try {
    await supabaseDeleteDocument(id, userId)
    _cache.delete(id)
    _versionCache.delete(id)
  } catch (error) {
    throw new Error(`Failed to delete document: ${(error as Error).message}`)
  }
}

/**
 * Fetch all versions for a document
 */
export async function fetchDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
  try {
    // Check cache first
    if (_versionCache.has(documentId)) {
      return _versionCache.get(documentId)!
    }
    
    const versions = await supabaseFetchDocumentVersions(documentId)
    _versionCache.set(documentId, versions)
    return versions
  } catch (error) {
    throw new Error(`Failed to fetch document versions: ${(error as Error).message}`)
  }
}

/**
 * Restore a document to a specific version
 */
export async function restoreDocumentVersion(
  documentId: string, 
  versionId: string, 
  userId: string
): Promise<void> {
  try {
    await supabaseRestoreDocumentVersion(documentId, versionId, userId)
    
    // Clear caches to force refresh
    _cache.delete(documentId)
    _versionCache.delete(documentId)
  } catch (error) {
    throw new Error(`Failed to restore document version: ${(error as Error).message}`)
  }
}

/**
 * Validate document access (simplified for MVP)
 */
export async function validateDocumentAccess(documentId: string, userId: string): Promise<boolean> {
  try {
    const document = await fetchDocument(documentId, userId)
    return document !== null && document.user_id === userId
  } catch (error) {
    return false
  }
}

/**
 * Sanitize document content
 */
export function sanitizeContent(content: string): string {
  // Basic sanitization - remove script tags and dangerous attributes
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .trim()
}

/**
 * Sanitize document title
 */
function sanitizeTitle(title: string): string {
  return title
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 100) // Limit title length
} 