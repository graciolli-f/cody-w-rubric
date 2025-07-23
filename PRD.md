# **PRD: Collaborative Document Editor Web App**

## **Objective**

Build a browser-based real-time collaborative document editor. Multiple users should be able to edit the same document simultaneously, see each other’s cursors/selections, and persist documents to a backend. Basic auth and permission handling should be included.

This PRD will be used by an LLM agent (e.g. in Cursor) to scaffold the project and iteratively develop features.

---

## **Key Features**

### 1. **Real-Time Collaborative Editing**

* Multiple users can edit a document at the same time.
* Changes sync live with low latency (<500ms).
* Show presence indicators (user cursors and selections).
* Use CRDT or OT (Yjs preferred for simplicity with Tiptap/Prosemirror).

### 2. **Authentication & User Management**

* Basic email/password login.
* Use Supabase or Firebase Auth.
* Users can create, own, and share documents.

### 3. **Document CRUD**

* Users can create, rename, delete documents.
* List documents owned or shared with them.
* Each document has a unique URL.
* Store documents in a Postgres DB (via Supabase is fine).

### 4. **Permissions**

* Document owner can invite others via email or shareable link.
* Roles: **Owner**, **Editor**, **Viewer**
* Use row-level security (RLS) if Supabase is used.

### 5. **Text Editor Core**

* Rich-text WYSIWYG editor.
* Features: headings, bold/italic/underline, bullet lists, code blocks, links.
* Use Tiptap or Slate.js.

### 6. **Basic Versioning**

* Auto-save versions every 30 seconds or on major change.
* Allow reverting to previous version (MVP: just snapshot restore).

---

## **Non-Goals (MVP)**

* Offline support.
* Mobile-first optimization.
* AI features.
* Commenting.
* Export to PDF/Markdown.

---

## **Technical Stack**

### **Frontend**

* React + Vite + TypeScript
* Tailwind CSS for styling
* Zustand or other minimal global state

### **Editor**

* Tiptap + Yjs for real-time sync

### **Backend**

* Supabase (Postgres, Auth, RLS)
* Supabase Realtime for sync presence
* Alternatively: Node.js + WebSocket server if needed

### **Hosting**

* Vercel or Netlify for frontend
* Supabase or Render for backend

---

## **Design Constraints**

* Simple, minimal UI (inspired by Notion/Dropbox Paper)
* Codebase must be modular and extensible
* Must be installable as a PWA (optional, stretch goal)

---

## **Development Phases (suggested)**

### **Phase 1: Core Editor**

* [ ] Basic editable doc
* [ ] Auth flow
* [ ] Document list page
* [ ] Save/load doc content

### **Phase 2: Collaboration**

* [ ] Real-time sync via Yjs
* [ ] Multi-user cursors
* [ ] Presence indicators

### **Phase 3: Permissions + Sharing**

* [ ] Invite users by email
* [ ] Viewer/editor roles
* [ ] Document access controls

### **Phase 4: Versioning**

* [ ] Save historical snapshots
* [ ] Restore from snapshot

---

## **Naming / URLs / Routing**

* `/docs/:id` – main editor page
* `/dashboard` – list of documents
* `/login`, `/signup` – auth routes

---

