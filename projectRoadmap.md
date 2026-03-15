```markdown
# Project Roadmap & Context

## High-Level Vision
Integrating robust, type-safe state management across the application using SolidJS primitives.

## Technical Stack
- **Framework**: SolidJS
- **State Management**: Context API + Stores
- **Patterns**: Following `solidjs-context-llms` standards.

## Current Focus
- [ ] Refactoring legacy prop-drilled components to use Context Providers.
- [ ] Implementing a global `AuthContext` using the encapsulated provider pattern.
- [ ] Optimizing reactive scopes to prevent unnecessary sub-tree re-renders.

## Key Directories
- `src/context/`: Contains all context definitions following the `solid-context.md` rules.
- `src/components/`: Consumer components that must use custom hooks to access state.
