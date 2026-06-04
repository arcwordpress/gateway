/**
 * Normalize a field's `options` config value to an array.
 *
 * Options can arrive in several formats depending on how they were stored:
 *   - Array of strings:  ["Yes", "No"]
 *   - Array of objects:  [{ value: "yes", label: "Yes" }, ...]
 *   - Newline-delimited string (from textarea input): "Yes\nNo"
 *   - Plain object (key → label map): { yes: "Yes", no: "No" }
 *   - null / undefined / anything else → treated as empty
 *
 * Returns an array of strings or { value, label } objects that the field
 * type components can iterate over safely.
 */
export function normalizeOptions(options) {
  if (Array.isArray(options)) return options;
  if (typeof options === 'string') {
    return options.split('\n').map(o => o.trim()).filter(Boolean);
  }
  if (options && typeof options === 'object') {
    return Object.entries(options).map(([value, label]) => ({ value, label }));
  }
  return [];
}
