# SolidJS Async & Data Law

## 1. Data Fetching
- **ALWAYS** use `createResource` for async data fetching.
- **Rule**: Handle `.loading`, `.error`, and `.latest` properties in the UI.
- **Forbidden**: Managing loading/data/error signals manually with `createEffect`.

## 2. Transitions & Suspense
- Wrap resource-heavy components in `<Suspense>` or `<Transition>`.
- **Rule**: Use the `fallback` prop of `<Suspense>` for loading indicators.

### ✅ Mandatory Pattern
```typescript
const [data] = createResource(fetchUser);

return (
  <Suspense fallback={<p>Loading...</p>}>
    <div>{data().name}</div>
  </Suspense>
);
\```
