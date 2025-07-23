# Version History Feature Setup

## Overview

The version history feature allows users to view, compare, and restore previous versions of their documents. This feature tracks all changes made to documents and provides a comprehensive timeline of modifications.

## Database Schema

### Required Table: `document_versions`

```sql
CREATE TABLE document_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  change_description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_by_email TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX idx_document_versions_created_at ON document_versions(created_at DESC);
CREATE UNIQUE INDEX idx_document_versions_unique_version ON document_versions(document_id, version_number);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- Users can only see versions of documents they own
CREATE POLICY "Users can view document versions they own" ON document_versions
  FOR SELECT USING (
    created_by = auth.uid() OR 
    document_id IN (
      SELECT id FROM documents WHERE user_id = auth.uid()
    )
  );

-- Users can only create versions for documents they own
CREATE POLICY "Users can create versions for their documents" ON document_versions
  FOR INSERT WITH CHECK (
    document_id IN (
      SELECT id FROM documents WHERE user_id = auth.uid()
    )
  );
```

## Features Implemented

### 1. Version History Button
- Added to the DocumentEditorPage header
- Clock icon with "Version History" text
- Opens modal when clicked

### 2. Version History Modal
- **List View**: Shows all document versions grouped by day
- **Preview View**: Full document preview of selected version
- **Responsive Design**: Adapts to different screen sizes

### 3. Version Information Display
- **Relative Time**: "2 hours ago", "3 minutes ago" (updates live)
- **Absolute Time**: "Jan 15, 2024 3:45 PM" for older versions
- **User Attribution**: Shows who made each change
- **Change Description**: Describes what changed ("Title updated", "Content modified", etc.)
- **Content Preview**: First 100 characters of document content

### 4. Day Grouping
- **Today**: Recent changes from today
- **Yesterday**: Changes from yesterday
- **Date Headers**: "January 15, 2024" for older changes

### 5. Version Operations
- **View**: Click any version to see full content
- **Restore**: One-click restoration with confirmation
- **Live Updates**: Relative times update every minute

### 6. Automatic Version Creation
- **Document Creation**: Initial version (v1) created automatically
- **Title Updates**: New version when title changes
- **Content Updates**: New version when content changes
- **Restoration**: New version created when restoring from previous version

## Architecture

### Components Created
- `src/components/VersionHistory.tsx`: Main version history modal component
- `src/lib/time-utils.ts`: Time formatting and date grouping utilities

### Services Updated
- `src/lib/supabase.ts`: Added version CRUD operations
- `src/services/document-service.ts`: Added version history methods
- `src/stores/document-store.ts`: Added version state management

### Types Added
- `DocumentVersion`: Complete version information
- `VersionChangeType`: Enum for change types

### Rubric Constraints
- Created RUX files for architectural compliance
- All constraints pass validation
- Follows clean architecture patterns

## Usage

1. **Viewing Versions**:
   - Click "Version History" button in document editor
   - Browse versions grouped by day
   - Click any version to see full preview

2. **Restoring Versions**:
   - Click "Restore" button on any version
   - Confirm the restoration
   - New version is created with restored content

3. **Version Information**:
   - Hover over relative time to see exact timestamp
   - Version numbers increase sequentially
   - Change descriptions explain what was modified

## Performance Considerations

- **Caching**: Version data is cached in the document store
- **Lazy Loading**: Versions only loaded when modal is opened
- **Efficient Queries**: Database indexes optimize version retrieval
- **Memory Management**: Cache cleared when document changes

## Security

- **User Isolation**: Users can only see versions of their own documents
- **Validation**: All inputs sanitized before storage
- **Authentication**: All operations require valid authentication
- **Authorization**: RLS policies enforce data access rules 