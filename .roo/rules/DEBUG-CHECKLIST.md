# 🐞 Rakanishu Hunter Checklist

## 1. REACTIVITY AUDIT
- [ ] Search for `const { ... } = props` (Instantly breaks reactivity).
- [ ] Ensure signals are called: `count()` vs `count`.
- [ ] Check `batch()` usage in combat loops to prevent re-render lag.

## 2. LIFESTYLE CHECKS
- [ ] Does `onCleanup()` exist for every `setInterval`?.
- [ ] Are any default Tailwind colors (`bg-gray-500`) sneaking in?.