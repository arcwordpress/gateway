# Fetching a Collection and Rendering a List

Uses `CollectionProvider` + `useCollectionRecords()` from `@arcwp/gateway`.

---

## Basic pattern

Wrap your component tree in `CollectionProvider`, then read records with `useCollectionRecords()` inside it.

```jsx
import { CollectionProvider, useCollectionRecords } from '@arcwp/gateway';

function EventsList() {
    const {
        records,
        loading,
        error,
        deleteRecord,
        refresh,
    } = useCollectionRecords();

    if (loading) return <p>Loading...</p>;
    if (error)   return <p>Error: {error}</p>;

    return (
        <div>
            <button onClick={refresh}>Reload</button>
            <ul>
                {records.map(record => (
                    <li key={record.id}>
                        <strong>{record.title}</strong>
                        <span>{record.date}</span>
                        <button onClick={() => deleteRecord(record.id)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function EventsPage() {
    return (
        <CollectionProvider
            collectionKey="events"
            queryParams={{ orderby: 'date', order: 'desc' }}
        >
            <EventsList />
        </CollectionProvider>
    );
}
```

`record.title` and `record.date` are whatever fields your collection defines — field names match the keys set in the PHP collection schema.

`collectionKey` is the key you registered the collection with in PHP.

---

## Sort order

Pass `orderby` and `order` in `queryParams`. These are sent to the API as query parameters.

```jsx
// Newest first
queryParams={{ orderby: 'date', order: 'desc' }}

// Alphabetical
queryParams={{ orderby: 'title', order: 'asc' }}
```

`orderby` must be a field that exists on the collection. `order` is `'asc'` or `'desc'`.

---

## Pagination

```jsx
<CollectionProvider
    collectionKey="events"
    queryParams={{ orderby: 'date', order: 'desc', limit: 20, offset: 0 }}
>
```

---

## `CollectionProvider` props

| Prop | Required | Default | Purpose |
|------|----------|---------|---------|
| `collectionKey` | yes | — | Key of the registered Gateway collection |
| `queryParams` | no | `{}` | Query params passed to the API (`orderby`, `order`, `limit`, `offset`, `relations`) |
| `skipMetadata` | no | `false` | Skip fetching collection schema — use if you don't need field definitions |
| `autoLoad` | no | `true` | Fetch on mount; set to `false` to trigger manually via `refresh()` |

---

## What `useCollectionRecords()` returns

```js
const {
    records,       // array of record objects
    loading,       // boolean
    error,         // string | null
    createRecord,  // (data) => Promise
    updateRecord,  // (id, data) => Promise
    deleteRecord,  // (id) => Promise
    getRecordById, // (id) => record | undefined
    refresh,       // () => void — re-fetch
} = useCollectionRecords();
```

`records` is an array of plain objects. Each record has an `id` field plus whatever fields the collection defines.

---

## Accessing a single record

```jsx
import { useRecord } from '@arcwp/gateway';

function EventDetail({ id }) {
    const { record, loading, error } = useRecord(id);

    if (loading) return <p>Loading...</p>;
    if (!record) return <p>Not found.</p>;

    return <h1>{record.title}</h1>;
}
```

`useRecord()` must be rendered inside a `CollectionProvider`.

---

## Including related records

If your collection has relational fields, pass `relations: true`:

```jsx
queryParams={{ orderby: 'date', order: 'desc', relations: true }}
```

This tells the API to expand related records inline rather than returning IDs only.
