# @arcwp/gateway-data

Shared data layer for Gateway collections - provides unified API access and state management.

## Overview

This package solves the problem of duplicate data fetching and lack of shared state between `@arcwp/gateway-forms` and `@arcwp/gateway-grids` packages. It provides:

- **Unified API client** with standardized authentication
- **Shared state management** via React Context
- **Provider-based architecture** for easy integration
- **Automatic state synchronization** between Forms and Grids
- **Separation of concerns**: Collection Info vs Collection Records

## Installation

```bash
npm install @arcwp/gateway-data
```

## Quick Start

### Basic Usage

```jsx
import { CollectionProvider, useCollectionRecords } from '@arcwp/gateway-data';

// Wrap your app with CollectionProvider
function App() {
  return (
    <CollectionProvider collectionKey="events">
      <EventGrid />
      <EventForm />
    </CollectionProvider>
  );
}

// Use hooks in your components
function EventGrid() {
  const { records, loading, deleteRecord } = useCollectionRecords();

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {records.map(record => (
        <li key={record.id}>
          {record.title}
          <button onClick={() => deleteRecord(record.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

function EventForm() {
  const { createRecord, updateRecord } = useCollectionRecords();
  const { collection } = useCollectionInfo();

  const handleSubmit = async (data) => {
    if (data.id) {
      await updateRecord(data.id, data);
    } else {
      await createRecord(data);
    }
    // EventGrid automatically refreshes! 🎉
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## API Reference

### Providers

#### `<CollectionProvider>`

Main provider for a specific collection. Manages both collection metadata and records.

```jsx
<CollectionProvider
  collectionKey="events"
  queryParams={{ per_page: 50 }}
  autoLoad={true}
>
  <YourComponents />
</CollectionProvider>
```

**Props:**
- `collectionKey` (string, required): Collection key (e.g., 'events', 'tickets')
- `queryParams` (object, optional): Query parameters for fetching records
- `autoLoad` (boolean, optional): Auto-load records on mount (default: true)

### Hooks

#### `useCollectionInfo()`

Access collection metadata (fields, routes, etc.)

```jsx
const { collection, loading, error, refresh } = useCollectionInfo();

// collection.fields - Field definitions
// collection.routes - API routes
// collection.fillable - Fillable fields
// collection.grid - Grid configuration
// collection.filters - Filter configuration
```

**Returns:**
- `collection` (object): Collection metadata
- `loading` (boolean): Loading state
- `error` (string|null): Error message
- `refresh` (function): Refresh collection metadata

#### `useCollectionRecords()`

Access collection records and CRUD operations

```jsx
const {
  records,
  loading,
  error,
  createRecord,
  updateRecord,
  deleteRecord,
  refresh,
  getRecordById
} = useCollectionRecords();

// Create
await createRecord({ title: 'New Event' });

// Update
await updateRecord(123, { title: 'Updated Event' });

// Delete
await deleteRecord(123);

// Get by ID
const record = getRecordById(123);
```

**Returns:**
- `records` (array): Array of records
- `loading` (boolean): Loading state
- `error` (string|null): Error message
- `createRecord` (function): Create a new record
- `updateRecord` (function): Update a record by ID
- `deleteRecord` (function): Delete a record by ID
- `refresh` (function): Manually refresh records
- `getRecordById` (function): Get a record by ID from current records

#### `useRecord(recordId)`

Access a single record by ID

```jsx
const { record, loading, error, update, remove, refresh } = useRecord(123);

// Update this record
await update({ title: 'Updated Title' });

// Delete this record
await remove();
```

**Parameters:**
- `recordId` (number|string): Record ID

**Returns:**
- `record` (object|null): Record object
- `loading` (boolean): Loading state
- `error` (string|null): Error message
- `update` (function): Update this record
- `remove` (function): Delete this record
- `refresh` (function): Refresh all records

### Direct API Access

You can also import API functions directly for use outside of React components:

```js
import { collectionApi } from '@arcwp/gateway-data';

// Fetch collections
const collections = await collectionApi.fetchCollections();

// Fetch a collection
const collection = await collectionApi.fetchCollection('events');

// Fetch records
const records = await collectionApi.fetchRecords('gateway/v1', 'events');

// CRUD operations
const newRecord = await collectionApi.createRecord('gateway/v1', 'events', data);
const updated = await collectionApi.updateRecord('gateway/v1', 'events', 123, data);
await collectionApi.deleteRecord('gateway/v1', 'events', 123);
```

## Authentication

The package supports multiple authentication methods with automatic fallback:

1. **window.gatewayAuth** (for headless environments)
   ```js
   window.gatewayAuth = { username: 'admin', password: 'pass' };
   ```

2. **window.gatewayAdminScript.nonce** (WordPress nonce)
   ```php
   wp_localize_script('my-script', 'gatewayAdminScript', ['nonce' => wp_create_nonce('wp_rest')]);
   ```

3. **window.wpApiSettings.nonce** (fallback WordPress nonce)

## Advanced Usage

### Multiple Collections

```jsx
function App() {
  return (
    <>
      <CollectionProvider collectionKey="events">
        <EventsSection />
      </CollectionProvider>

      <CollectionProvider collectionKey="tickets">
        <TicketsSection />
      </CollectionProvider>
    </>
  );
}
```

### Query Parameters

```jsx
// Pagination
<CollectionProvider collectionKey="events" queryParams={{ page: 1, per_page: 20 }}>
  <EventsList />
</CollectionProvider>

// Filtering
<CollectionProvider collectionKey="events" queryParams={{ status: 'published' }}>
  <PublishedEvents />
</CollectionProvider>
```

### Manual Control

```jsx
function ManualLoadExample() {
  return (
    <CollectionProvider collectionKey="events" autoLoad={false}>
      <ManualLoader />
    </CollectionProvider>
  );
}

function ManualLoader() {
  const { records, loading, refresh } = useCollectionRecords();

  return (
    <div>
      <button onClick={refresh}>Load Events</button>
      {loading && <p>Loading...</p>}
      {records.map(record => <div key={record.id}>{record.title}</div>)}
    </div>
  );
}
```

## Migration Guide

### From @arcwp/gateway-forms

**Before:**
```jsx
import { getCollection, getRecord, updateRecord } from '@arcwp/gateway-forms/services/api';

const collection = await getCollection('events');
const record = await getRecord(collection.routes.endpoint, 123);
await updateRecord(collection.routes.endpoint, 123, data);
```

**After:**
```jsx
import { CollectionProvider, useCollectionInfo, useRecord } from '@arcwp/gateway-data';

<CollectionProvider collectionKey="events">
  <MyForm recordId={123} />
</CollectionProvider>

function MyForm({ recordId }) {
  const { collection } = useCollectionInfo();
  const { record, update } = useRecord(recordId);

  await update(data);
}
```

### From @arcwp/gateway-grids

**Before:**
```jsx
import { fetchCollection, fetchCollectionData, deleteRecord } from '@arcwp/gateway-grids/services/collectionService';

const collection = await fetchCollection('events');
const data = await fetchCollectionData(collection.routes.namespace, collection.routes.route);
await deleteRecord(collection.routes.namespace, collection.routes.route, 123);
```

**After:**
```jsx
import { CollectionProvider, useCollectionRecords } from '@arcwp/gateway-data';

<CollectionProvider collectionKey="events">
  <MyGrid />
</CollectionProvider>

function MyGrid() {
  const { records, deleteRecord } = useCollectionRecords();

  await deleteRecord(123);
}
```

## Benefits

✅ **No duplicate fetching** - Collection metadata cached and shared
✅ **Automatic synchronization** - Forms update, Grids refresh automatically
✅ **Consistent API** - Standardized method names and HTTP verbs
✅ **Better performance** - Optimistic updates with rollback
✅ **Simpler code** - Provider pattern reduces boilerplate
✅ **Type safety ready** - Easy to add TypeScript definitions

## License

ISC
