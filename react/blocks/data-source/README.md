# GT Data Source Block

A generic data source block that enables using Gateway collections with the WordPress Interactivity API.

## Features

- **Generic Data Source**: Connect to any Gateway collection
- **Interactivity API**: Uses WordPress Interactivity API with view scripts
- **State Management**: Provides loading, error, and data states
- **Search & Filter**: Built-in search and filtering capabilities
- **Actions**: Sort, filter, refresh data

## Usage

1. Add the block to your page
2. Configure the collection slug in block settings
3. Use inner blocks to define your template
4. Reference interactivity directives in your inner content

### Example Template

```html
<div
  data-wp-interactive="gateway/data-source"
  data-wp-init="callbacks.init"
>
  <!-- Loading State -->
  <div data-wp-bind--hidden="!state.loading">
    Loading data...
  </div>

  <!-- Error State -->
  <div data-wp-bind--hidden="!state.error">
    <span data-wp-text="state.error"></span>
  </div>

  <!-- Search -->
  <input
    type="text"
    placeholder="Search..."
    data-wp-on--input="actions.updateSearch"
  />

  <!-- Records List -->
  <div data-wp-bind--hidden="!state.hasRecords">
    <p>Found <span data-wp-text="state.filteredCount"></span> records</p>

    <ul>
      <template data-wp-each--record="state.filteredRecords">
        <li>
          <strong data-wp-text="context.record.title"></strong>
        </li>
      </template>
    </ul>
  </div>

  <!-- Empty State -->
  <div data-wp-bind--hidden="state.hasRecords">
    No records found
  </div>
</div>
```

## Interactivity API Reference

### State

- `state.records` - All fetched records
- `state.filteredRecords` - Filtered records based on search
- `state.loading` - Loading status (boolean)
- `state.error` - Error message (string or null)
- `state.hasRecords` - Whether records exist (boolean)
- `state.totalRecords` - Total number of records
- `state.filteredCount` - Number of filtered records

### Actions

- `actions.updateSearch` - Update search query (use with data-wp-on--input)
- `actions.clearSearch` - Clear search query
- `actions.refresh` - Refresh data from collection
- `actions.sortBy` - Sort records (use data-field and data-direction attributes)
- `actions.filterBy` - Filter records (use data-field attribute)

### Callbacks

- `callbacks.init` - Initialize data source (use with data-wp-init)

## Build Configuration

⚠️ **IMPORTANT**: This block requires webpack configuration updates to work properly.

This block uses a **view script** (src/view.js) that needs to be built as an ES module for the WordPress Interactivity API. The current webpack config ONLY builds `src/index.js` files and will NOT build `src/view.js`.

### Required Webpack Configuration Update

Edit `/home/user/gateway/react/webpack.config.js` and update the entries generation:

**Current code (lines 13-16):**
```javascript
const entries = blocks.reduce((acc, block) => {
    acc[`${block}/build/index`] = path.join(blocksDir, block, 'src/index.js');
    return acc;
}, {});
```

**Updated code:**
```javascript
const entries = blocks.reduce((acc, block) => {
    // Build index.js (editor script)
    acc[`${block}/build/index`] = path.join(blocksDir, block, 'src/index.js');

    // Build view.js (frontend interactivity script) if it exists
    const viewScriptPath = path.join(blocksDir, block, 'src/view.js');
    if (fs.existsSync(viewScriptPath)) {
        entries[`${block}/build/view`] = viewScriptPath;
    }

    return acc;
}, {});
```

Without this change, the `build/view.js` file won't exist and the block will fail to load on the frontend.

### Experimental Features

This block uses:
- **API Version 3**: Required for viewScriptModule support
- **viewScriptModule**: ES module view script (requires WordPress 6.5+)
- **Interactivity API**: Experimental WordPress feature

Make sure your WordPress environment supports these features.

## Block Attributes

- `collectionSlug` (string): The slug of the Gateway collection to use
- `query` (object): Query parameters for filtering collection data
- `namespace` (string): Custom namespace for the interactivity store (default: "gateway/data-source")

## Development Notes

The view script is separate from the editor script:
- **src/index.js**: Editor-only script (block registration, inspector controls)
- **src/view.js**: Frontend script (interactivity API store and actions)

This separation ensures that interactivity code doesn't bloat the editor bundle.
