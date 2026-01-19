# Using Gateway Fields in Gutenberg Blocks

This guide explains how to use Gateway Fields as InspectorControls in Gutenberg blocks.

## Overview

Gateway Fields can now be used in Gutenberg blocks through an abstraction layer that maintains compatibility with React Hook Forms while allowing fields to work with Gutenberg's `setAttributes` pattern.

## Three Usage Patterns

### Pattern 1: Batch Rendering (Simplest)

Use `GutenbergFieldGroup` when you want to render multiple fields in a linear layout without custom organization.

```javascript
import { GutenbergFieldGroup } from '@arcwp/gateway-forms';

const fields = [
  { name: 'title', type: 'text', label: 'Title' },
  { name: 'description', type: 'textarea', label: 'Description' },
  { name: 'showAuthor', type: 'checkbox', label: 'Show Author' }
];

<InspectorControls>
  <PanelBody title="Settings">
    <GutenbergFieldGroup
      fields={fields}
      attributes={attributes}
      setAttributes={setAttributes}
    />
  </PanelBody>
</InspectorControls>
```

**When to use:**
- Simple blocks with few settings
- Fields don't need custom layout
- Quickest way to get started

### Pattern 2: Individual Fields with Provider (Most Flexible)

Use `GutenbergFieldProvider` wrapper with individual `GutenbergField` components for complex layouts with panels, tabs, accordions, etc.

```javascript
import { GutenbergFieldProvider, GutenbergField } from '@arcwp/gateway-forms';

<InspectorControls>
  <GutenbergFieldProvider attributes={attributes} setAttributes={setAttributes}>

    <PanelBody title="Content">
      <GutenbergField
        config={{ name: 'title', type: 'text', label: 'Title' }}
        attributes={attributes}
      />
      <GutenbergField
        config={{ name: 'subtitle', type: 'text', label: 'Subtitle' }}
        attributes={attributes}
      />
    </PanelBody>

    <PanelBody title="Layout">
      <GutenbergField
        config={{ name: 'layout', type: 'select', label: 'Layout', options: [...] }}
        attributes={attributes}
      />
      <GutenbergField
        config={{ name: 'columns', type: 'number', label: 'Columns' }}
        attributes={attributes}
      />
    </PanelBody>

    <TabPanel tabs={[...]}>
      {(tab) => (
        <GutenbergField config={tabFields[tab.name]} attributes={attributes} />
      )}
    </TabPanel>

  </GutenbergFieldProvider>
</InspectorControls>
```

**When to use:**
- Complex blocks with many settings
- Multiple panels or tabs
- Custom layouts (accordions, conditional rendering, etc.)
- Need to organize fields semantically

### Pattern 3: Direct useFieldType Hook (Maximum Control)

Use `useFieldType` directly when you need maximum control over field rendering and composition.

```javascript
import { GutenbergFieldProvider, useFieldType } from '@arcwp/gateway-forms';

const firstNameConfig = { name: 'firstName', type: 'text', label: 'First Name' };
const lastNameConfig = { name: 'lastName', type: 'text', label: 'Last Name' };

const { Input: FirstNameField } = useFieldType(firstNameConfig);
const { Input: LastNameField } = useFieldType(lastNameConfig);

<InspectorControls>
  <GutenbergFieldProvider attributes={attributes} setAttributes={setAttributes}>
    <PanelBody title="User Info">

      {/* Custom layout - side by side */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <FirstNameField
          config={firstNameConfig}
          value={attributes.firstName}
          defaultValue={attributes.firstName}
        />
        <LastNameField
          config={lastNameConfig}
          value={attributes.lastName}
          defaultValue={attributes.lastName}
        />
      </div>

    </PanelBody>
  </GutenbergFieldProvider>
</InspectorControls>
```

**When to use:**
- Need completely custom layouts
- Want to compose fields with other components
- Need fine-grained control over rendering
- Advanced use cases

## Key Concepts

### The Provider Pattern

`GutenbergFieldProvider` creates a context that wraps Gutenberg's `setAttributes` to make it compatible with Gateway Fields' registration system. You wrap it once around your InspectorControls (or a section), and all fields within automatically connect to it.

```javascript
<GutenbergFieldProvider attributes={attributes} setAttributes={setAttributes}>
  {/* All fields here can access attributes and setAttributes via context */}
</GutenbergFieldProvider>
```

### Field Configuration

Fields are configured using JSON objects, just like in regular Gateway Forms:

```javascript
const fieldConfig = {
  name: 'title',           // Required: maps to block attribute
  type: 'text',            // Required: field type from registry
  label: 'Block Title',    // Optional: field label
  help: 'Help text',       // Optional: help text
  required: true,          // Optional: validation
  // ... other field-specific options
};
```

### Available Field Types

All registered Gateway Field types are available:
- `text` - Text input
- `textarea` - Multi-line text
- `email` - Email input
- `number` - Number input
- `url` - URL input
- `password` - Password input
- `checkbox` - Checkbox
- `radio` - Radio buttons
- `select` - Select dropdown
- `button-group` - Button group selector
- `range` - Range slider
- `color-picker` - Color picker
- `date-picker` - Date picker
- `time-picker` - Time picker
- `datetime-picker` - DateTime picker
- `image` - Image uploader
- `file` - File uploader
- `gallery` - Gallery manager
- `wysiwyg` - WYSIWYG editor
- `markdown` - Markdown editor
- `oembed` - oEmbed field
- `link` - Link field
- `post-object` - Post selector
- `user` - User selector
- `relation` - Relation field
- `hidden` - Hidden field
- `readonly` - Read-only display

## Block Attributes Setup

Make sure your block attributes match your field names:

```javascript
registerBlockType('gateway/my-block', {
  attributes: {
    // Attribute name must match field config "name"
    title: { type: 'string', default: '' },
    description: { type: 'string', default: '' },
    showMeta: { type: 'boolean', default: false },
    layout: { type: 'string', default: 'grid' },
    columns: { type: 'number', default: 3 },
    // ... etc
  },
  // ...
});
```

## Architecture Details

### How It Works

1. **Abstraction Layer**: `createFieldRegister()` creates a registration function that works with both React Hook Form and Gutenberg
2. **Context Provider**: `GutenbergFieldProvider` creates a Gateway Form context using Gutenberg's `setAttributes`
3. **Field Components**: Gateway Field components use `useGatewayForm()` to access the register function, which now works with Gutenberg
4. **Value Binding**: Field values come from block `attributes` and update via `setAttributes`

### Compatibility

- ✅ Maintains full compatibility with React Hook Forms
- ✅ Works with all existing Gateway Field types
- ✅ No breaking changes to existing forms
- ✅ Fields work in both contexts (forms and blocks)

## Examples

See `gutenberg-block-examples.js` for complete working examples demonstrating:
- Simple batch rendering
- Complex layouts with multiple panels
- Tabbed interfaces
- Advanced field composition
- Custom layouts

## Migration Guide

If you have existing blocks using native WordPress components, you can gradually migrate:

1. **Add attributes** for fields you want to migrate
2. **Wrap InspectorControls** with `GutenbergFieldProvider`
3. **Replace native components** one at a time with Gateway Fields
4. **Test** each field to ensure proper attribute binding

```javascript
// Before
<TextControl
  label="Title"
  value={attributes.title}
  onChange={(value) => setAttributes({ title: value })}
/>

// After
<GutenbergField
  config={{ name: 'title', type: 'text', label: 'Title' }}
  attributes={attributes}
/>
```

## Best Practices

1. **Define field configs as constants** outside render for reusability
2. **Use one Provider** per InspectorControls section
3. **Match attribute names** to field config names exactly
4. **Set default values** in block attributes definition
5. **Organize fields semantically** using panels and tabs
6. **Test field types** before widespread use (some may need Gutenberg-specific styling)

## Troubleshooting

### Fields not updating attributes

Make sure:
- Field `name` matches block attribute name
- `GutenbergFieldProvider` wraps the field
- `attributes` prop is passed to `GutenbergField`

### Type errors or validation issues

Check:
- Block attribute type matches field type (string, number, boolean)
- Default values are set in attributes definition
- Field config is valid (has required `name` and `type`)

### Styling issues

Some fields may need additional CSS for Gutenberg context. Fields are designed for forms, so you may need to adjust spacing/sizing for InspectorControls.

## Future Enhancements

Potential improvements:
- Gutenberg-specific field variants with better styling
- Built-in validation integration
- Conditional field rendering helpers
- Field dependency management
- Enhanced type safety with TypeScript
