# App Form Usage

## Overview
`AppFormBuilder` is a form component with auto-save functionality. Unlike the standard `FormBuilder` which batches changes for submission, `AppFormBuilder` saves each field change immediately to the database.

## When to Use
- **AppFormBuilder**: Real-time auto-save (app/SaaS style forms)
- **FormBuilder**: Traditional submit button forms (web forms)

## Installation
The package is designed for internal usage within the gateway project and is already wired into the application bundle. No additional installation steps are required.

## Import

```javascript
import { AppFormBuilder } from '@arcwp/gateway-forms';
```

## Basic Usage

### Minimal Example
```jsx
<AppFormBuilder
  collectionKey="posts"
  recordId={123}
/>
```

### With Authentication
```jsx
<AppFormBuilder
  collectionKey="posts"
  recordId={123}
  apiAuth={{
    username: 'admin',
    password: 'password123'
  }}
/>
```

### With Callbacks
```jsx
<AppFormBuilder
  collectionKey="posts"
  recordId={123}
  apiAuth={authCredentials}
  onFieldUpdate={(fieldName, value, response) => {
    console.log(`${fieldName} saved successfully:`, value);
  }}
  onFieldError={(fieldName, value, error) => {
    console.error(`Failed to save ${fieldName}:`, error);
  }}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `collectionKey` | string | Yes | The collection key to load field configuration from |
| `recordId` | number | Yes | The ID of the record to edit (must exist) |
| `apiAuth` | object | No | API authentication credentials (`{username, password}`) |
| `onFieldUpdate` | function | No | Callback when a field saves successfully `(fieldName, value, response) => {}` |
| `onFieldError` | function | No | Callback when a field fails to save `(fieldName, value, error) => {}` |

## Key Features

### Auto-Save Behavior
- Changes are saved 300ms after user stops typing (debounced)
- Only the changed field is sent in the update request
- Visual loading indicator appears on the field being saved
- Validation runs on each change before saving

### Error Handling
- Field-specific errors display below the field
- Both validation errors and API errors are shown
- Failed saves don't affect other fields

### Requirements
- **Must have `recordId`**: AppFormBuilder only works with existing records
- **Collection must be configured**: Collection must have fillable fields and endpoint
- **Record must exist**: Will show error if record not found

## Complete Example

```jsx
import React, { useState } from 'react';
import { AppFormBuilder } from '@arcwp/gateway-forms';

const EditPost = ({ postId }) => {
  const [saveLog, setSaveLog] = useState([]);

  const handleFieldUpdate = (fieldName, value) => {
    setSaveLog(prev => [...prev, {
      time: new Date().toLocaleTimeString(),
      field: fieldName,
      status: 'success'
    }]);
  };

  const handleFieldError = (fieldName, value, error) => {
    setSaveLog(prev => [...prev, {
      time: new Date().toLocaleTimeString(),
      field: fieldName,
      status: 'error',
      message: error
    }]);
  };

  return (
    <div>
      <h2>Edit Post #{postId}</h2>

      <AppFormBuilder
        collectionKey="posts"
        recordId={postId}
        apiAuth={{
          username: process.env.API_USERNAME,
          password: process.env.API_PASSWORD
        }}
        onFieldUpdate={handleFieldUpdate}
        onFieldError={handleFieldError}
      />

      {/* Optional: Show save log */}
      <div className="save-log">
        <h3>Recent Changes</h3>
        {saveLog.map((log, i) => (
          <div key={i} className={`log-${log.status}`}>
            {log.time} - {log.field}: {log.status}
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Comparison: FormBuilder vs AppFormBuilder

### FormBuilder (Web Form)
```jsx
<FormBuilder
  collectionKey="posts"
  recordId={123}  // Optional
  apiAuth={auth}
  // Has submit button
  // Saves all fields at once
  // User-initiated save
/>
```

### AppFormBuilder (App Form)
```jsx
<AppFormBuilder
  collectionKey="posts"
  recordId={123}  // Required
  apiAuth={auth}
  onFieldUpdate={handleUpdate}
  onFieldError={handleError}
  // No submit button
  // Saves each field immediately
  // Auto-save on change
/>
```

## Technical Details

### Debouncing
Updates are debounced by 300ms to avoid excessive API calls while typing. The timer resets with each keystroke.

### Field Update Flow
1. User changes field value
2. React Hook Form detects change
3. Validation runs (if configured)
4. 300ms debounce timer starts
5. Field marked as "updating" (shows spinner)
6. API request sent with only changed field: `{ fieldName: value }`
7. Success/error callback fires
8. Loading indicator removed

### Data Format
Each update sends a minimal payload:
```json
{
  "field_name": "new value"
}
```

The API endpoint should support partial updates (PATCH-style).
