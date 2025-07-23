 # 🏗️ Your Mission: Build with Rubric Constraints

You are about to build a well-architected application using Rubric DSL to enforce clean architectural boundaries from the very first line of code.

## 📚 Required Reading (In Order)

1. **Start Here**: `.rubric/guides/developer-guide.md`
   - Understand the core principles of modular architecture
   - Learn why constraints are immutable
   
2. **Learn Rubric**: `.rubric/guides/how-to-write-rux.md`
   - Master the Rubric syntax
   - Understand each constraint type
   
3. **Validation**: `.rubric/guides/how-to-validate.md`
   - Learn how to create validation scripts
   - Understand what the validator checks

4. **Avoid Pitfalls**: `.rubric/guides/common-mistakes.md`
   - See what NOT to do
   - Learn from common anti-patterns

5. **Examples**: Review ALL files in `.rubric/examples/`
   - See complete, working patterns
   - Understand how layers interact

## 🎯 Your Tasks (MUST Follow This Order)

### Phase 1: Architecture Setup
1. Create a yaml file with the directory structure `architecture-plan.yaml`
2. Create the directory tree in the root following the `architecture-plan.yaml`
3. Create `src/types/index.ts` for shared types
4. Create `src/config/environment.ts` for configuration

### Phase 2: Generate Rubric Specifications
Create .rux files in `.rubric/constraints/` for your modules:

1. **Data Layer** (`src/data/`)
   - Define constraints for database clients
   - Ensure no business logic allowed
   
2. **Service Layer** (`src/services/`)
   - Create specifications for each service
   - Enforce business logic isolation
   
3. **Store Layer** (`src/stores/`)
   - Define Zustand store constraints
   - Ensure stores only call services
   
4. **UI Layer** (`src/components/` and `src/pages/`)
   - Create base component constraints
   - Enforce pure presentation logic

### Phase 3: Generate Validation
1. Create `validate.js` in the project root
2. Base it on `.rubric/examples/validation/validate.js`
3. Ensure it can parse all your .rux files
4. Test it runs without errors

### Phase 4: Verify Setup
1. Run `node validate.js` - should pass (no files exist yet)
2. Create one empty file per layer
3. Run validation again - ensure constraints are enforced
4. Only proceed if validation is working correctly

### Phase 5: Begin Implementation
NOW you can start building features, but:
- Always create/update .rux files BEFORE writing code
- Run validation after every file creation
- NEVER modify constraints to make code work
- Adapt your code to fit within constraints

## 🚦 Critical Rules

### DO:
- ✅ Read all guide files thoroughly first
- ✅ Create .rux files before implementing
- ✅ Run validation frequently
- ✅ Refactor code to fit constraints
- ✅ Create new modules when needed

### DON'T:
- ❌ Skip the reading phase
- ❌ Write code before .rux files
- ❌ Modify .rux files to make code work
- ❌ Ignore validation errors
- ❌ Create "temporary" workarounds

## 🏛️ Architecture Principles

Remember the flow: UI → Stores → Services → Data

- **UI**: Only presentation and user interaction
- **Stores**: State management and coordination
- **Services**: Business logic and rules
- **Data**: External system integration

Each layer has a single responsibility. When in doubt, ask:
- "What layer does this belong in?"
- "Am I mixing concerns?"
- "Can I test this in isolation?"

## 📋 Pre-Implementation Checklist

Before writing ANY application code:
- [ ] All directories created
- [ ] All .rux files written
- [ ] validate.js generated and tested
- [ ] Validation passes on empty project
- [ ] You understand why each constraint exists

## 🎉 Success Criteria

You'll know you've succeeded when:
TODO: make this a symbolic validation?
1. Every file has a corresponding .rux specification
2. `node validate.js` passes with zero violations
3. Features can be added without modifying constraints
4. The architecture is clean and predictable
5. Any developer could understand the structure immediately

## 💡 Remember

**Constraints are your friends.** They're not obstacles to work around, but guardrails that ensure your code remains maintainable, testable, and scalable. When you feel limited by a constraint, you're probably trying to put code in the wrong layer.

---

*Start by reading the guides, then create your .rux files, then validate, and only then write code.*