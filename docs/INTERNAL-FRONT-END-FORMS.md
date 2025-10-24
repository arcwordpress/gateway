# Internal Documentation: Front-End Forms System

## Purpose
This document maps the technical implementation of the front-end forms system in Gateway, identifying all code locations and the initialization flow.

## Critical Issues Identified

### Issue 1: Forms Not Initialized in Plugin.php
**Status:** BLOCKING - Forms cannot work without this

The `Forms\Render::init()` and `Forms\Shortcode::init()` are **NOT** called in Gateway's `Plugin.php`, but they ARE required.

**Location:** `Plugin.php:76-92` (init method)

**What's Missing:**
```php
// These lines are MISSING from Gateway Plugin.php:
Forms\Render::init();
Forms\Shortcode::init();
```

**Evidence:** In the original arc-blueprint plugin (`../arc-blueprint/Plugin.php:81,84`), these init calls are present and working.

**Impact:**
- Shortcode `[blueprint_form]` is never registered (line 12 in Shortcode.php never executes)
- Footer hooks never attach (lines 53-54 in Render.php never execute)
- Scripts never enqueue
- Forms never render

### Issue 2: Data Attribute Mismatch
**Status:** BLOCKING - JavaScript cannot find forms

**PHP Side:** `includes/Forms/Render.php:24`
- Renders: `data-schema="collection-name"`

**JavaScript Side:** `react/apps/form/src/index.js:9`
- Looks for: `data-collection`

**Impact:** The JavaScript searches for `[data-blueprint-form]` elements but reads the wrong attribute name, so `collectionKey` is always `null`.

### Issue 3: Gutenberg Block Registration
**Status:** Non-functional, should be removed

The Gutenberg block is registered in `includes/Forms/Shortcode.php:60-91` but was never properly implemented or tested.

## Code Locations Map

### PHP Backend

#### 1. Main Plugin Entry
**File:** `Plugin.php`
**Lines:** 44-145
**Purpose:** Main plugin class
**Current State:** Missing Forms init calls

#### 2. Form Renderer
**File:** `includes/Forms/Render.php`
**Lines:** 1-108
**Purpose:** Handles form HTML output and script enqueuing

**Key Methods:**
- `init()` (line 50): Hooks into wp_footer and admin_footer
- `form()` (line 13): Renders the form container div with data attributes
- `enqueue_scripts()` (line 70): Loads React app and localizes REST API settings
- `ensure_scripts_loaded()` (line 60): Fallback to ensure scripts load in footer

**Static Properties:**
- `$forms_registered` (line 7): Tracks if any forms rendered on page
- `$scripts_enqueued` (line 8): Prevents duplicate script enqueuing

**Dependencies:**
- Requires `GATEWAY_PATH` constant for asset file path (line 76)
- Requires `GATEWAY_URL` constant for build URL (line 83)
- Looks for `react/apps/form/build/index.asset.php` (line 76)

#### 3. Shortcode Handler
**File:** `includes/Forms/Shortcode.php`
**Lines:** 1-121
**Purpose:** Registers shortcode and Gutenberg block

**Key Methods:**
- `init()` (line 10): Registers shortcode and block on 'init' hook
- `render()` (line 22): Processes shortcode attributes and calls Render::form()
- `register_block()` (line 60): Registers Gutenberg block (non-functional)
- `render_block()` (line 99): Renders Gutenberg block

**Shortcode:** `[blueprint_form]`
**Attributes:**
- `schema` (required): Collection key
- `record_id` (optional): For edit mode
- `class` (optional): CSS classes
- `id` (optional): HTML ID

### React Frontend

#### 4. Entry Point
**File:** `react/apps/form/src/index.js`
**Lines:** 1-17
**Purpose:** Initializes React app on all form containers

**Flow:**
1. Finds all elements with `[data-blueprint-form]` attribute (line 6)
2. Reads `data-collection` attribute (line 9) - **BUG: should be data-schema**
3. Reads `data-record-id` attribute (line 10)
4. Creates React root and renders App component (lines 13-14)

**Dependencies:**
- `@wordpress/element` for React createRoot
- `./App` component

#### 5. App Component
**File:** `react/apps/form/src/App.js`
**Lines:** 1-9
**Purpose:** Root React component

**Props:**
- `collectionKey`: Collection schema name
- `recordId`: Optional record ID for edit mode

**Renders:** `<FormBuilder>` component from `@gateway/forms` package

#### 6. Build Output
**Directory:** `react/apps/form/build/`
**Files:**
- `index.js`: Compiled JavaScript
- `index.css`: Compiled styles
- `index-rtl.css`: RTL styles
- `index.asset.php`: WordPress asset dependencies and version

**Referenced in:** `includes/Forms/Render.php:76-103`

## Initialization Flow (When Working)

### Expected Flow:
1. **Plugin Init:** `Plugin.php` calls `Forms\Render::init()` and `Forms\Shortcode::init()`
2. **Shortcode Registration:** `Shortcode::init()` registers `[blueprint_form]` shortcode
3. **Content Rendering:** WordPress processes shortcode in content
4. **Shortcode Execution:** `Shortcode::render()` validates attributes and calls `Render::form()`
5. **HTML Output:** `Render::form()` outputs `<div data-blueprint-form data-schema="..."></div>`
6. **Footer Hook:** `Render::ensure_scripts_loaded()` runs in wp_footer
7. **Script Enqueue:** `Render::enqueue_scripts()` enqueues JS/CSS and localizes REST API settings
8. **Page Load:** Browser loads page with form container and scripts
9. **React Init:** `index.js` finds form elements and mounts React apps
10. **Form Render:** React fetches schema and renders form fields

### Current Broken Flow:
1. **Plugin Init:** `Plugin.php` does NOT call Forms init methods ❌
2. **Shortcode Registration:** Never happens ❌
3. **Content Rendering:** Shortcode appears as plain text `[blueprint_form ...]` ❌
4. **Everything else:** Never executes ❌

## Script Enqueuing Details

**Handle:** `gateway-forms`
**JavaScript:** `react/apps/form/build/index.js`
**CSS:** `react/apps/form/build/index.css`
**Load Position:** Footer (`wp_enqueue_script` 5th param = `true`)

**Localized Data:**
```javascript
wpApiSettings = {
  root: "http://example.com/wp-json/",
  nonce: "abc123..."
}
```

## Data Attributes Contract

### What PHP Renders:
```html
<div
  data-blueprint-form
  data-schema="collection-name"
  data-record-id="123"
  class="custom-class"
  id="custom-id"
></div>
```

### What JavaScript Expects:
```javascript
element.getAttribute('data-collection')  // ❌ WRONG
element.getAttribute('data-schema')      // ✓ CORRECT (but not implemented)
element.getAttribute('data-record-id')   // ✓ Correct
```

## REST API Integration

The form system relies on Gateway REST API endpoints:

1. **Collection Schema:** `GET /wp-json/gateway/v1/collections/{schema}`
2. **Create Record:** `POST /wp-json/gateway/v1/{endpoint}`
3. **Get Record:** `GET /wp-json/gateway/v1/{endpoint}/{id}`
4. **Update Record:** `PUT /wp-json/gateway/v1/{endpoint}/{id}`

Authentication uses WordPress REST API nonce (localized via `wpApiSettings.nonce`).

## WordPress Hooks Used

### Actions:
- `init` - Registers shortcode and block (Shortcode.php:13)
- `wp_footer` - Ensures scripts loaded (Render.php:53)
- `admin_footer` - Ensures scripts loaded in admin (Render.php:54)

### Filters:
None currently used by form system

## Related Systems

### Collections Registry
Forms depend on collections being properly registered with Gateway's CollectionRegistry.

### Field Types
The `@gateway/forms` package (in monorepo) contains all field type components referenced by the form builder.

### Admin Pages
Admin system is initialized separately in Plugin.php:89-90

## Fix Requirements

To make forms work:

1. **Add to Plugin.php init method (around line 91):**
```php
// Initialize front-end forms
Forms\Render::init();
Forms\Shortcode::init();
```

2. **Fix data attribute mismatch - Choose ONE:**
   - Option A: Change PHP (Render.php:24) from `data-schema` to `data-collection`
   - Option B: Change JS (index.js:9) from `data-collection` to `data-schema`

   Recommendation: Change JS to match PHP, as `data-schema` is more accurate terminology.

3. **Remove Gutenberg block code:**
   - Delete lines 60-91 in Shortcode.php (register_block method)
   - Delete lines 99-119 in Shortcode.php (render_block method)
   - Remove call to register_block in init method (line 13)

## Testing Checklist

After fixes, verify:
- [ ] Shortcode text no longer appears in output
- [ ] Form container div renders with correct data attributes
- [ ] JavaScript file loads in footer
- [ ] CSS file loads
- [ ] wpApiSettings is defined in page source
- [ ] React mounts and renders form
- [ ] Form can submit to REST API
- [ ] Edit mode loads existing record

## File Summary

**PHP Files (3):**
- `Plugin.php` - Main plugin initialization (NEEDS CHANGES)
- `includes/Forms/Render.php` - Form rendering and script enqueuing (NEEDS FIX: data-schema)
- `includes/Forms/Shortcode.php` - Shortcode/block registration (NEEDS CLEANUP: remove block)

**JavaScript Files (2):**
- `react/apps/form/src/index.js` - Entry point (NEEDS FIX: data-collection)
- `react/apps/form/src/App.js` - Root component (OK)

**Build Files (4):**
- `react/apps/form/build/index.js`
- `react/apps/form/build/index.css`
- `react/apps/form/build/index-rtl.css`
- `react/apps/form/build/index.asset.php`

**Documentation Files (1):**
- `docs/FRONT-END-FORMS.md` - User-facing documentation (NEEDS UPDATE: remove Gutenberg block sections)
