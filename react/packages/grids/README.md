# @gateway/grid

A reusable React Grid component library built with TanStack Table for WordPress Gateway collections.

## Features

- **TanStack Table Integration**: Powerful data table with built-in sorting, filtering, and pagination
- **Tailwind 4 Styling**: Modern, responsive UI with Tailwind CSS
- **Client-side Operations**: All sorting, filtering, and pagination handled client-side for fast interactions
- **WordPress Integration**: Seamlessly integrates with WordPress via wp-scripts
- **REST API**: Fetches data from Gateway collections via REST API endpoints
- **Axios**: HTTP requests using axios with automatic nonce authentication
- **Package Ready**: Can be used as a local npm package in other apps

## Installation

### As a Local NPM Package

In your admin app, install the grid package:

```bash
npm install file:../grid
```

Or add to your `package.json`:

```json
{
  "dependencies": {
    "@gateway/grid": "file:../grid"
  }
}
```

### Standalone Development

1. Navigate to the grid app directory:
```bash
cd react/apps/grid
```

2. Install dependencies:
```bash
npm install
```

3. Build for library use:
```bash
npm run build
```

Or build standalone version:
```bash
npm run build:standalone
```

## Development

### Library Mode (for use in other apps)
```bash
npm start
```

### Standalone Mode (for WordPress plugin)
```bash
npm run start:standalone
```

## Usage

### As a Package in Your React App

#### Basic Grid Component

```jsx
import { Grid } from '@gateway/grid';

function MyAdminPage() {
  return (
    <Grid collectionKey="tickets" />
  );
}
```

#### Using DataTable Directly

If you want more control and fetch your own data:

```jsx
import { DataTable } from '@gateway/grid';
import { useState, useEffect } from 'react';

function CustomGrid() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  // ... fetch your data

  return (
    <DataTable
      data={data}
      columns={columns}
      loading={false}
    />
  );
}
```

#### Using Collection Services

Access the API service functions directly:

```jsx
import {
  fetchCollection,
  fetchCollectionData,
  createRecord,
  updateRecord,
  deleteRecord
} from '@gateway/grid';

// Fetch collection metadata
const collection = await fetchCollection('tickets');

// Fetch collection data
const data = await fetchCollectionData('gateway/v1', 'tickets');

// Create a record
const newRecord = await createRecord('gateway/v1', 'tickets', {
  title: 'New Ticket',
  status: 'open'
});

// Update a record
const updated = await updateRecord('gateway/v1', 'tickets', 123, {
  status: 'closed'
});

// Delete a record
await deleteRecord('gateway/v1', 'tickets', 123);
```

### Standalone Usage (WordPress Plugin)

#### In PHP Templates or Shortcodes

Use the helper function to render a grid:

```php
<?php
// Render a grid for the 'tickets' collection
echo gateway_grid('tickets');

// With additional attributes
echo gateway_grid('tickets', [
    'class' => 'my-custom-class',
    'theme' => 'dark'
]);
?>
```

#### Using the Grid Class Directly

```php
<?php
use Gateway\Grid;

// Render a grid
echo Grid::render('tickets');
?>
```

#### In HTML (Manual)

```html
<div data-gateway-grid data-collection="tickets"></div>
```

The React app will automatically find all elements with `data-gateway-grid` attribute and initialize the grid.

## Collection Requirements

For the grid to work, you need:

1. A registered Gateway collection with a unique key
2. The collection must be accessible via the REST API endpoint: `gateway/v1/collections/{key}`
3. The collection's data endpoint (e.g., `gateway/v1/tickets`) must be available

### Example Collection

```php
<?php
namespace Gateway\Collections;

use Gateway\Collection;

class TicketCollection extends Collection
{
    protected $key = 'tickets';
    protected $table = 'gateway_tickets';

    protected $fillable = ['title', 'description', 'status', 'priority'];

    protected $fields = [
        'title' => [
            'label' => 'Title',
            'type' => 'text',
        ],
        'description' => [
            'label' => 'Description',
            'type' => 'textarea',
        ],
        'status' => [
            'label' => 'Status',
            'type' => 'select',
        ],
        'priority' => [
            'label' => 'Priority',
            'type' => 'select',
        ],
    ];

    protected $routes = [
        'enabled' => true,
        'namespace' => 'gateway',
        'version' => 'v1',
        'route' => 'tickets',
    ];
}

// Register the collection
TicketCollection::register();
?>
```

## API Reference

### Components

#### `<Grid>`

Main grid component that handles fetching collection metadata and data.

**Props:**
- `collectionKey` (string, required): The key of the collection to display

#### `<DataTable>`

Low-level table component using TanStack Table.

**Props:**
- `data` (array, required): Array of data objects to display
- `columns` (array, required): TanStack Table column definitions
- `loading` (boolean): Show loading state

### Services

#### Collection Services

All services are exported from `@gateway/grid`:

- `fetchCollections()`: Get all registered collections
- `fetchCollection(key)`: Get a single collection by key
- `fetchCollectionData(namespace, route, params)`: Fetch collection records
- `fetchRecord(namespace, route, id)`: Fetch a single record
- `createRecord(namespace, route, data)`: Create a new record
- `updateRecord(namespace, route, id, data)`: Update a record
- `deleteRecord(namespace, route, id)`: Delete a record

## API Integration

The grid uses the following endpoints:

### Get Collection Metadata
```
GET /wp-json/gateway/v1/collections/{key}
```

Returns collection configuration including fields, routes, and settings.

### Get Collection Data
```
GET /wp-json/gateway/v1/{route}
```

Returns all records from the collection. The grid handles pagination, sorting, and filtering client-side.

## Features in Detail

### Global Search
Type in the search box to filter across all columns simultaneously.

### Column Filters
Each column header has an individual filter input for precise filtering.

### Sorting
Click column headers to toggle sorting (ascending/descending/none).

### Pagination
- Navigate between pages with first/previous/next/last buttons
- Adjust page size (10, 20, 30, 40, 50 rows per page)
- See current page and total pages

### Client-side Processing
All data operations (filtering, sorting, pagination) happen in the browser for instant response.

## Project Structure

```
grid/
├── build/                  # Compiled output (generated)
├── node_modules/          # Dependencies (generated)
├── src/
│   ├── components/
│   │   └── DataTable.js   # TanStack Table component
│   ├── services/
│   │   └── collectionService.js  # API service with axios
│   ├── App.js            # Main app component
│   ├── index.js          # Entry point
│   └── index.css         # Tailwind imports
├── package.json          # Dependencies
├── webpack.config.js     # Webpack configuration
└── README.md            # This file
```

## Dependencies

### Production
- `@tanstack/react-table` - Table management
- `axios` - HTTP requests
- `tailwindcss` & `@tailwindcss/postcss` - Styling

### Development
- `@wordpress/scripts` - Build tools
- `autoprefixer` - CSS vendor prefixing
- `postcss` - CSS processing

### Peer Dependencies

When using as a package, your app must provide:
- `@wordpress/element` (^5.0.0 || ^6.0.0)
- `react` (^18.0.0)
- `react-dom` (^18.0.0)

## WordPress Integration

The grid app uses WordPress externals to avoid bundling React twice:

```javascript
externals: {
  react: 'React',
  'react-dom': 'ReactDOM',
  '@wordpress/element': 'wp.element'
}
```

WordPress provides these libraries globally, keeping bundle size small.

## REST API Authentication

The app automatically includes the WordPress REST API nonce in all requests for authentication:

```javascript
config.headers['X-WP-Nonce'] = wpApiSettings.nonce;
```

## Customization

### Styling
Modify `src/index.css` or component classes. Tailwind 4 is configured via CSS imports.

### Table Behavior
Edit `src/components/DataTable.js` to customize:
- Column definitions
- Filter behavior
- Pagination options
- Sorting logic

### API Calls
Modify `src/services/collectionService.js` to:
- Add new endpoints
- Change request/response handling
- Add error handling

## Building for Production

```bash
npm run build
```

This creates optimized files in the `build/` directory:
- `index.js` - Minified JavaScript
- `index.css` - Processed CSS
- `index-rtl.css` - RTL version
- `index.asset.php` - WordPress asset metadata

## Troubleshooting

### Grid not appearing
1. Check that the collection key is correct
2. Verify the build files exist in `build/`
3. Check browser console for errors
4. Ensure REST API is accessible

### Data not loading
1. Verify collection is registered
2. Check REST API endpoint exists: `/wp-json/gateway/v1/collections/{key}`
3. Check collection data endpoint: `/wp-json/gateway/v1/{route}`
4. Look for authentication issues (nonce)

### Build errors
1. Delete `node_modules/` and `package-lock.json`
2. Run `npm install` again
3. Check Node.js version compatibility
