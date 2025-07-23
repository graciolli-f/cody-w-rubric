import type { User as SupabaseUser } from '@supabase/supabase-js'

/**
 * Application user type extending Supabase user
 */
export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

/**
 * Document type for collaborative editing
 */
export interface Document {
  id: string
  title: string
  content: string
  user_id: string
  created_at: string
  updated_at: string
  permission: DocumentPermission
}

/**
 * Document version type for version history
 */
export interface DocumentVersion {
  id: string
  document_id: string
  title: string
  content: string
  version_number: number
  change_description: string
  created_at: string
  created_by: string
  created_by_email: string
}

/**
 * Version change types for describing what changed
 */
export type VersionChangeType = 'created' | 'title_updated' | 'content_modified' | 'restored'

/**
 * Authentication response from Supabase
 */
export interface AuthResponse {
  user: User | null
  error?: string
}

/**
 * Document permission levels
 */
export type DocumentPermission = 'owner' | 'editor' | 'viewer'

/**
 * Document creation input
 */
export interface CreateDocumentInput {
  title: string
  content: string
} 