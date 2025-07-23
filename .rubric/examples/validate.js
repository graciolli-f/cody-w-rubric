#!/usr/bin/env node
/**
 * Rubric Validation Script
 * Validates code against architectural constraints defined in .rux files
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

class RubricValidator {
  constructor() {
    this.violations = [];
    this.checkedFiles = 0;
  }

  // Parse a .rux file and extract rules
  parseRuxFile(ruxPath) {
    const content = fs.readFileSync(ruxPath, 'utf8');
    const rules = {
      moduleName: '',
      location: '',
      allowedImports: [],
      deniedImports: [],
      deniedOperations: [],
      deniedExports: [],
      fileConstraints: {}
    };

    // Extract module name
    const moduleMatch = content.match(/module\s+(\w+)\s*{/);
    if (moduleMatch) rules.moduleName = moduleMatch[1];

    // Extract location
    const locationMatch = content.match(/location:\s*"([^"]+)"/);
    if (locationMatch) rules.location = locationMatch[1];

    // Extract allowed imports
    const allowMatches = content.matchAll(/allow\s+"([^"]+)"(?:\s+as\s+(?:{[^}]+}|\w+))?/g);
    for (const match of allowMatches) {
      rules.allowedImports.push(match[1]);
    }

    // Extract denied imports
    const denyImportMatches = content.matchAll(/deny\s+imports\s+\["([^"]+)"\]/g);
    for (const match of denyImportMatches) {
      rules.deniedImports.push(match[1]);
    }

    // Extract denied operations
    const denyOpMatches = content.matchAll(/deny\s+([\w.*]+)(?:\s+@|$)/g);
    for (const match of denyOpMatches) {
      const op = match[1];
      if (!op.includes('imports') && !op.includes('exports') && !op.includes('file.')) {
        rules.deniedOperations.push(op);
      }
    }

    // Extract file constraints
    const fileLinesMatch = content.match(/deny\s+file\.lines\s*>\s*(\d+)/);
    if (fileLinesMatch) {
      rules.fileConstraints.maxLines = parseInt(fileLinesMatch[1]);
    }

    return rules;
  }

  // Validate a TypeScript/JavaScript file against rules
  validateFile(filePath, rules) {
    if (!fs.existsSync(filePath)) {
      this.violations.push({
        file: filePath,
        module: rules.moduleName,
        type: 'missing',
        message: 'File specified in .rux does not exist'
      });
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    this.checkedFiles++;

    // Check file constraints
    if (rules.fileConstraints.maxLines && lines.length > rules.fileConstraints.maxLines) {
      this.addViolation(filePath, rules.moduleName, 'file-size', 
        `File has ${lines.length} lines (max: ${rules.fileConstraints.maxLines})`);
    }

    // Check imports
    this.validateImports(filePath, content, rules);

    // Check operations
    this.validateOperations(filePath, content, rules);

    // Check exports
    this.validateExports(filePath, content, rules);
  }

  validateImports(filePath, content, rules) {
    // Find all import statements
    const importRegex = /import\s+(?:{[^}]+}|[\w\s,*]+)\s+from\s+['"]([^'"]+)['"]/g;
    const matches = [...content.matchAll(importRegex)];

    for (const match of matches) {
      const importPath = match[1];
      const lineNum = this.getLineNumber(content, match.index);

      // Check denied imports
      for (const denied of rules.deniedImports) {
        if (this.matchesPattern(importPath, denied)) {
          this.addViolation(filePath, rules.moduleName, 'import',
            `Forbidden import '${importPath}' matches pattern '${denied}'`, lineNum);
        }
      }

      // If there are allowed imports specified, check if this import is allowed
      if (rules.allowedImports.length > 0) {
        const isAllowed = rules.allowedImports.some(allowed => 
          this.matchesPattern(importPath, allowed));
        
        if (!isAllowed) {
          this.addViolation(filePath, rules.moduleName, 'import',
            `Import '${importPath}' is not in allowed list`, lineNum);
        }
      }
    }
  }

  validateOperations(filePath, content, rules) {
    for (const operation of rules.deniedOperations) {
      // Handle different operation types
      if (operation === 'io.console.*') {
        const consoleRegex = /console\.(log|warn|error|info|debug|trace)/g;
        const matches = [...content.matchAll(consoleRegex)];
        for (const match of matches) {
          const lineNum = this.getLineNumber(content, match.index);
          this.addViolation(filePath, rules.moduleName, 'operation',
            `Forbidden console operation: ${match[0]}`, lineNum);
        }
      }

      if (operation === 'io.network.*') {
        const networkPatterns = [
          /fetch\s*\(/g,
          /axios\./g,
          /XMLHttpRequest/g,
          /\.get\s*\(/g,
          /\.post\s*\(/g
        ];
        
        for (const pattern of networkPatterns) {
          const matches = [...content.matchAll(pattern)];
          for (const match of matches) {
            const lineNum = this.getLineNumber(content, match.index);
            this.addViolation(filePath, rules.moduleName, 'operation',
              `Forbidden network operation: ${match[0]}`, lineNum);
          }
        }
      }

      if (operation === 'io.localStorage.*') {
        const storageRegex = /localStorage\.(getItem|setItem|removeItem|clear)/g;
        const matches = [...content.matchAll(storageRegex)];
        for (const match of matches) {
          const lineNum = this.getLineNumber(content, match.index);
          this.addViolation(filePath, rules.moduleName, 'operation',
            `Forbidden localStorage operation: ${match[0]}`, lineNum);
        }
      }
    }
  }

  validateExports(filePath, content, rules) {
    // This is simplified - in production you'd use an AST parser
    const exportRegex = /export\s+(?:const|let|var|function|class)\s+(\w+)/g;
    const matches = [...content.matchAll(exportRegex)];

    for (const match of matches) {
      const exportName = match[1];
      const lineNum = this.getLineNumber(content, match.index);

      // Check if exporting private members
      if (exportName.startsWith('_')) {
        this.addViolation(filePath, rules.moduleName, 'export',
          `Exporting private member: ${exportName}`, lineNum);
      }
    }
  }

  matchesPattern(path, pattern) {
    // Handle wildcards in patterns
    if (pattern.includes('*')) {
      const regexPattern = pattern
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');
      return new RegExp(regexPattern).test(path);
    }
    return path.includes(pattern);
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  addViolation(file, module, type, message, line = null) {
    this.violations.push({
      file: path.relative(process.cwd(), file),
      module,
      type,
      message,
      line
    });
  }

  // Find all .rux files in project
  findRuxFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        this.findRuxFiles(fullPath, files);
      } else if (item.endsWith('.rux')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  // Main validation runner
  async run() {
    console.log(`${colors.blue}🔍 Rubric Validator${colors.reset}`);
    console.log('=' .repeat(50));

    const ruxFiles = this.findRuxFiles(process.cwd());
    console.log(`Found ${ruxFiles.length} .rux files\n`);

    for (const ruxFile of ruxFiles) {
      const rules = this.parseRuxFile(ruxFile);
      if (rules.location) {
        const targetFile = path.join(process.cwd(), rules.location);
        console.log(`Checking ${colors.yellow}${rules.moduleName}${colors.reset} → ${rules.location}`);
        this.validateFile(targetFile, rules);
      }
    }

    console.log('\n' + '='.repeat(50));
    this.printResults();
  }

  printResults() {
    if (this.violations.length === 0) {
      console.log(`${colors.green}✅ All constraints passed!${colors.reset}`);
      console.log(`Validated ${this.checkedFiles} files with 0 violations.`);
      process.exit(0);
    } else {
      console.log(`${colors.red}❌ Found ${this.violations.length} constraint violations:${colors.reset}\n`);
      
      // Group violations by file
      const byFile = {};
      for (const violation of this.violations) {
        if (!byFile[violation.file]) byFile[violation.file] = [];
        byFile[violation.file].push(violation);
      }

      // Print violations
      for (const [file, violations] of Object.entries(byFile)) {
        console.log(`${colors.yellow}${file}:${colors.reset}`);
        for (const v of violations) {
          const lineInfo = v.line ? `:${v.line}` : '';
          console.log(`  ${colors.red}✗${colors.reset} [${v.type}] ${v.message}${lineInfo}`);
        }
        console.log();
      }

      process.exit(1);
    }
  }
}

// Run validator if called directly
if (require.main === module) {
  const validator = new RubricValidator();
  validator.run().catch(err => {
    console.error(`${colors.red}Error:${colors.reset}`, err);
    process.exit(2);
  });
}

module.exports = RubricValidator;