# Quick Reference — Field usage patterns

This short reference explains the two example styles in this package and when to use each.

## Two styles

- **Manual / developer-first (e.g., `app.example.js`)**
  - Use the type-specific hooks exported by the package (e.g., `useTextField`, `useEmailField`, `useTextareaField`).
  - Good when a developer wants to create or customize a single field instance directly in code.
  - Returns ready-to-render components (e.g., `const FirstName = useTextField(config);` → `<FirstName />`).

- **Automated / dynamic (e.g., `usingFieldType.example.js`) — Recommended for loops**
  - Use the generic `useFieldType(config)` hook to get `{ Input, Display }` for a field config object (`{ type, name, ... }`).
  - Ideal for rendering fields from JSON or API-driven schemas in a loop.
  - Pattern: wrap `useFieldType` inside a small per-field component and render that component for each item. This obeys the Rules of Hooks and handles adds/removes/updates safely.

## Key rules & tips

- `useFieldType(config)` requires at minimum `config.type` and `config.name` — it validates and throws on bad input.
- Use stable keys (`key={field.name}` or a stable id) so React preserves identity and avoids unwanted remounts.
- Prefer the per-field wrapper component:
  ```js
  function Field({ config }) {
    const { Input } = useFieldType(config);
    return <Input config={config} />;
  }
  ```
  This keeps hook calls local to each field component and avoids fragile hook ordering in parent maps.

- If you already know the `type` and prefer not to call hooks, helper functions exist: `getFieldTypeInput(type)` and `getFieldTypeDisplay(type)` return the components directly.

## Where to look
- See `docs/app.example.js` — manual usage with specific hooks.
- See `docs/usingFieldType.example.js` — dynamic loop usage and recommended pattern.

---

If you'd like, I can also add a TypeScript variant or a short linter note to prevent accidental hook-order issues.