# Form Field Types Documentation

This document provides a comprehensive reference for all available field types in the form package (`/react/apps/form`).

## Table of Contents

- [Overview](#overview)
- [Common Field Properties](#common-field-properties)
- [Text Input Fields](#text-input-fields)
- [Selection Fields](#selection-fields)
- [Date & Time Fields](#date--time-fields)
- [Rich Content Fields](#rich-content-fields)
- [Media Fields](#media-fields)
- [WordPress Integration Fields](#wordpress-integration-fields)
- [Specialized Fields](#specialized-fields)

---

## Overview

All field types share a consistent API and are built with React Hook Form integration. Each field type accepts a standardized set of props and supports validation through the form configuration.

### Available Field Types

The following 28 field types are available:

1. TextField
2. TextareaField
3. EmailField
4. PasswordField
5. URLField
6. NumberField
7. SelectField
8. RadioField
9. CheckboxField
10. ButtonGroupField
11. RangeField
12. DatePickerField
13. TimePickerField
14. DateTimePickerField
15. WysiwygField
16. MarkdownField
17. ColorPickerField
18. ImageField
19. FileField
20. GalleryField
21. LinkField
22. OEmbedField
23. RelationField
24. PostObjectField
25. UserField
26. SortableChildrenField
27. ReadOnlyField
28. HiddenField

---

## Common Field Properties

All field types support these common properties in their `fieldConfig`:

| Property | Type | Description |
|----------|------|-------------|
| `label` | string | Field label (auto-generated from field name if not provided) |
| `required` | boolean | Marks field as required with red asterisk |
| `placeholder` | string | Placeholder text for input fields |
| `helpText` | string | Helper text displayed below the field |

### Component Props

All field components receive these props:

```javascript
{
  fieldName,      // string: The field's name
  fieldConfig,    // object: Field configuration object
  register,       // function: React Hook Form register function
  error,          // object: Validation error object
  setValue,       // function: React Hook Form setValue (for controlled fields)
  watch           // function: React Hook Form watch (for controlled fields)
}
```

---

## Text Input Fields

### TextField

Basic text input field supporting various input types.

**Location:** `react/apps/form/src/components/field-types/TextField.js:1`

**Props:**
- `inputType`: string - HTML input type (text, tel, etc.)

**Field Config:**
```javascript
{
  type: 'text',
  label: 'Full Name',
  placeholder: 'Enter your name',
  required: true
}
```

---

### TextareaField

Multi-line text input field.

**Location:** `react/apps/form/src/components/field-types/TextareaField.js`

**Field Config:**
```javascript
{
  type: 'textarea',
  label: 'Description',
  placeholder: 'Enter description...',
  rows: 5  // Optional: number of visible rows
}
```

---

### EmailField

Email input with built-in validation pattern.

**Location:** `react/apps/form/src/components/field-types/EmailField.js`

**Field Config:**
```javascript
{
  type: 'email',
  label: 'Email Address',
  placeholder: 'user@example.com',
  required: true
}
```

---

### PasswordField

Password input with masked characters.

**Location:** `react/apps/form/src/components/field-types/PasswordField.js`

**Field Config:**
```javascript
{
  type: 'password',
  label: 'Password',
  placeholder: 'Enter password',
  required: true
}
```

---

### URLField

URL input field.

**Location:** `react/apps/form/src/components/field-types/URLField.js`

**Field Config:**
```javascript
{
  type: 'url',
  label: 'Website',
  placeholder: 'https://example.com'
}
```

---

### NumberField

Numeric input field.

**Location:** `react/apps/form/src/components/field-types/NumberField.js`

**Field Config:**
```javascript
{
  type: 'number',
  label: 'Age',
  placeholder: '18',
  min: 0,      // Optional: minimum value
  max: 120,    // Optional: maximum value
  step: 1      // Optional: increment step
}
```

---

## Selection Fields

### SelectField

Dropdown select field with single selection.

**Location:** `react/apps/form/src/components/field-types/SelectField.js:1`

**Options Format:**
- Array of strings: `['Option 1', 'Option 2']`
- Array of objects: `[{value: 'opt1', label: 'Option 1'}]`
- Object (key-value): `{opt1: 'Option 1', opt2: 'Option 2'}`

**Field Config:**
```javascript
{
  type: 'select',
  label: 'Country',
  placeholder: 'Select a country',
  options: [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' }
  ]
}
```

---

### RadioField

Radio button group for single selection.

**Location:** `react/apps/form/src/components/field-types/RadioField.js:1`

**Field Config:**
```javascript
{
  type: 'radio',
  label: 'Size',
  layout: 'horizontal',  // 'horizontal' or 'vertical' (default)
  helpText: 'Select your preferred size',
  options: [
    { value: 's', label: 'Small' },
    { value: 'm', label: 'Medium' },
    { value: 'l', label: 'Large' }
  ]
}
```

**Special Properties:**
- `layout`: Controls radio button arrangement (horizontal/vertical)
- `helpText`: Additional help text displayed below options

---

### CheckboxField

Single checkbox field for boolean values.

**Location:** `react/apps/form/src/components/field-types/CheckboxField.js:1`

**Field Config:**
```javascript
{
  type: 'checkbox',
  label: 'I agree to the terms and conditions',
  required: true
}
```

---

### ButtonGroupField

Button group for multiple choice selection.

**Location:** `react/apps/form/src/components/field-types/ButtonGroupField.js`

**Field Config:**
```javascript
{
  type: 'button_group',
  label: 'Alignment',
  options: ['left', 'center', 'right']
}
```

---

### RangeField

Slider input for numeric range selection.

**Location:** `react/apps/form/src/components/field-types/RangeField.js:1`

**Field Config:**
```javascript
{
  type: 'range',
  label: 'Volume',
  min: 0,
  max: 100,
  step: 1,
  default: 50,
  append: '%',           // Text to display after value
  prepend: '$',          // Text to display before value
  showMinMax: true       // Show min/max values (default: true)
}
```

**Features:**
- Visual slider with gradient fill
- Synchronized numeric input field
- Optional prefix/suffix text
- Min/max value indicators

---

## Date & Time Fields

All date/time fields use `react-datepicker` and store values in standardized formats.

### DatePickerField

Calendar-based date picker.

**Location:** `react/apps/form/src/components/field-types/DatePickerField.js:1`

**Field Config:**
```javascript
{
  type: 'date_picker',
  label: 'Birth Date',
  placeholder: 'Select date...',
  dateFormat: 'MM/dd/yyyy',      // Display format
  minDate: '2000-01-01',         // Minimum selectable date
  maxDate: '2025-12-31',         // Maximum selectable date
  helpText: 'Select your birth date'
}
```

**Storage Format:** `YYYY-MM-DD` (e.g., "2024-10-20")

**Features:**
- Month and year dropdowns
- Clearable (unless required)
- Min/max date constraints

---

### TimePickerField

Time picker field.

**Location:** `react/apps/form/src/components/field-types/TimePickerField.js`

**Field Config:**
```javascript
{
  type: 'time_picker',
  label: 'Appointment Time',
  placeholder: 'Select time...'
}
```

---

### DateTimePickerField

Combined date and time picker.

**Location:** `react/apps/form/src/components/field-types/DateTimePickerField.js`

**Field Config:**
```javascript
{
  type: 'date_time_picker',
  label: 'Event Start',
  placeholder: 'Select date and time...'
}
```

---

## Rich Content Fields

### WysiwygField

Rich text editor powered by TipTap.

**Location:** `react/apps/form/src/components/field-types/WysiwygField.js:151`

**Field Config:**
```javascript
{
  type: 'wysiwyg',
  label: 'Content',
  helpText: 'Format your content using the toolbar'
}
```

**Features:**
- Text formatting (bold, italic, underline, strikethrough)
- Headings (H2, H3)
- Lists (bullet, numbered)
- Blockquotes
- Code blocks
- Horizontal rules
- Undo/redo
- Link support

**Storage Format:** HTML string

---

### MarkdownField

Markdown editor field.

**Location:** `react/apps/form/src/components/field-types/MarkdownField.js`

**Field Config:**
```javascript
{
  type: 'markdown',
  label: 'Documentation',
  placeholder: 'Enter markdown content...'
}
```

**Storage Format:** Markdown string

---

### ColorPickerField

Color selection field.

**Location:** `react/apps/form/src/components/field-types/ColorPickerField.js`

**Field Config:**
```javascript
{
  type: 'color_picker',
  label: 'Brand Color',
  default: '#3b82f6'
}
```

**Storage Format:** Hex color code (e.g., "#3b82f6")

---

## Media Fields

All media fields integrate with the WordPress Media Library.

### ImageField

Single image selection from WordPress Media Library.

**Location:** `react/apps/form/src/components/field-types/ImageField.js:1`

**Field Config:**
```javascript
{
  type: 'image',
  label: 'Featured Image',
  imageSize: 'medium',              // WordPress image size (thumbnail, medium, large, full)
  previewHeight: '200px',           // Preview image max height
  buttonText: 'Select Image',       // Button text
  description: 'Click to select',   // Empty state description
  mediaTitle: 'Select Image',       // Media library popup title
  mediaButtonText: 'Use this image',
  helpText: 'Upload or select an image'
}
```

**Storage Format:** WordPress attachment ID (integer)

**Features:**
- WordPress Media Library integration
- Image preview with configurable size
- Change/remove image buttons
- Shows attachment ID
- Configurable preview height

---

### FileField

File upload and selection field.

**Location:** `react/apps/form/src/components/field-types/FileField.js`

**Field Config:**
```javascript
{
  type: 'file',
  label: 'Attachment',
  buttonText: 'Select File',
  allowedTypes: ['application/pdf', 'image/*']  // MIME types
}
```

**Storage Format:** WordPress attachment ID (integer)

---

### GalleryField

Multiple image gallery with drag-and-drop reordering.

**Location:** `react/apps/form/src/components/field-types/GalleryField.js:1`

**Field Config:**
```javascript
{
  type: 'gallery',
  label: 'Image Gallery',
  thumbnailSize: 'thumbnail',       // WordPress image size for grid
  maxImages: 10,                    // Maximum number of images (optional)
  buttonText: 'Add Images',
  description: 'Click to select images',
  mediaTitle: 'Select Images',
  mediaButtonText: 'Add to gallery',
  helpText: 'Upload or select multiple images'
}
```

**Storage Format:** JSON array of attachment IDs (e.g., `"[1,2,3]"`)

**Features:**
- Drag-and-drop reordering
- Image thumbnails in responsive grid
- Order indicators
- Remove individual images
- Clear all button
- Maximum image limit (optional)
- Visual drag indicators

---

## WordPress Integration Fields

### RelationField

Fetch and select from remote API endpoints.

**Location:** `react/apps/form/src/components/field-types/RelationField.js:1`

**Field Config:**
```javascript
{
  type: 'relation',
  label: 'Related Item',
  relation: {
    endpoint: '/wp-json/my-plugin/v1/items',  // API endpoint
    labelField: 'title',                      // Field to display as label
    valueField: 'id',                         // Field to use as value
    placeholder: 'Select an option...'
  },
  helpText: 'Select a related item'
}
```

**API Response Format:**
```javascript
{
  data: {
    items: [
      { id: 1, title: 'Item 1' },
      { id: 2, title: 'Item 2' }
    ]
  }
}
```

**Features:**
- Automatic API data fetching
- Loading state indicator
- Error handling
- Configurable label/value mapping

---

### PostObjectField

Select WordPress posts.

**Location:** `react/apps/form/src/components/field-types/PostObjectField.js`

**Field Config:**
```javascript
{
  type: 'post_object',
  label: 'Related Post',
  postType: 'post',           // Post type to query
  placeholder: 'Select a post...'
}
```

**Storage Format:** Post ID (integer)

---

### UserField

Select WordPress users.

**Location:** `react/apps/form/src/components/field-types/UserField.js`

**Field Config:**
```javascript
{
  type: 'user',
  label: 'Assigned User',
  role: 'author',             // Filter by user role (optional)
  placeholder: 'Select a user...'
}
```

**Storage Format:** User ID (integer)

---

### LinkField

Link builder with URL and text.

**Location:** `react/apps/form/src/components/field-types/LinkField.js`

**Field Config:**
```javascript
{
  type: 'link',
  label: 'Call to Action',
  helpText: 'Enter link URL and text'
}
```

**Storage Format:** Object with `url` and `text` properties

---

### OEmbedField

Embed external content (YouTube, Twitter, etc.).

**Location:** `react/apps/form/src/components/field-types/OEmbedField.js`

**Field Config:**
```javascript
{
  type: 'oembed',
  label: 'Video Embed',
  placeholder: 'Enter URL to embed...',
  helpText: 'Paste a YouTube, Vimeo, or other embeddable URL'
}
```

**Storage Format:** URL string

---

## Specialized Fields

### SortableChildrenField

Nested repeater field with drag-and-drop sorting.

**Location:** `react/apps/form/src/components/field-types/SortableChildrenField.js`

**Field Config:**
```javascript
{
  type: 'sortable_children',
  label: 'FAQ Items',
  helpText: 'Add and reorder FAQ items',
  childFields: {
    question: {
      type: 'text',
      label: 'Question'
    },
    answer: {
      type: 'textarea',
      label: 'Answer'
    }
  }
}
```

**Storage Format:** Array of objects

---

### ReadOnlyField

Display-only field (non-editable).

**Location:** `react/apps/form/src/components/field-types/ReadOnlyField.js`

**Field Config:**
```javascript
{
  type: 'readonly',
  label: 'ID',
  value: '12345'
}
```

**Use Cases:**
- Display computed values
- Show system-generated IDs
- Present non-editable metadata

---

### HiddenField

Hidden input field (not visible to users).

**Location:** `react/apps/form/src/components/field-types/HiddenField.js`

**Field Config:**
```javascript
{
  type: 'hidden',
  value: 'hidden-value'
}
```

**Use Cases:**
- Store metadata
- Pass tracking parameters
- Include system values

---

## Usage Examples

### Basic Form Configuration

```javascript
const formConfig = {
  fields: {
    name: {
      type: 'text',
      label: 'Full Name',
      required: true
    },
    email: {
      type: 'email',
      label: 'Email Address',
      required: true
    },
    age: {
      type: 'number',
      label: 'Age',
      min: 18,
      max: 120
    },
    country: {
      type: 'select',
      label: 'Country',
      options: ['USA', 'Canada', 'UK']
    }
  }
};
```

### Advanced Field Configuration

```javascript
const advancedConfig = {
  fields: {
    featured_image: {
      type: 'image',
      label: 'Featured Image',
      imageSize: 'large',
      required: true,
      helpText: 'Main image displayed at the top'
    },
    gallery: {
      type: 'gallery',
      label: 'Photo Gallery',
      maxImages: 12,
      thumbnailSize: 'medium',
      helpText: 'Additional images (max 12)'
    },
    content: {
      type: 'wysiwyg',
      label: 'Article Content',
      required: true
    },
    publish_date: {
      type: 'date_picker',
      label: 'Publish Date',
      minDate: new Date().toISOString(),
      dateFormat: 'MM/dd/yyyy'
    },
    status: {
      type: 'radio',
      label: 'Status',
      layout: 'horizontal',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' }
      ]
    },
    priority: {
      type: 'range',
      label: 'Priority',
      min: 0,
      max: 10,
      default: 5
    },
    related_posts: {
      type: 'relation',
      label: 'Related Articles',
      relation: {
        endpoint: '/wp-json/wp/v2/posts',
        labelField: 'title.rendered',
        valueField: 'id'
      }
    }
  }
};
```

---

## Field Type Registration

All field types are exported from the central index file:

**Location:** `react/apps/form/src/components/field-types/index.js:1`

To import specific field types:

```javascript
import { TextField, SelectField, ImageField } from './components/field-types';
```

---

## Validation

All fields support validation through React Hook Form's validation rules. Configure validation in your form schema using Zod or React Hook Form's built-in validators.

### Example with Validation

```javascript
{
  email: {
    type: 'email',
    label: 'Email',
    required: true,
    validation: {
      pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address'
    }
  }
}
```

---

## Styling

All field types use consistent Tailwind CSS classes for styling:
- Focus states with blue ring
- Error states with red border and text
- Consistent spacing and padding
- Responsive design
- Accessible color contrast

Error styling is automatically applied when validation fails.

---

## Accessibility

All fields include:
- Proper label associations (`htmlFor`/`id`)
- Required field indicators
- Error message announcements
- Keyboard navigation support
- ARIA attributes where appropriate

---

## Browser Compatibility

All field types are compatible with:
- Modern browsers (Chrome, Firefox, Safari, Edge)
- WordPress 5.0+
- React 16.8+ (Hooks support required)

---

## Dependencies

Core dependencies used across field types:
- `@wordpress/element` - React wrapper
- `react-hook-form` - Form state management
- `react-datepicker` - Date/time pickers
- `@tiptap/react` - WYSIWYG editor
- WordPress Media Library API
- Tailwind CSS for styling

---

## Contributing

When adding new field types:
1. Create component in `react/apps/form/src/components/field-types/`
2. Follow the established prop interface
3. Support common field properties
4. Include error state handling
5. Add export to `index.js`
6. Update this documentation

---

## Reference

- **Package Location:** `/react/apps/form`
- **Field Types Directory:** `react/apps/form/src/components/field-types/`
- **Total Field Types:** 28
- **Index File:** `react/apps/form/src/components/field-types/index.js`
