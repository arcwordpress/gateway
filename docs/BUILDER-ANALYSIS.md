# Gateway Builder (Exta) - Technical Analysis

## Critical Issue: Plugin Files Not Generated

**Problem:** The Builder UI saves JSON files but does NOT generate actual WordPress plugin files.

### What Actually Happens

When you create an extension in the Builder:

1. **User creates extension "My Extension"** via React UI
2. **POST to** `/gateway/v1/extensions`
3. **Routes.php:379-443** runs `createExtension()`
4. **Creates only:**
   ```
   wp-content/gateway/extensions/my_extension/
   ├── extension.json          ← Created ✓
   └── collections/            ← Created ✓
   ```

5. **Does NOT create:**
   ```
   wp-content/plugins/my-extension/         ← Missing!
   ├── my-extension.php                     ← Missing!
   ├── lib/Collections/MyCollection.php     ← Missing!
   └── ...                                  ← Missing!
   ```

### Why Plugin Files Aren't Created

**Missing Code:** There is no endpoint or button to trigger plugin generation.

**What exists but isn't wired up:**
- `FileFromData::generateCollectionClass()` - Can generate collection PHP files
- `templates/scaffold/collection_class.php` - Template for collections
- `templates/scaffold/plugin_main.php` - Template for main plugin file

**What's missing:**
- No "Generate Plugin" or "Export" button in Exta UI
- No API endpoint like `POST /gateway/v1/extensions/{key}/generate`
- No code to instantiate full plugin from JSON

### The Architecture Gap

```
Current Flow (Incomplete):
Builder UI → JSON files in wp-content/gateway/extensions/ → [NOTHING]

Expected Flow:
Builder UI → JSON files → Generate Plugin Code → wp-content/plugins/{plugin}/ → Working Plugin
```

### How to Fix This

**Add new endpoint to `/lib/Exta/Routes.php`:**

```php
register_rest_route('gateway/v1', '/extensions/(?P<extension_key>[^/]+)/generate', [
    'methods' => 'POST',
    'callback' => [$this, 'generatePlugin'],
    'permission_callback' => [$this, 'checkPermissions'],
]);
```

**Implement `generatePlugin()` method:**

```php
public function generatePlugin($request) {
    $extension_key = $request['extension_key'];
    $extension_dir = WP_CONTENT_DIR . '/gateway/extensions/' . $extension_key;

    // 1. Read extension.json
    $extension_json = json_decode(file_get_contents($extension_dir . '/extension.json'), true);

    // 2. Create plugin directory
    $plugin_slug = str_replace('_', '-', $extension_key);
    $plugin_dir = WP_PLUGIN_DIR . '/' . $plugin_slug;
    wp_mkdir_p($plugin_dir . '/lib/Collections');

    // 3. Generate main plugin file from template
    $template = file_get_contents(GATEWAY_PATH . 'templates/scaffold/plugin_main.php');
    $plugin_code = str_replace(
        ['{{PROJECT_NAME}}', '{{PROJECT_SLUG}}', '{{NAMESPACE}}', '{{CONSTANT_PREFIX}}'],
        [$extension_json['title'], $plugin_slug, ucfirst($extension_key), strtoupper($extension_key)],
        $template
    );
    file_put_contents($plugin_dir . '/' . $plugin_slug . '.php', $plugin_code);

    // 4. Generate collection classes from JSON
    $collections = glob($extension_dir . '/collections/*.json');
    foreach ($collections as $coll_file) {
        $coll_data = json_decode(file_get_contents($coll_file), true);
        \Gateway\Collections\FileFromData::generateCollectionClass(
            $coll_data,
            $plugin_slug,
            ucfirst($extension_key)
        );
    }

    return new \WP_REST_Response(['success' => true, 'plugin_path' => $plugin_dir], 200);
}
```

**Add button to React UI** in `ExtensionView.js`:

```jsx
<button onClick={() => generatePlugin()}>Generate Plugin</button>
```

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
- ❌ **No plugin file generation - Extensions stay as JSON only**

### To Make Extensions Work as Plugins
1. Add "Generate Plugin" endpoint to `Routes.php`
2. Implement logic to create plugin directory in `wp-content/plugins/`
3. Generate main plugin file from template
4. Generate collection class files for each JSON collection
5. Add "Generate Plugin" button to ExtensionView.js
6. Plugin will then appear in WordPress → Plugins to activate

### Estimated Work
- Backend endpoint: 1-2 hours
- React button/API call: 30 minutes
- Testing: 1 hour
- **Total: ~3 hours to make plugin generation work**

The Builder is 90% complete - just needs the plugin generation step to turn JSON definitions into installable WordPress plugins.
