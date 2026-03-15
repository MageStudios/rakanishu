# SolidJS State Management Law

## 1. Signals vs. Stores
- **Signals**: Use `createSignal` for primitives (string, number, boolean, null).
- **Stores**: Use `createStore` for Objects and Arrays.
- **Rule**: Never wrap an object in a Signal if you need to update a single property; use a Store for fine-grained updates.

## 2. Store Updates
- **ALWAYS** use the path-based setter for stores to preserve reactivity.
- **Rule**: `setStore("user", "name", "New Name")` is preferred over `setStore({ user: { ...state.user, name: "New Name" } })`.

## 3. Local vs. Global
- Keep state as local as possible. 
- Only move state to Context (using `solid-context.md` rules) when more than two levels of components need it.

### ✅ Mandatory Pattern
```typescript
const [user, setUser] = createStore({ id: 1, name: "Dev" });
// Fine-grained update (Correct):
setUser("name", "Senior Dev"); 
\```
