# Public Forms Usage - RecordsProvider

## Problem

`CollectionProvider` fetches collection metadata from `/gateway/v1/collections/{key}`, which requires authentication. This prevents public forms from loading because unauthenticated users get a 401 error.

## Solution

Use `RecordsProvider` - a lightweight provider designed specifically for public/read-only access without metadata fetching.

## Usage

### Basic Example - Public Form

```jsx
import { RecordsProvider, useRecords } from '@arcwp/gateway-data';

function PublicEventForm() {
  return (
    <RecordsProvider route="gateway/v1/events">
      <EventSubmissionForm />
    </RecordsProvider>
  );
}

function EventSubmissionForm() {
  const { createRecord, loading, error } = useRecords();

  const handleSubmit = async (formData) => {
    try {
      await createRecord(formData);
      alert('Event submitted successfully!');
    } catch (err) {
      console.error('Submission failed:', err);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      handleSubmit(Object.fromEntries(formData));
    }}>
      <input name="title" required />
      <button type="submit" disabled={loading}>Submit</button>
      {error && <p>Error: {error}</p>}
    </form>
  );
}
```

### Public Read-Only List

```jsx
function PublicEventsList() {
  return (
    <RecordsProvider 
      route="gateway/v1/events"
      queryParams={{ status: 'published', per_page: 20 }}
    >
      <EventsList />
    </RecordsProvider>
  );
}

function EventsList() {
  const { records, loading, error } = useRecords();

  if (loading) return <p>Loading events...</p>;
  if (error) return <p>Failed to load events</p>;

  return (
    <ul>
      {records.map(event => (
        <li key={event.id}>
          <h3>{event.title}</h3>
          <p>{event.description}</p>
        </li>
      ))}
    </ul>
  );
}
```

### With Manual Refresh

```jsx
function EventsWithRefresh() {
  const { records, loading, refresh } = useRecords();

  return (
    <div>
      <button onClick={refresh} disabled={loading}>
        Refresh Events
      </button>
      <ul>
        {records.map(event => (
          <li key={event.id}>{event.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Props

### RecordsProvider

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `route` | string | Yes | Full route path (e.g., `'gateway/v1/events'`) |
| `queryParams` | object | No | Query parameters for filtering, pagination, etc. |
| `autoLoad` | boolean | No | Auto-load records on mount (default: `true`) |

## Hook: useRecords()

Returns an object with:

```typescript
{
  records: Array,        // Array of record objects
  loading: boolean,      // Loading state
  error: string|null,    // Error message if any
  refresh: () => Promise, // Refresh records
  createRecord: (data) => Promise, // Create new record
  getRecordById: (id) => Object|null // Get record from loaded data
}
```

## When to Use RecordsProvider

✅ **Public forms** - Allow unauthenticated users to submit data  
✅ **Public displays** - Show read-only data without authentication  
✅ **Embedded widgets** - Display data on external sites  
✅ **Simple interfaces** - When you don't need metadata (fields, filters, etc.)  
✅ **Performance** - Skip unnecessary metadata fetch

## When to Use CollectionProvider Instead

❌ Use `CollectionProvider` for:
- **Admin interfaces** - Need access to field definitions, filters, grid config
- **Dynamic forms** - Need field definitions to build the form UI
- **Complex grids** - Need filter/grid configuration from metadata
- **CRUD with validation** - Need field types and validation rules
- **Update/Delete operations** - Need full CRUD operations

## Comparison

### RecordsProvider (Simple, Public)
```jsx
<RecordsProvider route="gateway/v1/events">
  <PublicForm />
</RecordsProvider>
```
- ✅ No authentication required
- ✅ Simple API
- ✅ Lightweight
- ❌ No metadata access
- ❌ Limited to create + read

### CollectionProvider (Full Featured, Admin)
```jsx
<CollectionProvider collectionKey="events">
  <AdminInterface />
</CollectionProvider>
```
- ✅ Full metadata access
- ✅ Complete CRUD operations
- ✅ Field definitions, filters, grid config
- ❌ Requires authentication
- ❌ More complex API

## Notes

- **No metadata** - RecordsProvider doesn't fetch collection info (fields, filters, etc.)
- **Route format** - Must be full path like `'gateway/v1/events'`, not just `'events'`
- **Query params work** - Pass `queryParams` for pagination, filtering, etc.
- **Create only** - Currently supports read + create. Update/delete should use CollectionProvider
