# Gateway Fields in Gutenberg - Quick Reference

## Installation

The forms package is already available in your monorepo at `/react/packages/forms`.

## Import

```javascript
import {
  // Provider components
  GutenbergFieldProvider,
  GutenbergFieldGroup,
  GutenbergField,

  // Hooks
  useFieldType,
  useGutenbergField,

  // Utilities (advanced)
  createGutenbergRegister,
  createFieldRegister,
  useGutenbergFieldWithContext
} from '@arcwp/gateway-forms';
```

## Quick Start

### Simple Block (3-5 fields)

```javascript
import { GutenbergFieldGroup } from '@arcwp/gateway-forms';

<InspectorControls>
  <PanelBody title="Settings">
    <GutenbergFieldGroup
      fields={[
        { name: 'title', type: 'text', label: 'Title' },
        { name: 'layout', type: 'select', label: 'Layout', options: [...] }
      ]}
      attributes={attributes}
      setAttributes={setAttributes}
    />
  </PanelBody>
</InspectorControls>
```

### Complex Block (Multiple Panels)

```javascript
import { GutenbergFieldProvider, GutenbergField } from '@arcwp/gateway-forms';

<InspectorControls>
  <GutenbergFieldProvider attributes={attributes} setAttributes={setAttributes}>

    <PanelBody title="Content">
      <GutenbergField
        config={{ name: 'title', type: 'text', label: 'Title' }}
        attributes={attributes}
      />
    </PanelBody>

    <PanelBody title="Layout">
      <GutenbergField
        config={{ name: 'columns', type: 'number', label: 'Columns' }}
        attributes={attributes}
      />
    </PanelBody>

  </GutenbergFieldProvider>
</InspectorControls>
```

### Advanced (Custom Layout)

```javascript
import { GutenbergFieldProvider, useFieldType } from '@arcwp/gateway-forms';

const { Input: TitleField } = useFieldType({ name: 'title', type: 'text', label: 'Title' });

<InspectorControls>
  <GutenbergFieldProvider attributes={attributes} setAttributes={setAttributes}>
    <div style={{ display: 'flex', gap: '10px' }}>
      <TitleField
        config={{ name: 'title', type: 'text', label: 'Title' }}
        value={attributes.title}
      />
    </div>
  </GutenbergFieldProvider>
</InspectorControls>
```

## Field Types Reference

| Type | Description | Config Example |
|------|-------------|----------------|
| `text` | Single line text | `{ type: 'text', name: 'title', label: 'Title' }` |
| `textarea` | Multi-line text | `{ type: 'textarea', name: 'desc', rows: 4 }` |
| `number` | Number input | `{ type: 'number', name: 'count', min: 0, max: 100 }` |
| `email` | Email input | `{ type: 'email', name: 'email' }` |
| `url` | URL input | `{ type: 'url', name: 'link' }` |
| `checkbox` | Checkbox | `{ type: 'checkbox', name: 'enabled' }` |
| `select` | Dropdown | `{ type: 'select', name: 'layout', options: [...] }` |
| `radio` | Radio buttons | `{ type: 'radio', name: 'choice', options: [...] }` |
| `range` | Slider | `{ type: 'range', name: 'opacity', min: 0, max: 100 }` |
| `color-picker` | Color picker | `{ type: 'color-picker', name: 'bgColor' }` |
| `date-picker` | Date picker | `{ type: 'date-picker', name: 'publishDate' }` |
| `time-picker` | Time picker | `{ type: 'time-picker', name: 'startTime' }` |
| `datetime-picker` | DateTime picker | `{ type: 'datetime-picker', name: 'eventDate' }` |
| `image` | Image uploader | `{ type: 'image', name: 'featuredImage' }` |
| `file` | File uploader | `{ type: 'file', name: 'attachment' }` |
| `wysiwyg` | Rich text editor | `{ type: 'wysiwyg', name: 'content' }` |
| `markdown` | Markdown editor | `{ type: 'markdown', name: 'readme' }` |

## Common Patterns

### Conditional Fields

```javascript
<GutenbergFieldProvider attributes={attributes} setAttributes={setAttributes}>
  <GutenbergField config={{ name: 'showAdvanced', type: 'checkbox', label: 'Advanced' }} attributes={attributes} />

  {attributes.showAdvanced && (
    <GutenbergField config={{ name: 'advancedOption', type: 'text', label: 'Option' }} attributes={attributes} />
  )}
</GutenbergFieldProvider>
```

### Tabs

```javascript
import { TabPanel } from '@wordpress/components';

<GutenbergFieldProvider attributes={attributes} setAttributes={setAttributes}>
  <TabPanel
    tabs={[
      { name: 'content', title: 'Content' },
      { name: 'style', title: 'Style' }
    ]}
  >
    {(tab) => (
      <>
        {tab.name === 'content' && (
          <GutenbergField config={contentConfig} attributes={attributes} />
        )}
        {tab.name === 'style' && (
          <GutenbergField config={styleConfig} attributes={attributes} />
        )}
      </>
    )}
  </TabPanel>
</GutenbergFieldProvider>
```

### Grouped Fields

```javascript
<div style={{ display: 'flex', gap: '10px' }}>
  <GutenbergField config={{ name: 'width', type: 'number', label: 'Width' }} attributes={attributes} />
  <GutenbergField config={{ name: 'height', type: 'number', label: 'Height' }} attributes={attributes} />
</div>
```

## Block Attributes

Always define attributes for your fields:

```javascript
registerBlockType('gateway/my-block', {
  attributes: {
    // String fields
    title: { type: 'string', default: '' },

    // Number fields
    columns: { type: 'number', default: 3 },

    // Boolean fields
    showMeta: { type: 'boolean', default: false },

    // Array fields (for multi-select, etc.)
    tags: { type: 'array', default: [] },

    // Object fields (for complex data)
    settings: { type: 'object', default: {} }
  },
  // ...
});
```

## Common Config Properties

All field types support:

```javascript
{
  name: 'fieldName',      // Required - maps to attribute
  type: 'text',           // Required - field type
  label: 'Field Label',   // Optional - field label
  help: 'Help text',      // Optional - help tooltip
  required: true,         // Optional - field required
  default: 'value',       // Optional - default value
  placeholder: 'Enter...' // Optional - placeholder text
}
```

## Troubleshooting

### Field not updating

1. Check attribute name matches field config name
2. Ensure GutenbergFieldProvider wraps the field
3. Verify attributes are passed to GutenbergField

### Type errors

1. Match block attribute type to field value type
2. Set appropriate default values
3. Use correct field type for data

### Styling issues

Some fields may need custom CSS for Gutenberg. Add to your block's editor.css:

```css
.components-panel__body .field {
  margin-bottom: 16px;
}

.components-panel__body .field__input {
  width: 100%;
}
```

## Performance Tips

1. **Define configs outside render** - Use constants or useMemo
2. **One provider per section** - Don't nest providers unnecessarily
3. **Memoize field arrays** - Use useMemo for field config arrays
4. **Avoid inline configs** - Extract to constants

## Examples

See `/react/packages/forms/examples/gutenberg-block-examples.js` for complete working examples.

## Documentation

- Full guide: `/react/packages/forms/examples/GUTENBERG_USAGE.md`
- Architecture: `/react/packages/forms/docs/ARCHITECTURE.md`
