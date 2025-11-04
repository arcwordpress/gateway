# Fields V2 Conversion Process

## Overview

Gateway fields are being migrated to a new architecture (V2) that provides both **Input** and **Display** components for each field type. This enables fields to be used in forms (input mode) and in read-only contexts like grids and tables (display mode).

## Key Changes

### Before (V1)
- Single component per field type
- Default exports only
- Tailwind CSS classes inline
- Files at root of `field-types/` directory
- No centralized registry

### After (V2)
- Separate Input and Display components
- Registry-based with field definitions
- BEM CSS in separate stylesheets
- Organized in named directories (field key as folder name)
- Type-safe field access via registry

## Architecture

### Directory Structure

Each field type lives in its own directory named after the field key (registry type):

```
field-types/
├── text/
│   ├── index.js        # Input/Display components + definition
│   └── style.css       # BEM styles
├── checkbox/
│   ├── index.js
│   └── style.css
├── button-group/
│   ├── index.js
│   └── style.css
└── relation/
    ├── index.js
    └── style.css
```

### Component Pattern

Each field must export:

1. **Input Component** - For forms and editing
2. **Display Component** - For read-only views (grids, tables)
3. **Field Definition** - Registry configuration object
4. **Hook** - Optional convenience hook
5. **Default Export** - Backward compatibility (Input component)

### Example Structure

```javascript
import { useMemo } from '@wordpress/element';
import './style.css';

// Input Component (for forms)
const TextFieldInput = ({ fieldName, fieldConfig, register, error }) => {
  return (
    <div className="text-field">
      {/* Input implementation */}
    </div>
  );
};

// Display Component (for grids and read-only views)
export const TextFieldDisplay = ({ value, config }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="text-field__display text-field__display--empty">-</span>;
  }
  return <span className="text-field__display">{String(value)}</span>;
};

// Field Definition for registry
export const textFieldDefinition = {
  type: 'text',                    // Registry key (matches directory name)
  Input: TextFieldInput,
  Display: TextFieldDisplay,
  defaultConfig: {
    placeholder: '',
    inputType: 'text',
  },
};

// Hook for easy usage
export const useTextField = (config) => {
  return useMemo(() => ({
    Input: (props) => <TextFieldInput {...props} config={config} />,
    Display: (props) => <TextFieldDisplay {...props} config={config} />
  }), [config]);
};

// Default export for backward compatibility
const TextField = TextFieldInput;
export default TextField;
```

## BEM CSS Pattern

Replace Tailwind utility classes with BEM (Block Element Modifier) methodology.

### BEM Structure

```
.block                    # Main component
.block__element          # Child element
.block__element--modifier # State or variant
```

### Example Conversion

**Before (Tailwind):**
```jsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    {label}
    <span className="text-red-500 ml-1">*</span>
  </label>
  <input className="w-full px-3 py-2 border rounded-md focus:ring-2" />
</div>
```

**After (BEM):**
```jsx
<div className="text-field">
  <label className="text-field__label">
    {label}
    <span className="text-field__required">*</span>
  </label>
  <input className="text-field__input" />
</div>
```

**CSS (style.css):**
```css
.text-field__label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.text-field__required {
  color: #ef4444;
  margin-left: 0.25rem;
}

.text-field__input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

.text-field__input:focus {
  outline: none;
  box-shadow: 0 0 0 2px #3b82f6;
}
```

## Step-by-Step Conversion Process

### 1. Read Current Field

Check the existing field file for Tailwind classes:

```bash
# Example
gateway/react/packages/fields/src/components/field-types/CheckboxField.js
```

### 2. Create Directory

Create a directory named after the field's registry key:

```bash
mkdir gateway/react/packages/fields/src/components/field-types/checkbox
```

**Naming Convention:** Use lowercase with hyphens (kebab-case) matching the registry type.

### 3. Create index.js

Create the field component with Input/Display pattern:

**Template:**
```javascript
import { useMemo } from '@wordpress/element';
import './style.css';

const [FieldName]Input = ({ fieldName, fieldConfig, register, setValue, watch, error }) => {
  // Input implementation
};

export const [FieldName]Display = ({ value, config }) => {
  // Display implementation with empty state handling
};

export const [fieldKey]FieldDefinition = {
  type: '[field-key]',
  Input: [FieldName]Input,
  Display: [FieldName]Display,
  defaultConfig: {},
};

export const use[FieldName] = (config) => {
  return useMemo(() => ({
    Input: (props) => <[FieldName]Input {...props} config={config} />,
    Display: (props) => <[FieldName]Display {...props} config={config} />
  }), [config]);
};

const [FieldName] = [FieldName]Input;
export default [FieldName];
```

### 4. Create style.css

Convert Tailwind classes to BEM CSS:

1. Identify all Tailwind classes in the old component
2. Create BEM class names following the pattern: `field-key__element--modifier`
3. Convert utility classes to CSS properties

**Common Conversions:**
- `text-sm` → `font-size: 0.875rem`
- `font-medium` → `font-weight: 500`
- `text-gray-700` → `color: #374151`
- `mb-1` → `margin-bottom: 0.25rem`
- `px-3 py-2` → `padding: 0.5rem 0.75rem`
- `border` → `border: 1px solid #d1d5db`
- `rounded-md` → `border-radius: 0.375rem`
- `focus:ring-2` → `box-shadow: 0 0 0 2px #3b82f6` in `:focus`

### 5. Register in Field Registry

Edit `src/fields/index.js`:

```javascript
import { [fieldKey]FieldDefinition } from '../components/field-types/[field-key]';

export const initializeFields = () => {
  // ... existing registrations
  registerField([fieldKey]FieldDefinition);
};
```

### 6. Update Package Exports

Edit `src/index.js`:

**Remove from legacy exports:**
```javascript
// Remove this line
export { default as [FieldName] } from './components/field-types/[FieldName]';
```

**Add to registry exports:**
```javascript
export {
  [FieldName]Display,
  [fieldKey]FieldDefinition,
  use[FieldName],
} from './components/field-types/[field-key]';
```

### 7. Update field-types/index.js

Remove the field from `src/components/field-types/index.js`:

```javascript
// Remove this line
export { default as [FieldName] } from './[FieldName]';
```

### 8. Delete Old File

```bash
rm gateway/react/packages/fields/src/components/field-types/[FieldName].js
```

### 9. Update GT1 Test App

Edit `gt1/src/pages/Dashboard.js`:

**Remove from imports:**
```javascript
// Remove [FieldName] from legacy imports
import {
    getFieldInput,
    initializeFields,
    // Legacy fields
    SelectField,
    // [FieldName], <- REMOVE THIS
    ...
} from '@arcwp/gateway-fields';
```

**Update field definition:**
```javascript
{
    name: '[field]_field',
    type: '[FieldName]',
    component: getFieldInput('[field-key]'),  // Use registry
    config: {
        // ... config
    }
}
```

## Registry Usage

### Accessing Fields

**Via Registry (Recommended for V2 fields):**
```javascript
import { getFieldInput, getFieldDisplay, initializeFields } from '@arcwp/gateway-fields';

// Initialize registry first
initializeFields();

// Get components
const TextInput = getFieldInput('text');
const TextDisplay = getFieldDisplay('text');
```

**Via Hook:**
```javascript
import { useTextField, initializeFields } from '@arcwp/gateway-fields';

initializeFields();

const config = useMemo(() => ({ placeholder: 'Enter text' }), []);
const { Input, Display } = useTextField(config);
```

**Legacy (for non-converted fields):**
```javascript
import { SelectField, TextareaField } from '@arcwp/gateway-fields';
```

## Display Component Guidelines

Display components should:

1. **Handle empty values gracefully:**
   ```javascript
   if (value === null || value === undefined || value === '') {
     return <span className="field__display field__display--empty">-</span>;
   }
   ```

2. **Support config options:**
   ```javascript
   const options = config?.options || [];
   ```

3. **Return simple, read-only markup:**
   ```javascript
   return <span className="field__display">{displayValue}</span>;
   ```

4. **Use appropriate visual indicators:**
   - Checkboxes: `☑` (checked) / `☐` (unchecked)
   - Empty: `-` or `—`
   - Links: Show URL or label
   - Images: Show thumbnail
   - Relations: Show label from related record

## Field Keys Reference

| Field Type | Directory Name | Registry Key | Status |
|------------|---------------|--------------|--------|
| TextField | `text` | `text` | ✅ Converted |
| CheckboxField | `checkbox` | `checkbox` | ✅ Converted |
| ButtonGroupField | `button-group` | `button-group` | ✅ Converted |
| RelationField | N/A (special) | `relation` | ✅ Converted |
| SelectField | `select` | `select` | ⏳ Pending |
| TextareaField | `textarea` | `textarea` | ⏳ Pending |
| NumberField | `number` | `number` | ⏳ Pending |
| EmailField | `email` | `email` | ⏳ Pending |
| URLField | `url` | `url` | ⏳ Pending |
| PasswordField | `password` | `password` | ⏳ Pending |
| RadioField | `radio` | `radio` | ⏳ Pending |
| RangeField | `range` | `range` | ⏳ Pending |
| DatePickerField | `date-picker` | `date-picker` | ⏳ Pending |
| ColorPickerField | `color-picker` | `color-picker` | ⏳ Pending |
| MarkdownField | `markdown` | `markdown` | ⏳ Pending |
| WysiwygField | `wysiwyg` | `wysiwyg` | ⏳ Pending |
| TimePickerField | `time-picker` | `time-picker` | ⏳ Pending |
| DateTimePickerField | `datetime-picker` | `datetime-picker` | ⏳ Pending |
| LinkField | `link` | `link` | ⏳ Pending |
| ImageField | `image` | `image` | ⏳ Pending |
| FileField | `file` | `file` | ⏳ Pending |
| GalleryField | `gallery` | `gallery` | ⏳ Pending |
| ReadOnlyField | `readonly` | `readonly` | ⏳ Pending |
| HiddenField | `hidden` | `hidden` | ⏳ Pending |
| OEmbedField | `oembed` | `oembed` | ⏳ Pending |
| PostObjectField | `post-object` | `post-object` | ⏳ Pending |
| UserField | `user` | `user` | ⏳ Pending |
| SortableChildrenField | `sortable-children` | `sortable-children` | ⏳ Pending |

## Important Notes

### Dev Watch
- **DO NOT run build commands** - dev watch is already running
- Changes are automatically compiled
- Dev watch monitors: `gateway/react/packages/fields/`

### Export Strategy
- Fields should only be exported ONE way
- V2 fields: Registry exports only
- V1 fields: Default exports until converted
- No duplicate exports

### Testing
- GT1 plugin (`wp-content/plugins/gt1`) is the test environment
- Dashboard route shows all field types with accordions
- Form values display updates in real-time on the right panel
- Test both Input (in accordions) and Display (future grid implementation)

### Field Config Patterns

**Standard fields:**
```javascript
config: {
  label: 'Field Label',
  help: 'Help text',
  placeholder: 'Placeholder',
  default: 'Default value',
  required: true,
}
```

**Checkbox:**
```javascript
config: {
  label: 'Checkbox Label',
  default: true,  // boolean
}
```

**Select/Radio/ButtonGroup:**
```javascript
config: {
  options: [
    { value: 'val1', label: 'Label 1' },
    { value: 'val2', label: 'Label 2' },
  ],
  default: 'val1',
}
```

**Relation:**
```javascript
config: {
  relation: {
    endpoint: '/wp-json/wp/v2/posts',
    labelField: 'title',
    valueField: 'id',
  }
}
```

## Troubleshooting

### Module Not Found Error
- Check that import paths use the directory name (e.g., `'./text'` not `'./TextField'`)
- Verify field is removed from `field-types/index.js`
- Confirm old file is deleted

### Field Not Rendering
- Ensure `initializeFields()` is called before component usage
- Check registry key matches directory name
- Verify field definition has both Input and Display

### Styles Not Applied
- Confirm `import './style.css'` in index.js
- Check BEM class names match between JS and CSS
- Verify no typos in class names

### Default Values Not Showing
- GT1: Check `defaultValues` object includes all fields
- Ensure `useForm({ defaultValues })` receives the object
- For empty fields, use `''` (string) or `false` (checkbox)

## Next Field to Convert

To continue conversions, process fields **alphabetically** by field type name:
1. CheckboxField ✅
2. ColorPickerField ⏳
3. DatePickerField ⏳
4. DateTimePickerField ⏳
5. EmailField ⏳
... (see Field Keys Reference table above)

---

**Last Updated:** 2025-11-02
**Current Status:** 4 fields converted (text, checkbox, button-group, relation)
**Next:** ColorPickerField
