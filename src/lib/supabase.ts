import { createClient } from '@supabase/supabase-js'
import type { Document, User, AuthResponse } from '../types'

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
export function getCurrentUser(): User | null {
  const user = _client.auth.getUser()
  return user ? {
    id: user.id,
    email: user.email!,
    created_at: user.created_at,
    updated_at: user.updated_at || user.created_at
  } : null
} 