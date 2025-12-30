# Gateway Data Package - Examples

This directory contains comprehensive examples showing how to use `@arcwp/gateway-data` in various scenarios.

## Examples Overview

### 1. IntegratedExample.jsx

**Integrated Grid + Form with Shared State**

Demonstrates the primary use case: combining `@arcwp/gateway-grids` and `@arcwp/gateway-forms` with shared state management. When a record is updated in the form, the grid automatically refreshes.

**Key Features:**
- CollectionProvider wrapping both Grid and Form
- Automatic synchronization between components
- Click to edit workflow
- Real-time updates

**Use this when:**
- Building admin interfaces with list + edit views
- You need Forms and Grids to share data
- You want automatic refresh on CRUD operations

### 2. StandaloneExample.jsx

**Standalone Usage Without Forms or Grids**

Shows how to use the data package directly without the Forms or Grids packages. Perfect for custom implementations.

**Key Features:**
- Direct use of hooks without pre-built components
- Custom list rendering
- Inline editing
- Create new record form
- Display collection metadata

**Use this when:**
- You need custom UI that doesn't fit Grid/Form patterns
- Building lightweight components
- You want full control over rendering

### 3. AdvancedExample.jsx

**Advanced Usage Patterns**

Comprehensive examples showing advanced features and patterns.

**Includes:**

#### Example 1: Multiple Collections
- Using multiple CollectionProviders in one app
- Side-by-side collection displays
- Independent state management per collection

#### Example 2: Query Parameters
- Public collections with default auth
- Private collections with Basic Auth
- Nested provider hierarchy

#### Example 4: Query Parameters
- Filtering by status
- Pagination controls
- Dynamic query parameters
- Re-fetching on parameter changes

#### Example 5: Manual Loading Control
- Disable auto-load with `autoLoad={false}`
- Manual refresh button
- Controlled data fetching

#### Example 6: Error Handling
- Collection not found errors
- Network errors
- Retry mechanisms
- User-friendly error displays

## Running the Examples

### In a React App

```bash
# Install dependencies
npm install @arcwp/gateway-data

# Import and use
import { EventsApp } from '@arcwp/gateway-data/examples/IntegratedExample';

function App() {
  return <EventsApp />;
}
```

### In WordPress

```php
// Enqueue your React app
wp_enqueue_script(
  'events-app',
  get_template_directory_uri() . '/build/events-app.js',
  ['react', 'react-dom'],
  '1.0.0',
  true
);

// Provide API configuration
wp_localize_script('events-app', 'gatewayAdminScript', [
  'apiUrl' => rest_url(),
  'nonce' => wp_create_nonce('wp_rest'),
]);
```

### Standalone HTML

```html
<!DOCTYPE html>
<html>
<head>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
</head>
<body>
  <div id="root"></div>

  <script>
    // Set up window globals for auth
    window.wpApiSettings = {
      root: '/wp-json/',
      nonce: 'your-nonce-here'
    };
  </script>

  <script src="your-app-bundle.js"></script>
</body>
</html>
```

## Common Patterns

### Pattern 1: List-Detail View

```jsx
<CollectionProvider collectionKey="events">
  <EventsList onSelect={handleSelect} />
  <EventDetails recordId={selectedId} />
</CollectionProvider>
```

### Pattern 2: Modal Edit Form

```jsx
<CollectionProvider collectionKey="events">
  <Grid />
  {isModalOpen && (
    <Modal>
      <AppForm recordId={editingId} />
    </Modal>
  )}
</CollectionProvider>
```

### Pattern 3: Master-Detail with Different Collections

```jsx
<CollectionProvider collectionKey="events">
  <EventsList onSelect={handleSelect} />

  <CollectionProvider collectionKey="tickets">
    <TicketsForEvent eventId={selectedEventId} />
  </CollectionProvider>
</CollectionProvider>
```

## Authentication Examples

### WordPress Nonce (Default)

```js
// No configuration needed - reads from window globals
<CollectionProvider collectionKey="events">
  <YourComponent />
</CollectionProvider>
```

### Basic Auth for Headless

```js
// Set via window global
window.gatewayAuth = { username: 'admin', password: 'pass' };

<CollectionProvider collectionKey="events">
  <YourComponent />
</CollectionProvider>
```

### Custom Token Auth

```js
// Use the API client directly
import { getApiClient } from '@arcwp/gateway-data';

const client = getApiClient();
client.interceptors.request.use(config => {
  config.headers['Authorization'] = `Bearer ${yourToken}`;
  return config;
});
```

## Performance Tips

1. **Shared Providers**: Keep CollectionProvider as high in the tree as possible to share state

```jsx
// Good - shared state
<CollectionProvider collectionKey="events">
  <Grid />
  <Form />
</CollectionProvider>

// Bad - separate state, duplicate fetching
<CollectionProvider collectionKey="events">
  <Grid />
</CollectionProvider>
<CollectionProvider collectionKey="events">
  <Form />
</CollectionProvider>
```

2. **Query Parameters**: Use memoized values to prevent unnecessary re-fetches

```jsx
const queryParams = useMemo(() => ({
  status: selectedStatus,
  page: currentPage
}), [selectedStatus, currentPage]);

<CollectionProvider collectionKey="events" queryParams={queryParams}>
```

3. **Conditional Loading**: Use `autoLoad={false}` for data you don't need immediately

```jsx
<CollectionProvider collectionKey="events" autoLoad={false}>
  <LazyLoadedComponent />
</CollectionProvider>
```

## Troubleshooting

### Records not refreshing after update

**Problem**: Grid doesn't update when form saves
**Solution**: Ensure both components are within the same `CollectionProvider`

### Authentication errors

**Problem**: 401 Unauthorized errors
**Solution**: Check that nonce or Basic Auth is properly configured

### Collection not found

**Problem**: 404 error when loading collection
**Solution**: Verify the collection key matches what's registered in PHP

### Stale data

**Problem**: Data doesn't match server
**Solution**: Call `refresh()` from hooks to force re-fetch

## Next Steps

1. Review the [main README](../README.md) for API reference
2. Check out the [Forms package](../../forms/README.md) for form integration
3. See the [Grids package](../../grids/README.md) for grid integration
4. Explore the [source code](../src) for advanced customization

## Contributing

Found a bug or have a suggestion? Please open an issue on GitHub!
