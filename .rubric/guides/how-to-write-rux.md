 ## Rubric Generation Instructions for LLMs

### What is a Rubric (.rux) File?

Rubric files define architectural constraints and boundaries for software modules. They specify:
- What a module can and cannot do
- What it can import
- What it must export
- Private vs public members
- Operational constraints (no console.log, no network calls, etc.)

### Basic Rubric Syntax

```rubric
module ModuleName {
  @ "Natural language description of the module's purpose.
  @ Additional context for developers and AI agents."
  
  location: "src/path/to/file.ts"
  
  interface {
    @ "Public API - what other modules can use"
    public methodName(param: Type) -> ReturnType
    public get propertyName() -> Type
  }
  
  state {
    @ "Private state - internal implementation details"
    private _variableName: Type
  }
  
  imports {
    allow "package-name" as external
    allow "../relative/path" as {SpecificImport}
    deny "forbidden-package"
  }
  
  constraints {
    deny io.console.*     @ "Explanation why"
    deny io.network.*     @ "No direct API calls"
    deny exports ["_*"]   @ "Don't expose private members"
  }
}
```

### Type Notation in Rubric

- Basic types: `string`, `number`, `boolean`, `void`
- Arrays: `Type[]`
- Nullable: `Type?`
- Maps: `Map<KeyType, ValueType>`
- Promises: `Promise<Type>`
- Custom types: Use the actual type name (e.g., `Document`, `User`)

### Examples for Common Patterns

#### Example 1: Service Module
```rubric
module DocumentService {
  @ "Handles all document-related API operations.
  @ This is the only module that should interact with the documents table."
  
  location: "src/services/document-service.ts"
  
  interface {
    public fetchAll() -> Promise<Document[]>
    public fetchById(id: string) -> Promise<Document?>
    public create(title: string, content: string) -> Promise<Document>
    public update(id: string, updates: Partial<Document>) -> Promise<void>
    public delete(id: string) -> Promise<void>
  }
  
  state {
    private _cache: Map<string, Document>
  }
  
  imports {
    allow "../lib/supabase" as {supabase}
    allow "../types" as {Document}
  }
  
  constraints {
    deny imports ["react", "vue", "@angular"]  @ "Services are framework-agnostic"
    deny exports ["supabase", "_cache"]        @ "Don't leak implementation details"
  }
}
```

#### Example 2: React Component Module
```rubric
module DocumentEditor {
  @ "Rich text editor component for documents.
  @ Should remain pure UI - no business logic or API calls."
  
  location: "src/components/DocumentEditor.tsx"
  
  interface {
    public DocumentEditor(props: {
      content: string,
      onChange: (content: string) -> void,
      editable?: boolean
    }) -> JSX.Element
  }
  
  imports {
    allow "react" as external
    allow "@tiptap/react" as external
    allow "./DocumentToolbar" as {DocumentToolbar}
  }
  
  constraints {
    deny io.network.*              @ "Components should not make API calls"
    deny imports ["../services/*"] @ "Components should not know about services"
    deny file.lines > 200          @ "Keep components focused and small"
  }
}
```

#### Example 3: Store Module (Zustand)
```rubric
module AuthStore {
  @ "Global authentication state management.
  @ Coordinates between AuthService and UI components."
  
  location: "src/stores/auth-store.ts"
  
  interface {
    public useAuthStore() -> {
      user: User?,
      loading: boolean,
      signIn: (email: string, password: string) -> Promise<void>,
      signOut: () -> Promise<void>
    }
  }
  
  state {
    private _user: User?
    private _loading: boolean
  }
  
  imports {
    allow "zustand" as external
    allow "../services/auth" as {AuthService}
    allow "../types" as {User}
  }
  
  constraints {
    deny io.network.*           @ "Use AuthService for API calls"
    deny imports ["../lib/supabase"] @ "Don't bypass service layer"
    deny exports ["_*"]         @ "Keep state private"
  }
}
```

### Common Constraint Patterns

#### I/O Constraints
```rubric
deny io.console.*    @ "No console logging in production code"
deny io.network.*    @ "No direct network calls"
deny io.filesystem.* @ "No file system access"
deny io.process.*    @ "No process manipulation"
```

#### Import Constraints
```rubric
deny imports.*               @ "No dependencies allowed"
deny imports ["../lib/*"]    @ "Don't access lib directly"
allow imports ["react", "react-dom"] as external
```

#### Export Constraints
```rubric
deny exports ["_*"]          @ "No private members"
deny exports ["*Service"]    @ "Don't export service instances"
```

#### File Constraints
```rubric
deny file.lines > 300        @ "Keep files manageable"
deny file.size > 10KB        @ "File too large"
```

### Guidelines for Generating Rubric Specs

1. **Start with Clear Boundaries**
   - Identify layers: UI, Business Logic, Data Access, Shared Utilities
   - Each layer has different constraints

2. **Be Specific About Imports**
   - List allowed imports explicitly
   - Use `deny imports.*` for pure functions
   - Always explain why with `@` comments

3. **Define Clear Interfaces**
   - Only expose what other modules need
   - Use TypeScript-like syntax for clarity
   - Keep interfaces minimal

4. **Add Helpful Descriptions**
   - Every module needs an `@` description
   - Every constraint needs an `@` explanation
   - Guide developers toward correct patterns

5. **Consider Evolution**
   - Start with strict constraints
   - Can relax them as patterns emerge
   - But never remove safety constraints

### Example: Generating Rubric for a New Feature

**Given**: "Add user profile management"

**Generate these `.rux` files**:

```rubric
module ProfileService {
  @ "Manages user profile data and operations.
  @ Single source of truth for profile-related API calls."
  
  location: "src/services/profile-service.ts"
  
  interface {
    public fetchProfile(userId: string) -> Promise<Profile?>
    public updateProfile(userId: string, updates: Partial<Profile>) -> Promise<void>
    public uploadAvatar(userId: string, file: File) -> Promise<string>
  }
  
  imports {
    allow "../lib/supabase" as {supabase}
    allow "../lib/storage" as {storage}
    allow "../types" as {Profile}
  }
  
  constraints {
    deny imports ["react", "../components/*", "../pages/*"]
    deny exports ["supabase", "storage"]
  }
}

module ProfileView {
  @ "UI component for displaying and editing user profiles.
  @ Should use ProfileStore for all data operations."
  
  location: "src/pages/ProfilePage.tsx"
  
  interface {
    public ProfilePage() -> JSX.Element
  }
  
  imports {
    allow "react" as external
    allow "../stores/profile-store" as {useProfileStore}
    allow "../components/Avatar" as {Avatar}
    allow "../components/ProfileForm" as {ProfileForm}
  }
  
  constraints {
    deny imports ["../services/*"]  @ "Use store layer instead"
    deny imports ["../lib/*"]       @ "No direct library access"
    deny io.network.*               @ "No API calls from components"
  }
}
```

### Validation Checklist

When generating a `.rux` file, ensure:
- [ ] Module name matches the concept it represents
- [ ] Location path is correct and complete
- [ ] Interface only exposes public API
- [ ] State members are marked private with `_` prefix
- [ ] Imports are minimal and specific
- [ ] Constraints have explanatory `@` comments
- [ ] File follows the layer's typical constraints

This instruction set should enable the LLM to generate valid, useful Rubric specifications that enforce clean architecture from the start.