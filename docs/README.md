# Documentation Overview

This folder contains comprehensive documentation for building the Postman-like web application.

## 📚 Documentation Files

### 1. **plan.md** - Master Project Plan
- **Purpose**: Overall project specification and architecture
- **Contents**: 
  - Tech stack (TanStack Start, TanStack Query, Zod, Bun, Shadcn UI)
  - Core requirements and MVP features
  - UI layout design (three-column layout)
  - Data models (Request, Response, Collection)
  - State management architecture (Zustand + TanStack Query)
  - Development phases and timeline
  - Validation patterns with Zod
- **References**: components-mapping.md, development-guide.md

### 2. **tasks.md** - Development Task Breakdown
- **Purpose**: Detailed task list for implementation
- **Contents**:
  - 5 development phases with 25+ specific tasks
  - Priority levels (High/Medium/Low)
  - Dependencies between tasks
  - Estimated timeline (12-17 days total)
  - Testing strategy
  - Validation requirements for each task
- **References**: components-mapping.md, development-guide.md

### 3. **components-mapping.md** - UI Components Specification
- **Purpose**: Detailed mapping of application components to Shadcn UI with @base-ui/react primitives
- **Contents**:
  - Complete file hierarchy structure
  - Component specifications (styles, interactions, Shadcn mapping)
  - Required Shadcn components list
  - @base-ui/react primitive dependencies (single package with subpaths)
  - Custom component extensions
  - Styling patterns and accessibility features
  - Validation integration points
- **References**: plan.md, development-guide.md

### 4. **state-management.md** - State Architecture
- **Purpose**: Detailed state management implementation
- **Contents**:
  - Zustand store for client state
  - TanStack Query for server state
  - Selectors and custom hooks
  - Performance optimizations
  - Error handling patterns
  - Validation integration with Zod
- **References**: development-guide.md

### 5. **development-guide.md** - Implementation Guide
- **Purpose**: Step-by-step development instructions
- **Contents**:
  - Setup instructions with Bun
  - Dependency management
  - File structure and coding standards
  - Validation patterns with Zod
  - Testing and debugging strategies
  - Deployment instructions
- **References**: All other documents

### 6. **ui-components.md** - Original UI Specifications
- **Purpose**: Original component hierarchy and specifications
- **Contents**:
  - Component hierarchy tree
  - Component props and interfaces
  - Design system specifications
  - Responsive design guidelines
- **Status**: Superseded by components-mapping.md but kept for reference

## 🔄 Document Relationships

```
plan.md (Master Plan)
├── References: components-mapping.md
├── References: development-guide.md
└── Provides: Validation patterns

tasks.md (Implementation Tasks)
├── References: components-mapping.md
├── References: development-guide.md
└── Provides: Task-specific validation requirements

components-mapping.md (UI Specs)
├── Depends on: plan.md
├── Implements: Shadcn UI with @base-ui/react primitives
└── Provides: Component validation integration points

state-management.md (State Architecture)
├── Uses: development-guide.md validation patterns
└── Implements: TanStack Query + Zustand

development-guide.md (Setup Guide)
├── References: All documents
├── Provides: Validation patterns and examples
└── Provides: Setup instructions

ui-components.md (Reference)
└── Provides: Original component hierarchy
```

## 🎯 Tech Stack Summary

| Technology | Purpose | Documentation |
|------------|---------|---------------|
| **TanStack Start** | Framework | plan.md, development-guide.md |
| **TanStack Query** | Async State | state-management.md, plan.md |
| **Zustand** | Client State | state-management.md |
| **Zod** | Validation | development-guide.md, plan.md, tasks.md |
| **Shadcn UI** | Components | components-mapping.md |
| **BaseUI** | Primitives (@base-ui/react - single package with subpaths) | development-guide.md |
| **Bun** | Runtime | development-guide.md, plan.md |
| **TailwindCSS** | Styling | components-mapping.md |
| **TypeScript** | Types | All documents |

## 🚀 Getting Started

1. **Read First**: `plan.md` - Understand the overall architecture
2. **Setup**: `development-guide.md` - Install dependencies and configure environment
3. **Components**: `components-mapping.md` - Understand UI component structure
4. **State**: `state-management.md` - Implement state management
5. **Validation**: `development-guide.md` - Learn validation patterns
6. **Tasks**: `tasks.md` - Follow the development task list

## 📋 Development Workflow

1. **Phase 1**: Project setup and basic layout
2. **Phase 2**: Request building features
3. **Phase 3**: Response display features
4. **Phase 4**: Organization and persistence
5. **Phase 5**: Polish and UX improvements

Each phase corresponds to sections in `tasks.md` with detailed implementation steps.

## 🔍 Quick Reference

- **Dependencies**: See `development-guide.md` → "Dependency Management"
- **File Structure**: See `plan.md` → "File Structure"
- **Component List**: See `components-mapping.md` → "File Hierarchy"
- **Validation Rules**: See `development-guide.md` → "Validation Patterns"
- **State Patterns**: See `state-management.md` → "Store Implementation"

## 📝 Notes

- All documentation is kept in sync with the latest tech stack decisions
- References between documents are maintained and updated
- Components mapping uses simple text format as requested
- Code examples are provided in development-guide.md and state-management.md
- Validation schemas are comprehensive and ready for implementation

## 🔄 Last Updated

- **plan.md**: Updated with TanStack Query, Zod, Bun integration, @base-ui/react primitives (single package), validation patterns
- **tasks.md**: Updated with new tech stack references, validation requirements, and new reference style
- **components-mapping.md**: Created with detailed component specifications, @base-ui/react integration (single package with subpaths), and validation integration
- **state-management.md**: Updated with TanStack Query patterns and Zod integration
- **development-guide.md**: Updated for Bun runtime, @base-ui/react dependencies (single package), and comprehensive validation patterns
- **README.md**: Updated to reflect new documentation structure, @base-ui/react integration (single package with subpaths), and proper interlinking

All documentation files are now synchronized, properly interlinked, and ready for development to begin.
