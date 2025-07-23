# 📁 Rubric Architecture System

This directory contains everything needed to implement and maintain clean architecture using Rubric DSL.

## 📚 Directory Structure

```
.rubric/
├── README.md                    # This file
├── first-prompt.md             # START HERE - Instructions for implementation
│
├── guides/                     # Core documentation
│   ├── developer-guide.md      # Architectural principles
│   ├── how-to-write-rux.md     # Rubric syntax guide
│   ├── how-to-validate.md      # Creating validation scripts
│   └── common-mistakes.md      # What NOT to do
│
├── examples/                   # Complete working examples
│   ├── data-layer/            # Database client examples
│   ├── service-layer/         # Business logic examples
│   ├── store-layer/           # State management examples
│   ├── ui-layer/              # Component examples
│   └── validation/            # Validation script example
│
├── templates/                  # Starting templates
│   └── module.rux.template    # Template for new modules
│
├── constraints/               # YOUR .rux FILES GO HERE
│   ├── data/                 # Data layer constraints
│   ├── services/             # Service layer constraints
│   ├── stores/               # Store layer constraints
│   └── ui/                   # UI layer constraints
│
├── architecture-plan.yaml     # Layer structure and rules
├── architecture-checklist.md  # Implementation checklist
└── success-criteria.md       # How to measure success
```

## 🚀 Quick Start

1. **Read** `first-prompt.md` for step-by-step instructions
2. **Study** the guides to understand Rubric
3. **Review** examples to see patterns
4. **Create** your .rux files in `constraints/`
5. **Generate** your validation script
6. **Build** your application with confidence

## ❓ Key Questions Before Starting

- Have you read all the guides?
- Do you understand why constraints are immutable?
- Have you reviewed the example .rux files?
- Do you know which layer each module belongs in?

## 🎯 Remember

**Architecture First, Code Second**

Create your constraints before writing any implementation code. The constraints guide your architecture, not the other way around.