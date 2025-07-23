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