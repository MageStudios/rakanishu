# SolidJS Control Flow Law

**CRITICAL**: Solid's built-in components are optimized for DOM reconciliation. Standard JS operators like `.map()` or `? :` re-render the entire list/node on every change.

## 1. Lists & Collections
- **ALWAYS** use `<For>` or `<Index>` for rendering arrays.
- **Rule**: Use `<For>` when the data changes (reordering/adding).
- **Rule**: Use `<Index>` when the data is static but values change.
- **Forbidden**: `items.map(item => ...)` inside JSX.

## 2. Conditional Rendering
- **ALWAYS** use `<Show>` for simple `if/else` logic.
- **ALWAYS** use `<Switch>` and `<Match>` for multiple conditions.
- **Rule**: Provide a `fallback` prop to `<Show>` instead of using `null`.
- **Forbidden**: `{condition ? <A/> : <B/>}` or `{condition && <A/>}`.

## 3. Dynamic Components
- Use `<Dynamic>` when the component type itself is a signal/prop.

### ✅ Mandatory Pattern
```typescript
<For each={props.items} fallback={<li>No items</li>}>
  {(item) => <li>{item.name}</li>}
</For>

<Show when={props.isLoggedIn} fallback={<Login />}>
  <Dashboard user={props.user} />
</Show>
\```