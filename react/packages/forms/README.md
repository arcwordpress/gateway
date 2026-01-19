# @arcwp/gateway-forms

Gateway Forms is a React component library providing form field types, validation, and API integration for Gateway collections.

## Installation

This package is part of the Gateway WordPress plugin.


## Usage
```javascript
import { AppForm, useFieldType } from '@arcwp/gateway-forms';

// Example field definitions (could come from JSON or your API)
const fields = [
	{ name: 'first_name', type: 'text', label: 'First name', required: true },
	{ name: 'email', type: 'email', label: 'Email', required: true },
	{ name: 'bio', type: 'textarea', label: 'Bio', rows: 4 },
];

// Per-field wrapper to safely call the hook
function Field({ config }) {
	const { Input } = useFieldType(config);
	return <Input config={config} />;
}

export function MyProfileForm() {
	return (
		<AppForm collection="users" recordId={123} autoSave onSuccess={(data) => console.log('Saved', data)}>
			{fields.map((f) => (
				<Field key={f.name} config={f} />
			))}
		</AppForm>
	);
}

### Field Types Reference
- ButtonGroupField
- CheckboxField
- ColorPickerField
- DatePickerField
- DateTimePickerField
- EmailField
- FileField
- GalleryField
- HiddenField
- ImageField
- LinkField
- MarkdownField
- NumberField
- OEmbedField
- PasswordField
- PostObjectField
- RadioField
- RangeField
- ReadOnlyField
- RelationField
- SelectField
- SlugField
- SortableChildrenField
- TextareaField
- TextField
- TimePickerField
- URLField
- UserField
- WysiwygField
