import React from 'react';
import { AppForm, useFieldType } from '@arcwp/gateway-forms';

// Example field definitions (could come from JSON or your API)
const fields = [
  { name: 'first_name', type: 'text', label: 'First name', required: true },
  { name: 'email', type: 'email', label: 'Email', required: true },
  { name: 'bio', type: 'textarea', label: 'Bio', rows: 4 },
];

// Small per-field wrapper that safely calls the hook at the top level
const Field = React.memo(function Field({ config }) {
  try {
    const { Input } = useFieldType(config);
    return <Input config={config} />;
  } catch (e) {
    // Fallback: unknown type or bad config
    console.error('Field render error for', config, e);
    return null;
  }
});

// Read-only display wrapper (optional)
const FieldDisplay = React.memo(function FieldDisplay({ config, value }) {
  try {
    const { Display } = useFieldType(config);
    return <Display value={value} config={config} />;
  } catch (e) {
    console.error('Field display error for', config, e);
    return <span>-</span>;
  }
});

// Example form using the recommended approach
export function UseFieldTypeLoopExample() {
  const fakeRecord = { first_name: 'Alex', email: 'alex@example.com', bio: 'Writer' };

  return (
    <div>
      <h3>Editable form (per-field wrapper)</h3>
      <AppForm collection="users" recordId={123} autoSave onSuccess={(data) => console.log('Saved', data)}>
        {fields.map((f) => (
          // Use a stable key (name) so adding/removing fields doesn't break hook order
          <Field key={f.name} config={f} />
        ))}
      </AppForm>

      <hr />

      <h3>Read-only display</h3>
      <div>
        {fields.map((f) => (
          <div key={f.name} className="field-display-row">
            <label>{f.label || f.name}</label>
            <FieldDisplay config={f} value={fakeRecord[f.name]} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default UseFieldTypeLoopExample;
