# Gateway Field Blocks

A block factory system for creating individual field blocks that can be used to build granular forms in WordPress Gutenberg.

## Overview

This package provides a factory function (`createFieldBlock`) that generates Gutenberg blocks from Gateway Forms field types. Instead of using a monolithic form block, you can now use individual field blocks that work together to create forms.

## Architecture

This package uses a **script-only registration** approach:

- **One Build Output**: All field blocks are bundled into a single `build/index.js` file
- **Multiple Block Registrations**: The JavaScript registers multiple blocks (`gateway/text-field`, `gateway/textarea-field`, etc.)
- **No block.json Required**: The PHP `BlockRegistry` enqueues the script which handles all block registrations
- **Factory Pattern**: New field blocks are added by calling `createFieldBlock()` in JavaScript

## Features

- **Block Factory**: Reusable factory function to create field blocks from any Gateway Forms field type
- **Consistent Structure**: All field blocks share a common structure and behavior
- **Inspector Controls**: Each field has standard controls (name, label, placeholder, required, help text)
- **Extensible**: Easy to add custom inspector controls for specific field types
- **Type Safety**: Uses existing field hooks from `@arcwp/gateway-forms`

## Architecture

### Block Factory

The `createFieldBlock` factory function (`src/factory/createFieldBlock.js`) takes a configuration object and:

1. Creates an Edit component with Inspector controls
2. Integrates with the field's hook (e.g., `useTextField`)
3. Provides a mock form context for editor preview
4. Registers the block with WordPress

### Field Blocks

Each field block (e.g., `src/blocks/text-field.js`) calls the factory with:

- Block name and metadata
- Field hook from Gateway Forms
- Additional inspector controls specific to that field type
- Custom attributes

## Available Blocks

### Text Field (`gateway/text-field`)

A single-line text input field with support for different input types (text, email, url, tel, search).

**Attributes:**
- `name`: Field identifier (required)
- `label`: Display label
- `placeholder`: Placeholder text
- `required`: Whether field is required
- `help`: Help text
- `inputType`: HTML input type (text, email, url, tel, search)

### Textarea Field (`gateway/textarea-field`)

A multi-line text input field for longer content.

**Attributes:**
- `name`: Field identifier (required)
- `label`: Display label
- `placeholder`: Placeholder text
- `required`: Whether field is required
- `help`: Help text
- `rows`: Number of visible text rows (2-20)

## Usage

### Building

```bash
npm install
npm run build
```

### Development

```bash
npm run start
```

### Adding New Field Blocks

To create a new field block:

1. Import the field hook from `@arcwp/gateway-forms`
2. Call `createFieldBlock` with your configuration
3. Add custom inspector controls if needed
4. Import the block in `src/index.js`

**Example:**

```javascript
import { useEmailField } from '@arcwp/gateway-forms';
import { createFieldBlock } from '../factory/createFieldBlock';
import { __ } from '@wordpress/i18n';

createFieldBlock({
	blockName: 'gateway/email-field',
	title: __('Email Field', 'gateway'),
	description: __('An email input field.', 'gateway'),
	icon: 'email',
	useFieldHook: useEmailField,
	keywords: ['email', 'contact'],
	// Add custom controls if needed
	inspectorControls: {
		attributes: {
			// custom attributes
		},
		render: ({ attributes, setAttributes }) => {
			// custom inspector controls
		},
	},
});
```

## Future Plans

- **Granular Form Block**: A container block that accepts field blocks as children
- **Form Submission**: Integration with Gateway Forms submission system
- **Validation**: Block-level validation rules
- **Conditional Logic**: Show/hide fields based on other field values

## Related Packages

- `@arcwp/gateway-forms`: Form components and field hooks
- `@arcwp/gateway-grid`: Grid components
