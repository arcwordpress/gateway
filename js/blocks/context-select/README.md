# GT Context Select Block

A WordPress Gutenberg block that creates a select box populated with options from a parent context using the WordPress Interactivity API.

## Overview

The GT Context Select block allows you to create dynamic select dropdowns that read their options from a parent context (such as a GT Data Source block). You can configure which array property to use, and which properties within each item should be used for the option values and labels.

## Features

- Reads data from parent WordPress Interactivity API context
- Configurable property paths for array, value, and label
- Supports nested property access (e.g., `user.profile.name`)
- Dispatches custom events when selection changes
- Full WordPress editor integration

## Configuration

The block requires the following settings (configured in the block inspector):

### Required Settings

1. **Context Name** - The name of the parent context to read from (e.g., `gateway/data-source-2`)
2. **Array Property** - The property path to the array in the context (e.g., `records`, `items`)
3. **Value Property** - The property path for option values (e.g., `id`, `slug`)
4. **Label Property** - The property path for option labels (e.g., `title`, `name`)

### Optional Settings

5. **Placeholder** - Placeholder text for the select box (default: "Select an option...")

## Usage Example

### Basic Setup

1. Add a **GT Data Source** block to your page
2. Configure it with a collection (e.g., `posts`)
3. Inside the Data Source block, add a **GT Context Select** block
4. Configure the Context Select:
   - **Context Name**: `gateway/data-source-2` (matches the data source namespace)
   - **Array Property**: `records`
   - **Value Property**: `id`
   - **Label Property**: `title`

### Nested Properties

You can access nested properties using dot notation:

```
Value Property: user.id
Label Property: user.profile.displayName
```

## Events

The block dispatches a custom `gateway-context-select-change` event when the selection changes:

```javascript
document.addEventListener('gateway-context-select-change', (event) => {
  console.log('Selected value:', event.detail.value);
  console.log('Full context:', event.detail.context);
});
```

## Technical Details

### Block Name
`gateway/context-select`

### Attributes
- `contextName` (string) - Parent context namespace
- `arrayProperty` (string) - Path to array in context
- `valueProperty` (string) - Path to value in array items
- `labelProperty` (string) - Path to label in array items
- `placeholder` (string) - Select placeholder text
- `selectedValue` (string) - Currently selected value

### WordPress Interactivity API

The block uses the WordPress Interactivity API to:
- Read parent context data
- Reactively update options when parent data changes
- Handle user selection changes
- Expose selected value to other blocks

## Development

### Build Commands

```bash
# Development build with watch mode
npm start

# Production build
npm run build
```

### File Structure

```
context-select/
├── src/
│   ├── index.js       # Block registration and editor UI
│   ├── view.js        # Frontend interactivity store
│   └── editor.css     # Editor styles
├── build/             # Compiled assets
├── block.json         # Block metadata
├── package.json       # Dependencies
└── webpack.config.js  # Build configuration
```

## Requirements

- WordPress 6.5+
- WordPress Interactivity API
- Gateway plugin (for parent context)

## License

Same as Gateway plugin
