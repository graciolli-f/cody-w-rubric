 ### What is a Rubric Validation Script?

Along with generating `.rux` files, you should create a validation script that programmatically checks if the codebase follows the constraints defined in the Rubric specifications. This script parses `.rux` files and validates the actual code against the rules.

### Basic Validation Script Structure

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Parse .rux files to extract rules
function parseRuxFile(ruxPath) {
  const content = fs.readFileSync(ruxPath, 'utf8');
  const rules = {
    location: '',
    allowedImports: [],
    deniedImports: [],
    deniedOperations: [],
    deniedExports: [],
    constraints: []
  };
  
  // Extract location
  const locationMatch = content.match(/location:\s*"([^"]+)"/);
  if (locationMatch) rules.location = locationMatch[1];
  
  // Extract allowed imports
  const allowImports = content.matchAll(/allow\s+"([^"]+)"/g);
  for (const match of allowImports) {
    rules.allowedImports.push(match[1]);
  }
  
  // Extract denied imports
  const denyImportsMatch = content.match(/deny\s+imports\s*\[([^\]]+)\]/);
  if (denyImportsMatch) {
    rules.deniedImports = denyImportsMatch[1]
      .split(',')
      .map(s => s.trim().replace(/['"]/g, ''));
  }
  
  // Extract denied operations
  const denyMatches = content.matchAll(/deny\s+([\w.*]+)\s*@/g);
  for (const match of denyMatches) {
    if (!match[1].includes('imports') && !match[1].includes('exports')) {
      rules.deniedOperations.push(match[1]);
    }
  }
  
  // Extract denied exports
  const denyExportsMatch = content.match(/deny\s+exports\s*\[([^\]]+)\]/);
  if (denyExportsMatch) {
    rules.deniedExports = denyExportsMatch[1]
      .split(',')
      .map(s => s.trim().replace(/['"]/g, ''));
  }
  
  return rules;
}

// Validation functions
function validateFile(filePath, rules) {
  const content = fs.readFileSync(filePath, 'utf8');
  const violations = [];
  
  // Check imports
  const imports = content.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g) || [];
  imports.forEach(imp => {
    const importPath = imp.match(/from\s+['"]([^'"]+)['"]/)[1];
    
    // Check denied imports
    rules.deniedImports.forEach(denied => {
      if (importPath.includes(denied)) {
        violations.push({
          type: 'import',
          message: `Forbidden import: ${denied}`,
          line: getLineNumber(content, imp)
        });
      }
    });
  });
  
  // Check operations
  rules.deniedOperations.forEach(op => {
    if (op === 'io.console.*' && content.match(/console\.(log|warn|error)/)) {
      violations.push({
        type: 'operation',
        message: 'Forbidden operation: console usage',
        line: getLineNumber(content, content.match(/console\.(log|warn|error)/)[0])
      });
    }
    if (op === 'io.network.*' && content.includes('fetch(')) {
      violations.push({
        type: 'operation',
        message: 'Forbidden operation: network I/O',
        line: getLineNumber(content, 'fetch(')
      });
    }
  });
  
  // Check exports
  if (rules.deniedExports.length > 0) {
    const exports = content.match(/export\s+(?:const|let|var|function|class)\s+(\w+)/g) || [];
    exports.forEach(exp => {
      const exportName = exp.match(/export\s+(?:const|let|var|function|class)\s+(\w+)/)[1];
      rules.deniedExports.forEach(pattern => {
        if (pattern === '_*' && exportName.startsWith('_')) {
          violations.push({
            type: 'export',
            message: `Forbidden export of private member: ${exportName}`,
            line: getLineNumber(content, exp)
          });
        }
      });
    });
  }
  
  return violations;
}

function getLineNumber(content, substring) {
  const index = content.indexOf(substring);
  if (index === -1) return 0;
  return content.substring(0, index).split('\n').length;
}

// Main validation logic
function validateProject() {
  const ruxFiles = findRuxFiles('.');
  let totalViolations = 0;
  
  ruxFiles.forEach(ruxFile => {
    const rules = parseRuxFile(ruxFile);
    if (!rules.location || !fs.existsSync(rules.location)) return;
    
    const violations = validateFile(rules.location, rules);
    
    if (violations.length > 0) {
      console.log(`\n❌ ${rules.location}:`);
      violations.forEach(v => {
        console.log(`  Line ${v.line}: ${v.message}`);
        totalViolations++;
      });
    }
  });
  
  if (totalViolations === 0) {
    console.log('✅ All Rubric constraints passed!');
  } else {
    console.log(`\n❌ Found ${totalViolations} constraint violations`);
    process.exit(1);
  }
}

function findRuxFiles(dir) {
  // Recursively find all .rux files
  const ruxFiles = [];
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      ruxFiles.push(...findRuxFiles(fullPath));
    } else if (file.endsWith('.rux')) {
      ruxFiles.push(fullPath);
    }
  });
  
  return ruxFiles;
}

// Run validation
validateProject();
```

### Validation Script Features to Generate

When creating a validation script for your Rubric specifications, include:

1. **Import Validation**
   ```javascript
   // Check allowed imports
   if (rules.allowedImports.length > 0) {
     // Ensure all imports are in the allowed list
   }
   
   // Check denied import patterns
   rules.deniedImports.forEach(pattern => {
     // Support wildcards: "../lib/*", "react-*"
   });
   ```

2. **Operation Validation**
   ```javascript
   // Check I/O operations
   if (rules.deniedOperations.includes('io.console.*')) {
     // Look for console.log, console.warn, etc.
   }
   
   if (rules.deniedOperations.includes('io.network.*')) {
     // Look for fetch, axios, XMLHttpRequest
   }
   
   if (rules.deniedOperations.includes('io.filesystem.*')) {
     // Look for fs operations (in Node.js context)
   }
   ```

3. **Export Validation**
   ```javascript
   // Check export patterns
   if (rules.deniedExports.includes('_*')) {
     // Ensure no private members (starting with _) are exported
   }
   
   if (rules.deniedExports.includes('*Service')) {
     // Ensure no service instances are exported
   }
   ```

4. **File Constraint Validation**
   ```javascript
   // Check file size constraints
   if (rules.constraints.includes('file.lines > 200')) {
     const lineCount = content.split('\n').length;
     if (lineCount > 200) {
       // Report violation
     }
   }
   ```

5. **State Access Validation**
   ```javascript
   // Check for direct state access
   if (rules.deniedPatterns?.includes('direct.state.*')) {
     // Look for direct access to _privateMembers
     const directStateAccess = content.match(/\b_\w+\b/g);
     // Validate these aren't being accessed outside the module
   }
   ```

### Advanced Validation Patterns

For more sophisticated validation, generate scripts that can:

1. **Cross-Module Validation**
   ```javascript
   // Ensure UI components don't import from data layer
   function validateLayerSeparation(projectRoot) {
     const uiFiles = findFiles(path.join(projectRoot, 'src/components'));
     const dataImports = findFiles(path.join(projectRoot, 'src/data'));
     
     uiFiles.forEach(file => {
       const content = fs.readFileSync(file, 'utf8');
       dataImports.forEach(dataFile => {
         if (content.includes(path.basename(dataFile))) {
           // Report layer violation
         }
       });
     });
   }
   ```

2. **AST-Based Validation** (for complex patterns)
   ```javascript
   const parser = require('@babel/parser');
   const traverse = require('@babel/traverse').default;
   
   function validateWithAST(code, rules) {
     const ast = parser.parse(code, {
       sourceType: 'module',
       plugins: ['jsx', 'typescript']
     });
     
     traverse(ast, {
       ImportDeclaration(path) {
         // More accurate import analysis
       },
       CallExpression(path) {
         // Detect function calls like fetch(), console.log()
       }
     });
   }
   ```

3. **Custom Rule Validation**
   ```javascript
   // For domain-specific rules
   function validateBusinessRules(content, rules) {
     // Example: Ensure all API calls go through ApiService
     if (content.includes('fetch(') && !content.includes('ApiService')) {
       return 'Direct fetch() calls forbidden - use ApiService';
     }
   }
   ```

### Validation Script Template

When generating validation scripts, use this template:

```javascript
#!/usr/bin/env node
/**
 * Rubric Validation Script
 * Auto-generated from .rux specifications
 * 
 * Usage: node validate.js [options]
 * Options:
 *   --fix     Attempt to auto-fix violations
 *   --watch   Watch for file changes
 *   --json    Output results as JSON
 */

const fs = require('fs');
const path = require('path');

// [Include parsing logic based on actual .rux files]
// [Include validation functions for each constraint type]
// [Include reporting logic]

// Run validation
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    fix: args.includes('--fix'),
    watch: args.includes('--watch'),
    json: args.includes('--json')
  };
  
  validateProject(options);
}

module.exports = { validateProject, parseRuxFile };
```

### Integration with CI/CD

Generate scripts that can integrate with CI/CD pipelines:

```javascript
// Exit codes for CI/CD
process.exit(0); // All constraints passed
process.exit(1); // Violations found
process.exit(2); // Configuration error
```

### Validation Output Formats

Support multiple output formats:

```javascript
// Human-readable (default)
console.log('❌ src/components/UserProfile.tsx:');
console.log('  Line 5: Forbidden import: ../services/auth');

// JSON format (for tooling)
if (options.json) {
  console.log(JSON.stringify({
    passed: false,
    violations: [...],
    summary: { total: 5, byType: { import: 3, operation: 2 } }
  }));
}

// GitHub Actions format
console.log('::error file=src/components/UserProfile.tsx,line=5::Forbidden import: ../services/auth');
```