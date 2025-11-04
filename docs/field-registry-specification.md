# Field Registry System Specification

## Overview
A cohesive field type system for React that supports both input (editing) and display (rendering) modes. Fields are defined in single files and can be accessed via dedicated hooks (for known field types) or dynamically via a generic hook (for loops/unknown types).

## Architecture

### Field Definition Structure
Each field type is defined in a single file under `/src/fields/` with the following exports:

```js
// fields/ImageField.js
export const ImageFieldInput = ({ value, onChange, config }) => { ... };
export const ImageFieldDisplay = ({ value, config }) => { ... };

export const imageFieldDefinition = {
  type: 'image',
  Input: ImageFieldInput,
  Display: ImageFieldDisplay,
  transform: (value) => transformedValue,
  validate: (value) => boolean,
  defaultConfig: { ... }
};

export const useImageField = (config) => ({
  Input: (props) => <ImageFieldInput {...props} config={config} />,
  Display: (props) => <ImageFieldDisplay {...props} config={config} />
});
```

### Field Registry
Central registry that manages all field types:

```js
// fieldRegistry.js
const fieldRegistry = new Map();

export const registerField = (definition) => {
  fieldRegistry.set(definition.type, definition);
};

export const getFieldDefinition = (type) => {
  return fieldRegistry.get(type);
};

export const useField = (type, config) => {
  const definition = getFieldDefinition(type);
  if (!definition) {
    throw new Error(`Field type "${type}" not registered`);
  }
  
  return useMemo(() => ({
    Input: (props) => <definition.Input {...props} config={config} />,
    Display: (props) => <definition.Display {...props} config={config} />
  }), [definition, config]);
};
```

### Field Registration
Fields are registered on app initialization:

```js
// fields/index.js
import { registerField, imageFieldDefinition } from './ImageField';
import { registerField, textFieldDefinition } from './TextField';
// ... other fields

export const initializeFields = () => {
  registerField(imageFieldDefinition);
  registerField(textFieldDefinition);
  // ... register all fields
};
```

## Usage Patterns

### Static Usage (Known Field Type)
When the developer knows which field type they need:

```jsx
import { useImageField } from '@/fields/ImageField';

function MyComponent() {
  const [attachmentId, setAttachmentId] = useState(null);
  const { Input, Display } = useImageField({ 
    size: 'medium',
    allowedTypes: ['image/jpeg', 'image/png']
  });
  
  return (
    <div>
      <Input value={attachmentId} onChange={setAttachmentId} />
      <Display value={attachmentId} />
    </div>
  );
}
```

### Dynamic Usage (Loop/Unknown Type)
When rendering fields dynamically from data:

```jsx
import { useField } from '@/fieldRegistry';

function DynamicFields({ fields }) {
  return fields.map(field => {
    const { Input, Display } = useField(field.type, field.config);
    
    return field.isEditing ? (
      <Input value={field.value} onChange={field.onChange} />
    ) : (
      <Display value={field.value} />
    );
  });
}
```

## Field Type Requirements

### Component Props
All field Input components must accept:
- `value`: Current field value
- `onChange`: Callback function `(newValue) => void`
- `config`: Field-specific configuration object

All field Display components must accept:
- `value`: Current field value to render
- `config`: Field-specific configuration object

### Field Definition Properties
- `type` (string): Unique identifier for the field type
- `Input` (Component): React component for editing mode
- `Display` (Component): React component for display mode
- `transform` (function): Transform stored value for display `(value) => displayValue`
- `validate` (function): Validate field value `(value) => boolean`
- `defaultConfig` (object, optional): Default configuration values

## Example Field Types

### ImageField
- **Input**: Image uploader that stores attachment ID
- **Display**: Renders image from attachment ID
- **Transform**: Converts attachment ID to image URL
- **Config**: `{ size, allowedTypes, maxFileSize }`

### TextField
- **Input**: Text input
- **Display**: Formatted text display
- **Transform**: Apply text formatting
- **Config**: `{ multiline, maxLength, placeholder }`

### SelectField
- **Input**: Dropdown selector
- **Display**: Selected option label
- **Transform**: Convert value to label
- **Config**: `{ options, multiple, searchable }`

### DateField
- **Input**: Date picker
- **Display**: Formatted date string
- **Transform**: Format date according to locale
- **Config**: `{ format, minDate, maxDate }`

## File Structure

```
src/
├── fields/
│   ├── index.js              # Field registration
│   ├── ImageField.js         # Image field definition
│   ├── TextField.js          # Text field definition
│   ├── SelectField.js        # Select field definition
│   ├── DateField.js          # Date field definition
│   └── ...                   # Other field types
├── fieldRegistry.js          # Central registry and useField hook
└── App.js                    # Initialize fields on mount
```

## Implementation Guidelines

1. **One field type per file**: Each field definition lives in its own file
2. **Export both hook and definition**: Always export `useXField` and `xFieldDefinition`
3. **Register all fields**: Import and register all fields in `fields/index.js`
4. **Initialize on app start**: Call `initializeFields()` before rendering
5. **Immutable config**: Config objects should be memoized to prevent unnecessary re-renders
6. **Type safety**: Use TypeScript or PropTypes for component props
7. **Error handling**: Throw clear errors for unregistered field types

## Configuration Management

Field configurations should be:
- Serializable (JSON-safe)
- Validated on field registration
- Merged with default configs
- Memoized when passed to hooks

Example config validation:

```js
export const imageFieldDefinition = {
  type: 'image',
  Input: ImageFieldInput,
  Display: ImageFieldDisplay,
  defaultConfig: {
    size: 'medium',
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
  },
  validateConfig: (config) => {
    if (config.size && !['small', 'medium', 'large'].includes(config.size)) {
      throw new Error('Invalid size option');
    }
  }
};
```

## Testing Considerations

- Test each field's Input and Display components independently
- Test transform and validate functions with edge cases
- Test dynamic field rendering with various field types
- Test config merging and validation
- Test error handling for unregistered field types

## Future Enhancements

- Field type discovery/auto-registration
- Field composition (nested fields)
- Field dependencies and conditional rendering
- Async validation support
- Field state management (dirty, touched, errors)
- Bulk field operations
