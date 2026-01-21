# Gateway Builder (Exta) - Technical Analysis

## Status: Plugin Files Now Auto-Generated ✅

**Fixed:** The Builder now automatically generates WordPress plugin files when you create extensions and collections.

### What Happens Now

When you create an extension in the Builder:

1. **User creates extension "My Extension"** via React UI
2. **POST to** `/gateway/v1/extensions`
3. **Routes.php:379-443** runs `createExtension()`
4. **Creates JSON files:**
   ```
   wp-content/gateway/extensions/my_extension/
   ├── extension.json          ← Created ✓
   └── collections/            ← Created ✓
   ```

5. **AND creates plugin files:**
   ```
   wp-content/plugins/my-extension/         ← Created ✓
   ├── my-extension.php                     ← Created ✓
   └── lib/Collections/                     ← Created ✓
   ```

6. **When you add a collection:**
   - JSON saved to `wp-content/gateway/extensions/my_extension/collections/products.json`
   - PHP class generated to `wp-content/plugins/my-extension/lib/Collections/Products.php`

### Implementation Details

**Plugin Generation (Routes.php:448-558):**
```php
private function generatePluginFiles($extension_key, $extension_data)
{
    // Convert extension_key to plugin slug (my_extension → my-extension)
    $plugin_slug = str_replace('_', '-', $extension_key);

    // Generate namespace (my_extension → MyExtension)
    $namespace = str_replace('_', '', ucwords($extension_key, '_'));

    // Create plugin directory
    $plugin_dir = WP_PLUGIN_DIR . '/' . $plugin_slug;
    wp_mkdir_p($plugin_dir . '/lib/Collections');

    // Generate main plugin file from template
    $template = file_get_contents(GATEWAY_PATH . 'templates/scaffold/plugin_main.php');
    $plugin_code = str_replace(
        ['{{PROJECT_NAME}}', '{{PROJECT_SLUG}}', '{{NAMESPACE}}', '{{CONSTANT_PREFIX}}'],
        [$project_name, $plugin_slug, $namespace, strtoupper($extension_key)],
        $template
    );
    file_put_contents($plugin_dir . '/' . $plugin_slug . '.php', $plugin_code);
}
```

**Collection Class Generation (Routes.php:127-134):**
```php
// In saveCollection() method
$plugin_slug = str_replace('_', '-', $extension_key);
$namespace = str_replace('_', '', ucwords($extension_key, '_'));

\Gateway\Collections\FileFromData::generateCollectionClass(
    $json_data,
    $plugin_slug,
    $namespace
);
```

**Collection Update Handling (Routes.php:254-268):**
- Regenerates collection PHP class when updated
- Deletes old class file if collection key changed
- Keeps plugin in sync with JSON definitions

## Current Builder Capabilities

### What Works Now

**Extension Management (JSON only):**
- Create extension → `wp-content/gateway/extensions/{key}/extension.json`
- Read extensions → GET `/gateway/v1/extensions`
- File structure: `/lib/Exta/Routes.php:379-443`

**Collection Management (JSON only):**
- Create collection → `wp-content/gateway/extensions/{key}/collections/{name}.json`
- Update collection → PUT `/gateway/v1/extensions/{key}/collections/{name}`
- Auto-save with 1.5s debounce
- File structure: `/lib/Exta/Routes.php:61-254`

**Field Configuration:**
- Types: text, textarea, number, email, url, date, checkbox, select
- Reorderable with up/down arrows
- Component: `/react/apps/exta/src/components/FieldEditor.js`

**Filter Configuration:**
- Types: text, select, number, date, date_range, checkbox
- Linked to field names
- Component: `/react/apps/exta/src/components/FilterEditor.js`

**Column Configuration:**
- Display configuration for data grids
- Sortable toggle per column
- Component: `/react/apps/exta/src/components/ColumnEditor.js`

### Data Storage Format

**Extension JSON** (`wp-content/gateway/extensions/{key}/extension.json`):
```json
{
  "title": "My Extension",
  "key": "my_extension"
}
```

**Collection JSON** (`wp-content/gateway/extensions/{key}/collections/{name}.json`):
```json
{
  "title": "Products",
  "key": "products",
  "fields": [
    {"type": "text", "label": "Product Name", "name": "product_name"},
    {"type": "number", "label": "Price", "name": "price"}
  ],
  "filters": [
    {"type": "text", "field": "product_name", "label": "Search Products"}
  ],
  "columns": [
    {"field": "product_name", "label": "Name", "sortable": true},
    {"field": "price", "label": "Price", "sortable": true}
  ]
}
```

## How Extensions Should Work (When Complete)

### Step 1: Build in UI
User creates extension and collections via Builder interface → JSON files saved

### Step 2: Generate Plugin (Missing)
Click "Generate Plugin" → Creates actual WordPress plugin in `wp-content/plugins/`

### Step 3: Activate Plugin
Plugin appears in WordPress Plugins page → Admin activates it

### Step 4: Plugin Registers Collections
On `gateway_loaded` hook, plugin auto-registers its collections with Gateway

### Step 5: Collections Available
Collections appear in admin, REST API works, forms/grids render

## Code Locations Reference

### Backend (PHP)

**API Routes:** `/lib/Exta/Routes.php`
- Line 25-34: Collections GET/POST endpoint
- Line 36-40: Collection PUT/PATCH endpoint
- Line 42-46: Extensions GET endpoint
- Line 48-52: Extensions POST endpoint
- Line 61-163: `saveCollection()` - Creates collection JSON
- Line 171-254: `updateCollection()` - Updates collection JSON, handles renames
- Line 262-315: `getCollections()` - Lists all collections in extension
- Line 323-371: `getExtensions()` - Lists all extensions
- Line 379-443: `createExtension()` - Creates extension directory + JSON

**Code Generator:** `/lib/Collections/FileFromData.php`
- Line 18-84: `generateCollectionClass()` - Creates PHP collection class from JSON
- Line 58: Converts fields array to PHP code
- Line 72: Saves to `{plugin}/lib/Collections/{ClassName}.php`

**Templates:**
- `/templates/scaffold/collection_class.php` - Collection PHP class template
- `/templates/scaffold/plugin_main.php` - Main plugin file template (lines 96-119 show collection auto-registration)

**Extension System:**
- `/lib/Extension.php` - Base Extension class for plugin extensions
- `/lib/Extensions/ExtensionRegistry.php` - Registry for PHP extensions (not used by JSON extensions)

**Admin Menu:** `/lib/Admin/Builder.php`
- Line 19-35: Registers "Builder" submenu under Gateway
- Line 24-65: Enqueues React app on builder page
- Line 56-64: Localizes API URL and nonce for React

### Frontend (React)

**Entry Point:** `/react/apps/exta/src/index.js`
**Router:** `/react/apps/exta/src/App.js`

**Pages:**
- `pages/ExtensionCreate.js` - Create new extension form
- `pages/ExtensionView.js` - View extension + collections list
- `pages/CollectionCreate.js` - Create new collection in extension
- `pages/CollectionEditor.js` - Edit collection (fields/filters/columns), auto-save

**Components:**
- `components/ExtensionCreateForm.js` - Extension form (title → key)
- `components/ExtensionSelector.js` - Dropdown to switch extensions
- `components/CollectionCreateForm.js` - Collection form (title → key)
- `components/FieldEditor.js` - Field row editor (type, label, name)
- `components/FilterEditor.js` - Filter row editor (type, field, label)
- `components/ColumnEditor.js` - Column row editor (field, label, sortable)

**State Management:**
- `context/ExtensionListContext.js` - All extensions list
- `context/ActiveExtensionContext.js` - Currently selected extension + its collections

**Build Output:** `/react/apps/exta/build/`
- `index.js` - Compiled React app
- `index.css` - Compiled styles
- `index.asset.php` - WordPress dependencies

## Summary

### Current State
- ✅ Builder UI fully functional
- ✅ JSON storage working perfectly
- ✅ All CRUD operations for extensions/collections work
- ✅ Auto-save prevents data loss
- ✅ **Plugin files auto-generated when creating extensions**
- ✅ **Collection classes auto-generated when adding/updating collections**

### How It Works Now

**Create Extension:**
1. User fills out form in Exta UI (title → key)
2. POST to `/gateway/v1/extensions`
3. Creates JSON in `wp-content/gateway/extensions/{key}/`
4. Generates plugin in `wp-content/plugins/{key}/`
5. **Plugin automatically activated**
6. **UI redirects to extension detail page** (not dashboard)
7. User immediately sees their extension with option to add collections
8. If activation fails, yellow warning shown with error details

**Add Collection:**
1. User creates collection with fields/filters/columns
2. POST to `/gateway/v1/extensions/{key}/collections`
3. Saves JSON to `extensions/{key}/collections/{name}.json`
4. Generates PHP class to `plugins/{key}/lib/Collections/{Name}.php`
5. Collection auto-registers when plugin activated

**Update Collection:**
1. User edits fields/filters/columns (auto-save 1.5s debounce)
2. PUT to `/gateway/v1/extensions/{key}/collections/{name}`
3. Updates JSON file
4. Regenerates PHP class file
5. If key changed, deletes old PHP class file

### Generated Plugin Structure

```
wp-content/plugins/my-extension/
├── my-extension.php                    # Main plugin file (from template)
└── lib/
    └── Collections/
        ├── Products.php                # Generated from products.json
        ├── Orders.php                  # Generated from orders.json
        └── ...                         # One file per collection
```

### Activation Flow

1. **Build** - User creates extension in Builder
2. **Auto-Activate** - Plugin automatically activated (no manual step needed)
3. **Redirect** - UI navigates to extension detail page
4. **Add Collections** - User adds collections via Builder UI
5. **Auto-Generate** - Collection PHP classes generated on save
6. **Register** - Plugin hooks into `gateway_loaded` and registers collections
7. **Available** - Collections appear in Gateway admin, REST API works

### Error Handling

**Plugin Activation Errors:**
- Detected via `activate_plugin()` and `is_plugin_active()` checks
- Reported in API response with `plugin_activated: false` and `activation_error` message
- Displayed in yellow warning banner in UI
- Extension still created (can fix code and manually activate later)
- Common issues: syntax errors, missing dependencies, namespace conflicts

The Builder is now fully functional - extensions are immediately converted to working, activated WordPress plugins.
