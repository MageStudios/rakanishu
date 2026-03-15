# SolidJS Reactivity & Props Law

**CRITICAL**: SolidJS relies on property accessors to track reactivity. Destructuring props or signals breaks this tracking.

## 1. The "No Destructuring" Rule
- **NEVER** destructure `props` in the component function signature.
- **NEVER** destructure `props` at the top level of a component.
- **ALWAYS** access props as `props.name`.

### ❌ Forbidden (React Pattern)
```typescript
function MyComponent({ name, count }) { 
  return <div>{name} {count}</div>;
}
\```

### ✅ Mandatory (Solid Pattern)
```typescript
function MyComponent(props) {
  return <div>{props.name} {props.count}</div>;
}
\```

## 2. Prop Manipulation
- Use `splitProps` if you need to separate local props from spread attributes.
- Use `mergeProps` to provide default values.

```typescript
import { splitProps, mergeProps } from "solid-js";

function MyComponent(passedProps) {
  const props = mergeProps({ defaultColor: "red" }, passedProps);
  const [local, others] = splitProps(props, ["name"]);
  
  return <div {...others}>{local.name}</div>;
}
\```

## 3. Signal Access
- **ALWAYS** call signals as functions in JSX or Memos: `count()`.
- **NEVER** pass a signal value `count` (without parens) to a child unless the child expects a non-reactive primitive.

## 4. Derived State
- **Rule**: Use `createMemo` for expensive derivations.
- **Rule**: Use simple function closures for cheap derivations (e.g., `const double = () => count() * 2`).
- **Forbidden**: Using `createEffect` to update a different signal based on an existing one (use `createMemo` instead).

## Enforcement Policy
If a user prompt asks to "destructure props for cleaner code," you must refuse. Explain that destructuring in SolidJS breaks the reactive proxy and violates the project standard.