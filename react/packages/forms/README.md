# @gateway/forms

Gateway Forms is a React component library providing form field types, validation, and API integration for WordPress collections.

## Installation

This package is part of the Gateway workspace and uses npm workspaces.

## Usage

```javascript
import { FormBuilder, fieldTypes } from '@gateway/forms';

// Use FormBuilder component
<FormBuilder collectionKey="my_collection" recordId={123} />

// Or use individual field components
import { TextField, SelectField, DatePickerField } from '@gateway/forms';
```

## Components

### FormBuilder
Main form component that dynamically generates forms based on collection schema.

### Field Types
- TextField
- TextareaField
- SelectField
- CheckboxField
- RadioField
- ButtonGroupField
- NumberField
- RangeField
- EmailField
- PasswordField
- URLField
- DatePickerField
- TimePickerField
- DateTimePickerField
- ColorPickerField
- MarkdownField
- WysiwygField
- ImageField
- FileField
- GalleryField
- LinkField
- OEmbedField
- PostObjectField
- UserField
- RelationField
- SortableChildrenField
- ReadOnlyField
- HiddenField

## Services

- API service for WordPress REST API integration
- Collection service for fetching and managing collections

## Utilities

- Zod schema generator for form validation
