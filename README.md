# Collaborative Document Editor

A real-time collaborative document editor built with React, TypeScript, Vite, Tailwind CSS, and Supabase. This project implements Phase 1 of the PRD with a clean architecture using the Rubric DSL system.

## 🏗️ Architecture

This project follows a strict 4-layer architecture enforced by Rubric constraints:

```
📁 Data Layer    → Direct Supabase interaction
📁 Service Layer → Business logic and validation
📁 Store Layer   → State management with Zustand
📁 UI Layer      → React components and pages
```

### Key Features Implemented (Phase 1)

- ✅ **Authentication**: Email/password login and signup
- ✅ **Document CRUD**: Create, read, update, delete documents
- ✅ **Rich Text Editor**: Tiptap-based WYSIWYG editor
- ✅ **Auto-save**: Documents save automatically while typing
- ✅ **Responsive UI**: Clean, minimal design with Tailwind CSS
- ✅ **Error Handling**: Comprehensive error states and loading feedback
- ✅ **Routing**: Protected routes with authentication guards

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Supabase account and project

### 1. Clone and Install

```bash
git clone <repository-url>
cd collaborative-document-editor
npm install
```

### 2. Set up Supabase

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create the documents table:

```sql
-- Create documents table
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Untitled Document',
  content TEXT DEFAULT '',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT DEFAULT 'owner',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_documents_updated_at 
  BEFORE UPDATE ON documents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);
```

### 3. Configure Environment

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🧪 Architecture Validation

This project uses a custom Rubric DSL system to enforce clean architecture. To validate architectural constraints:

```bash
npm run validate
```

This will check that:
- UI components don't make direct API calls
- Services don't import React
- Data layer is the only module accessing Supabase
- File size and complexity limits are respected

## 📁 Project Structure

```
src/
├── lib/                    # Data layer
│   └── supabase.ts        # Supabase client (only DB access point)
├── services/              # Service layer
│   ├── auth-service.ts    # Authentication business logic
│   └── document-service.ts # Document business logic
├── stores/                # Store layer
│   ├── auth-store.ts      # Authentication state
│   └── document-store.ts  # Document state
├── components/            # UI layer - Reusable components
│   ├── AuthForm.tsx
│   ├── DocumentEditor.tsx
│   ├── DocumentList.tsx
│   └── ...
├── pages/                 # UI layer - Page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   └── DocumentEditorPage.tsx
├── types/                 # Shared TypeScript types
│   └── index.ts
└── App.tsx                # Main app with routing
```

## 🎯 Usage

### Authentication
1. Visit `/signup` to create an account
2. Or `/login` to sign in with existing credentials
3. Password must be 6+ characters with uppercase and lowercase letters

### Document Management
1. After login, you'll see the dashboard with your documents
2. Click "New Document" to create a document
3. Click on any document to edit it
4. Use the rich text editor toolbar for formatting
5. Documents auto-save as you type

### Rich Text Features
- **Bold**, *Italic*, Underline formatting
- Headings (H1, H2, H3)
- Bullet lists
- Code blocks
- Auto-save after 2 seconds of inactivity

## 🔧 Development Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production  
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run validate   # Validate architecture constraints
```

## 🏛️ Architectural Principles

This project demonstrates:

1. **Single Responsibility**: Each module has one clear purpose
2. **Dependency Direction**: Data → Service → Store → UI (unidirectional)
3. **Interface Segregation**: Clean APIs between layers
4. **No Circular Dependencies**: Enforced by Rubric constraints
5. **Framework Agnostic Services**: Business logic independent of React

## 🚧 Phase 2 Plans

The next phase will add:
- Real-time collaboration with Yjs
- Multi-user cursors and presence
- Document sharing and permissions
- Version history

## 📜 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Follow the existing Rubric architecture patterns
2. Run `npm run validate` before committing
3. Keep components under 200 lines per Rubric constraints
4. Maintain separation of concerns between layers 