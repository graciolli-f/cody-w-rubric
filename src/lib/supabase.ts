import { createClient } from '@supabase/supabase-js'
import type { Document, User, AuthResponse, DocumentVersion, VersionChangeType } from '../types'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client
const _client = createClient(supabaseUrl, supabaseAnonKey)

// Document cache for performance
const _cache = new Map<string, Document>()

/**
 * Get the Supabase client instance
 */
export const supabase = _client

/**
 * Create a new document
 */
export async function createDocument(
  title: string, 
  content: string, 
  userId: string
): Promise<Document> {
  const { data, error } = await _client
    .from('documents')
    .insert({
      title,
      content,
      user_id: userId,
      permission: 'owner' as const
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  const document = data as Document
  _cache.set(document.id, document)
  
  // Create initial version
  await createDocumentVersion(document.id, title, content, userId, 'created')
  
  return document
}

/**
 * Fetch all documents for a user
 */
export async function fetchDocuments(userId: string): Promise<Document[]> {
  const { data, error } = await _client
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  
  const documents = data as Document[]
  documents.forEach(doc => _cache.set(doc.id, doc))
  return documents
}

/**
 * Fetch a single document by ID
 */
export async function fetchDocument(id: string, userId: string): Promise<Document | null> {
  // Check cache first
  if (_cache.has(id)) {
    return _cache.get(id)!
  }

  const { data, error } = await _client
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // No rows returned
    throw new Error(error.message)
  }
  
  const document = data as Document
  _cache.set(document.id, document)
  return document
}

/**
 * Update a document
 */
export async function updateDocument(
  id: string, 
  updates: Partial<Document>, 
  userId: string
): Promise<void> {
  // Get current document to track changes
  const currentDoc = await fetchDocument(id, userId)
  if (!currentDoc) throw new Error('Document not found')
  
  const { error } = await _client
    .from('documents')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  
  // Update cache
  if (_cache.has(id)) {
    const cached = _cache.get(id)!
    _cache.set(id, { ...cached, ...updates })
  }
  
  // Create version if content or title changed
  const titleChanged = updates.title && updates.title !== currentDoc.title
  const contentChanged = updates.content && updates.content !== currentDoc.content
  
  if (titleChanged || contentChanged) {
    let changeType: VersionChangeType = 'content_modified'
    if (titleChanged && !contentChanged) {
      changeType = 'title_updated'
    }
    
    await createDocumentVersion(
      id,
      updates.title || currentDoc.title,
      updates.content || currentDoc.content,
      userId,
      changeType
    )
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(id: string, userId: string): Promise<void> {
  const { error } = await _client
    .from('documents')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  
  _cache.delete(id)
}

/**
 * Create a document version
 */
export async function createDocumentVersion(
  documentId: string,
  title: string,
  content: string,
  userId: string,
  changeType: VersionChangeType
): Promise<DocumentVersion> {
  // Get user email for version record
  const { data: userData } = await _client.auth.getUser()
  const userEmail = userData.user?.email || 'unknown@example.com'
  
  // Get next version number
  const { data: lastVersion } = await _client
    .from('document_versions')
    .select('version_number')
    .eq('document_id', documentId)
    .order('version_number', { ascending: false })
    .limit(1)
    .single()
  
  const nextVersionNumber = (lastVersion?.version_number || 0) + 1
  
  // Generate change description
  const changeDescription = generateChangeDescription(changeType, title)
  
  const { data, error } = await _client
    .from('document_versions')
    .insert({
      document_id: documentId,
      title,
      content,
      version_number: nextVersionNumber,
      change_description: changeDescription,
      created_by: userId,
      created_by_email: userEmail
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  return data as DocumentVersion
}

/**
 * Fetch document versions
 */
export async function fetchDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
  const { data, error } = await _client
    .from('document_versions')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  
  return data as DocumentVersion[]
}

/**
 * Restore document to a specific version
 */
export async function restoreDocumentVersion(
  documentId: string,
  versionId: string,
  userId: string
): Promise<void> {
  // Get the version to restore
  const { data: version, error: versionError } = await _client
    .from('document_versions')
    .select('*')
    .eq('id', versionId)
    .eq('document_id', documentId)
    .single()

  if (versionError) throw new Error(versionError.message)
  if (!version) throw new Error('Version not found')

  // Update the document
  await updateDocument(documentId, {
    title: version.title,
    content: version.content
  }, userId)
  
  // Create a new version marking this as a restoration
  await createDocumentVersion(
    documentId,
    version.title,
    version.content,
    userId,
    'restored'
  )
}

/**
 * Generate change description based on change type
 */
function generateChangeDescription(changeType: VersionChangeType, title: string): string {
  switch (changeType) {
    case 'created':
      return 'Document created'
    case 'title_updated':
      return 'Title updated'
    case 'content_modified':
      return 'Content modified'
    case 'restored':
      return 'Document restored from version'
    default:
      return 'Document updated'
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const { data, error } = await _client.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return { user: null, error: error.message }
  }

  return { 
    user: data.user ? {
      id: data.user.id,
      email: data.user.email!,
      created_at: data.user.created_at,
      updated_at: data.user.updated_at || data.user.created_at
    } : null
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string): Promise<AuthResponse> {
  const { data, error } = await _client.auth.signUp({
    email,
    password
  })

  if (error) {
    return { user: null, error: error.message }
  }

  return { 
    user: data.user ? {
      id: data.user.id,
      email: data.user.email!,
      created_at: data.user.created_at,
      updated_at: data.user.updated_at || data.user.created_at
    } : null
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  const { error } = await _client.auth.signOut()
  if (error) throw new Error(error.message)
  _cache.clear()
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await _client.auth.getUser()
  return user ? {
    id: user.id,
    email: user.email!,
    created_at: user.created_at,
    updated_at: user.updated_at || user.created_at
  } : null
} 