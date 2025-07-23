# Rubric Developer Guide

## Core Principles

### Modularity Principles to Follow
When designing solutions, evaluate your architecture against these principles:
- **Single Responsibility**: Can you describe each module's purpose in one sentence?
- **Low Coupling**: If you delete a module, how many others break?
- **High Cohesion**: Do all parts of a module work toward the same goal?
- **Dependency Direction**: Do dependencies flow in one direction (high-level → low-level)?

Before integrating modules, ask: "Is module A orchestrating module B, or are they truly independent collaborators?"

### Working with Rubric Constraints

**Important**: Rubric files (.rux) define immutable architectural constraints. They are not suggestions or guidelines to be modified. When you encounter a constraint that seems limiting:

1. **DO NOT** modify the .rux file
2. **DO NOT** try to work around the constraint
3. **DO** create new modules with appropriate boundaries
4. **DO** refactor your approach to fit within constraints
5. **DO** document your approach in a file called [feature]-doc.md

### How to Read Rubric Specifications

```rubric
module ModuleName {
  @ "Natural language description"
  
  location: "src/path/to/module.ts"
  
  interface {
    public methodName(param: Type) -> ReturnType
    public get propertyName() -> Type
  }
  
  state {
    private _variableName: Type
  }
  
  imports {
    allow "package" as external
    allow "../path" as {SpecificImport}
    deny "forbidden-package"
  }
  
  constraints {
    deny io.console.*    @ "No console.log allowed"
    deny io.network.*    @ "No direct API calls"
    deny exports ["_*"]  @ "Don't expose private members"
  }
}
```

### Common Patterns and Solutions

#### When you need to add functionality that violates constraints:

**Wrong**: Modify the constraint
```rubric
// DON'T DO THIS
deny io.network.*  // <-- Don't remove this
```

**Right**: Create a service layer
```typescript
// Create a new module that CAN do network I/O
// Then have your constrained module use that service
```

#### When a component grows too large:

**Wrong**: Increase the line limit
```rubric
// DON'T DO THIS
deny file.lines > 500  // <-- Don't change from 200
```

**Right**: Extract into smaller components
```typescript
// Split into multiple focused components
// Each handling a single responsibility
```

### Understanding Constraint Types

1. **Import Constraints**
   - `deny imports ["../services/*"]` - Cannot import from services
   - `allow "../stores/*" as stores` - Can only import from stores

2. **Operation Constraints**
   - `deny io.console.*` - No console operations
   - `deny io.network.*` - No fetch/API calls
   - `deny io.filesystem.*` - No file operations

3. **Export Constraints**
   - `deny exports ["_*"]` - No private members
   - `deny exports ["*Service"]` - No service instances

4. **File Constraints**
   - `deny file.lines > 200` - Size limits
   - `deny file.complexity > 10` - Complexity limits

### 3. **Usage Instructions**

## How to Use This Guide

1. **Before writing code**: Read the .rux files for modules you'll modify
2. **When facing constraints**: Refer to "Common Patterns and Solutions"
3. **When designing new features**: Apply the Modularity Principles
4. **When validation fails**: Check the specific constraint type and solutions

## Validation Workflow

1. Write code following constraints
2. Run `node validate.js` to check
3. If violations occur, refactor (don't modify constraints)
4. Repeat until validation passes