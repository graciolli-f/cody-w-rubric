Before we start coding, let's establish clean architecture using Rubric specifications.

See .rubric/instructions/how-to-rux.md 
See .rubric/how-to-validate.md
See .rubric/rubric-developer-guide.md

Generate Rubric (.rux) files for these architectural layers:
1. Data layer - Only module that talks to Supabase
2. Service layer - Business logic and operations
3. Store layer - State management with Zustand
4. UI layer - React components and pages

Each layer should have clear boundaries. UI cannot directly access data layer. All database operations must go through services. Components should remain pure UI without business logic.

After creating the .rux files, also generate a validate.js script that can check if code follows these constraints.