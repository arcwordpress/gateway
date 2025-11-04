# Field Registry Improvements - Instructions for Claude Code

Review the current `fieldRegistry.js` and make these changes:

## 1. Fix `initializeFields()` async issue

**Problem:** The dynamic `import().then()` pattern is async but not awaited, which can cause race conditions.

**Solution:**
- Move `initializeFields()` to a separate `fields/index.js` file
- Use static imports instead of dynamic imports
- Import `relationFieldDefinition` at the top of the file
- Call `registerField(relationFieldDefinition)` directly in the function
- Add commented placeholders showing how to add future field types

**Example:**
```javascript
// fields/index.js
import { registerField } from '../fieldRegistry';
import { relationFieldDefinition } from './field-types/RelationField';

export const initializeFields = () => {
  registerField(relationFieldDefinition);
  // registerField(textFieldDefinition);
  // registerField(imageFieldDefinition);
};
```

## 2. Improve error handling in `useField()`

**Problem:** Currently warns to console and returns `null`, which can cause crashes downstream.

**Solution:**
- Replace `console.warn()` + `return null` with `throw new Error()`
- Include list of available field types in the error message to help debugging
- Use `getRegisteredFieldTypes().join(', ')` to show what's available

**Example error message:**
```
Field type "xyz" not registered. Available types: relation, text, image
```

## 3. Add JSDoc note about config memoization

**Problem:** Config object reference changes cause unnecessary re-renders.

**Solution:**
- Add a note in the `useField()` JSDoc comment
- Explain that config should be memoized by the caller to prevent unnecessary re-renders

## 4. Add utility for testing

**Addition:**
- Add `clearFieldRegistry()` export function
- Should call `fieldRegistry.clear()`
- Add JSDoc comment noting it's useful for testing

## 5. Update app initialization

**Action:**
- Find where the app initializes (likely main entry file or App component)
- Import and call `initializeFields()` early, before any fields render
- Document that this must happen before field components are used
