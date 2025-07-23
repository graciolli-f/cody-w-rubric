import type { DocumentVersion } from '../types'

/**
 * Format a date as relative time (e.g., "2 hours ago", "3 minutes ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const diffInMs = now.getTime() - targetDate.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) {
    return 'Just now'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
  } else {
    return formatAbsoluteTime(targetDate)
  }
}

/**
 * Format a date as absolute time (e.g., "Jan 15, 2024 3:45 PM")
 */
export function formatAbsoluteTime(date: string | Date): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  return targetDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Group document versions by day with descriptive headers
 */
export function groupVersionsByDay(versions: DocumentVersion[]): Map<string, DocumentVersion[]> {
  const groups = new Map<string, DocumentVersion[]>()
  
  for (const version of versions) {
    const date = new Date(version.created_at)
    let groupKey: string
    
    if (isToday(date)) {
      groupKey = 'Today'
    } else if (isYesterday(date)) {
      groupKey = 'Yesterday'
    } else {
      groupKey = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    }
    
    if (!groups.has(groupKey)) {
      groups.set(groupKey, [])
    }
    groups.get(groupKey)!.push(version)
  }
  
  return groups
}

/**
 * Check if a date is today
 */
export function isToday(date: string | Date): boolean {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  
  return targetDate.getDate() === today.getDate() &&
         targetDate.getMonth() === today.getMonth() &&
         targetDate.getFullYear() === today.getFullYear()
}

/**
 * Check if a date is yesterday
 */
export function isYesterday(date: string | Date): boolean {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  
  return targetDate.getDate() === yesterday.getDate() &&
         targetDate.getMonth() === yesterday.getMonth() &&
         targetDate.getFullYear() === yesterday.getFullYear()
} 