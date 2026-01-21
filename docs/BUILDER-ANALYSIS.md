# Gateway Builder (Exta) - Current State Analysis

**Date:** January 21, 2026
**Location:** `/react/apps/exta`
**Status:** Removed from admin menu, fully functional

## Executive Summary

The Gateway Builder (codenamed "Exta") is a React-based extension builder that allows users to create WordPress plugins with Gateway dependencies. The builder provides a visual interface for creating extensions, defining collections, and configuring fields, filters, and columns. The builder was removed from the admin menu (commented out in `Plugin.php:108`) but remains fully functional with complete API support.

## Overview

### Purpose
The Builder enables users to:
- Create extensions (WP Plugins) that depend on Gateway
- Define collections within extensions
- Configure fields for data entry forms
- Set up filters for data querying
- Define columns for data grid display

### File Structure
```
react/apps/exta/
├── src/
│   ├── App.js                          # Main app router
│   ├── index.js                        # Entry point
│   ├── components/
│   │   ├── ExtensionCreateForm.js      # Extension creation form
│   │   ├── ExtensionSelector.js        # Extension dropdown selector
│   │   ├── CollectionCreateForm.js     # Collection creation form
│   │   ├── FieldEditor.js              # Field configuration editor
│   │   ├── FilterEditor.js             # Filter configuration editor
│   │   ├── ColumnEditor.js             # Column configuration editor
│   │   ├── ProjectCreateForm.js        # (Legacy/unused?)
│   ├── pages/
│   │   ├── ExtensionCreate.js          # Extension creation page
│   │   ├── ExtensionView.js            # Extension detail view
│   │   ├── CollectionCreate.js         # Collection creation page
│   │   ├── CollectionEditor.js         # Collection editing interface
│   ├── context/
│   │   ├── ExtensionListContext.js     # Extensions state management
│   │   ├── ActiveExtensionContext.js   # Active extension state
│   └── index.css                       # Styles
├── build/                              # Compiled assets
├── package.json
└── postcss.config.js
```

## Features & Functionality

### 1. Extension Management

#### Create Extension
- **Route:** `/extension/create`
- **Form Fields:**
  - Title (text input)
  - Key (auto-generated from title, read-only)
- **API Endpoint:** `POST /gateway/v1/extensions`
- **File Location:** `/react/apps/exta/src/pages/ExtensionCreate.js:18-27`

#### View Extension
- **Route:** `/extension/:key`
- **Features:**
  - Display extension details (title, key)
  - List all collections in extension
  - Link to create new collection
  - View raw extension JSON data
- **API Endpoint:** `GET /gateway/v1/extensions/:extensionKey/collections`
- **File Location:** `/react/apps/exta/src/pages/ExtensionView.js`

#### Extension Selector
- Dropdown component for switching between extensions
- Integrated into app header
- **File Location:** `/react/apps/exta/src/components/ExtensionSelector.js`

### 2. Collection Management

#### Create Collection
- **Route:** `/extension/:key/collection/create`
- **Form Fields:**
  - Title (text input)
  - Key (auto-generated from title, read-only)
- **API Endpoint:** `POST /gateway/v1/extensions/:extensionKey/collections`
- **File Location:** `/react/apps/exta/src/pages/CollectionCreate.js:19-28`

#### Edit Collection
- **Route:** `/extension/:key/:collectionKey`
- **Features:**
  - Edit collection title and key
  - Manage fields (add, edit, remove, reorder)
  - Manage filters (add, edit, remove, reorder)
  - Manage columns (add, edit, remove, reorder)
  - Auto-save with 1.5-second debounce
  - Visual save status indicator
  - Key change warning and redirect
- **API Endpoint:** `PUT /gateway/v1/extensions/:extensionKey/collections/:collectionKey`
- **File Location:** `/react/apps/exta/src/pages/CollectionEditor.js:56-92`

### 3. Field Editor

**Supported Field Types:**
- Text
- Textarea
- Number
- Email
- URL
- Date
- Checkbox
- Select

**Field Configuration:**
- Type (dropdown selection)
- Label (display name)
- Name (internal identifier)

**Field Management:**
- Add new fields
- Remove existing fields
- Reorder fields (move up/down)
- Auto-save changes

**File Location:** `/react/apps/exta/src/components/FieldEditor.js:26-39`

### 4. Filter Editor

**Supported Filter Types:**
- Text
- Select
- Number
- Date
- Date Range
- Checkbox

**Filter Configuration:**
- Type (dropdown selection)
- Field (field name to filter)
- Label (display name)

**Filter Management:**
- Add new filters
- Remove existing filters
- Reorder filters (move up/down)
- Auto-save changes

**File Location:** `/react/apps/exta/src/components/FilterEditor.js:26-36`

### 5. Column Editor

**Column Configuration:**
- Field (field name to display)
- Label (column header)
- Sortable (checkbox to enable sorting)

**Column Management:**
- Add new columns
- Remove existing columns
- Reorder columns (move up/down)
- Auto-save changes

**File Location:** `/react/apps/exta/src/components/ColumnEditor.js`

## API Support Analysis

### Implemented Endpoints

All required REST API endpoints are fully implemented in `/lib/Exta/Routes.php`:

#### 1. Get Extensions
- **Method:** `GET`
- **Endpoint:** `/gateway/v1/extensions`
- **Handler:** `getExtensions()`
- **Returns:** Array of extensions from `wp-content/gateway/extensions/*/extension.json`
- **Status:** ✅ Complete

#### 2. Create Extension
- **Method:** `POST`
- **Endpoint:** `/gateway/v1/extensions`
- **Handler:** `createExtension()`
- **Functionality:**
  - Validates extension key
  - Creates extension directory structure
  - Creates `extension.json` file
  - Creates `collections/` subdirectory
- **Status:** ✅ Complete
- **File Location:** `/lib/Exta/Routes.php:379-443`

#### 3. Get Collections
- **Method:** `GET`
- **Endpoint:** `/gateway/v1/extensions/:extension_key/collections`
- **Handler:** `getCollections()`
- **Returns:** Array of collection JSON files from extension's collections directory
- **Status:** ✅ Complete
- **File Location:** `/lib/Exta/Routes.php:262-315`

#### 4. Create Collection
- **Method:** `POST`
- **Endpoint:** `/gateway/v1/extensions/:extension_key/collections`
- **Handler:** `saveCollection()`
- **Functionality:**
  - Validates collection key
  - Creates collection JSON file
  - Returns merged extension data with collections
- **Status:** ✅ Complete
- **File Location:** `/lib/Exta/Routes.php:61-163`

#### 5. Update Collection
- **Method:** `PUT/PATCH`
- **Endpoint:** `/gateway/v1/extensions/:extension_key/collections/:collection_key`
- **Handler:** `updateCollection()`
- **Functionality:**
  - Updates collection JSON file
  - Handles key changes (renames file)
  - Validates new key doesn't conflict
  - Deletes old file if key changed
- **Status:** ✅ Complete
- **File Location:** `/lib/Exta/Routes.php:171-254`

### Missing Endpoints

#### 1. Delete Extension
- **Status:** ❌ Not Implemented
- **Would Need:** `DELETE /gateway/v1/extensions/:extension_key`
- **Functionality:** Remove extension directory and all collections
- **Priority:** Medium
- **Note:** Currently no UI for deleting extensions

#### 2. Delete Collection
- **Status:** ❌ Not Implemented
- **Would Need:** `DELETE /gateway/v1/extensions/:extension_key/collections/:collection_key`
- **Functionality:** Remove collection JSON file
- **Priority:** Medium
- **Note:** Currently no UI for deleting collections

#### 3. Export Extension
- **Status:** ❌ Not Implemented
- **Would Need:** `GET /gateway/v1/extensions/:extension_key/export`
- **Functionality:** Package extension as installable WP plugin
- **Priority:** High
- **Note:** This is the core value proposition - creating installable plugins

#### 4. Validate Extension
- **Status:** ❌ Not Implemented
- **Would Need:** `POST /gateway/v1/extensions/:extension_key/validate`
- **Functionality:** Check extension configuration for errors
- **Priority:** Low
- **Note:** Would improve UX by catching errors early

## Frontend Integration

### Admin Page Registration

The builder is registered but disabled in `/Plugin.php`:

```php
// Line 108
// Admin\Builder::init(); // Removed Builder admin link
```

The `Builder` class is fully implemented in `/lib/Admin/Builder.php` and includes:
- Menu registration under Gateway parent menu
- React app enqueuing on builder page
- Nonce and API URL localization

**File Location:** `/lib/Admin/Builder.php:19-35`

### Dependencies

The builder uses:
- React 18.2.0
- React Router DOM 6.22.0
- Axios 1.12.2
- React Hook Form 7.53.2
- @dnd-kit (drag and drop libraries)
- Tailwind CSS 4.0.0
- WordPress scripts 27.0.0

**File Location:** `/react/apps/exta/package.json:12-26`

## Data Storage

### File System Structure

Extensions are stored as file-based JSON in:
```
wp-content/
└── gateway/
    └── extensions/
        └── {extension_key}/
            ├── extension.json          # Extension metadata
            └── collections/
                ├── {collection_key1}.json
                └── {collection_key2}.json
```

### Extension JSON Format
```json
{
  "title": "Extension Title",
  "key": "extension_key"
}
```

### Collection JSON Format
```json
{
  "title": "Collection Title",
  "key": "collection_key",
  "fields": [
    {
      "type": "text",
      "label": "Field Label",
      "name": "field_name"
    }
  ],
  "filters": [
    {
      "type": "text",
      "field": "field_name",
      "label": "Filter Label"
    }
  ],
  "columns": [
    {
      "field": "field_name",
      "label": "Column Label",
      "sortable": true
    }
  ]
}
```

## What's Needed to Restore Builder to Menu

### Minimal Requirements (Ready Now)

1. **Uncomment line in Plugin.php**
   - File: `/Plugin.php:108`
   - Change: `// Admin\Builder::init();` → `Admin\Builder::init();`
   - Impact: Builder menu item appears under Gateway menu

2. **Build React app** (if not already built)
   - Command: `cd react/apps/exta && npm install && npm run build`
   - Verify: Check that `/react/apps/exta/build/index.js` exists

That's it! The builder will be fully functional with these two steps.

### Recommended Before Public Release

#### 1. Plugin Export Functionality (HIGH PRIORITY)
Without this, extensions can't be distributed or used outside the development environment.

**Implementation Needed:**
- API endpoint to package extension as WordPress plugin
- Generate plugin header file
- Include collections as PHP code or JSON
- Create installable ZIP file
- **Estimated Complexity:** Medium

#### 2. Delete Operations (MEDIUM PRIORITY)
Users need ability to clean up test/unwanted items.

**Implementation Needed:**
- Delete extension endpoint + UI button
- Delete collection endpoint + UI button
- Confirmation dialogs
- **Estimated Complexity:** Low

#### 3. Field Options for Select Fields (MEDIUM PRIORITY)
Select field types need options to choose from.

**Implementation Needed:**
- Add "options" field to FieldEditor for select type
- UI to add/edit/remove options
- Store options in collection JSON
- **Estimated Complexity:** Low

#### 4. Validation & Error Handling (MEDIUM PRIORITY)
Better UX with validation feedback.

**Implementation Needed:**
- Field name uniqueness check
- Reserved keyword validation
- Field type-specific validation
- Better error messages
- **Estimated Complexity:** Low-Medium

#### 5. Documentation (HIGH PRIORITY)
Users need guidance on using the builder.

**Needed:**
- User guide for creating extensions
- Field type reference
- Collection configuration best practices
- Example workflows
- **Estimated Complexity:** Low

#### 6. Testing (HIGH PRIORITY)
Ensure reliability before release.

**Needed:**
- Test extension creation flow
- Test collection CRUD operations
- Test field/filter/column editors
- Test auto-save functionality
- Test with various field types
- **Estimated Complexity:** Low-Medium

## Gaps & Limitations

### Current Limitations

1. **No Plugin Export**
   - Extensions remain in database only
   - Can't create distributable plugins
   - Main value proposition not delivered

2. **No Delete Operations**
   - Can't remove extensions or collections
   - No cleanup mechanism for tests

3. **Limited Field Configuration**
   - Select fields have no options UI
   - No validation rules
   - No default values
   - No placeholder text
   - No help text

4. **No Relationship Fields**
   - Can't define relationships between collections
   - No foreign key support
   - No collection references

5. **No Advanced Field Types**
   - No file upload
   - No image upload
   - No WYSIWYG editor
   - No repeater fields
   - No group fields

6. **No Permission Management**
   - All extensions accessible to all admins
   - No granular permissions

7. **No Version Control**
   - No extension versioning
   - No migration system for schema changes
   - No changelog

8. **No Testing Features**
   - Can't test collection CRUD from builder
   - No sample data generation
   - No preview mode

### Technical Debt

1. **ProjectCreateForm Component**
   - File exists but unclear purpose: `/react/apps/exta/src/components/ProjectCreateForm.js`
   - May be unused legacy code

2. **No TypeScript**
   - Would improve maintainability
   - Would catch errors earlier

3. **Limited Error Handling**
   - Network errors could be handled better
   - Validation errors need improvement

4. **No Unit Tests**
   - React components untested
   - API endpoints untested

## Comparison: Required vs Available Functions

### Extension Management
| Function | Required | Available | Status | Notes |
|----------|----------|-----------|--------|-------|
| List extensions | ✅ | ✅ | Complete | GET /gateway/v1/extensions |
| Create extension | ✅ | ✅ | Complete | POST /gateway/v1/extensions |
| View extension | ✅ | ✅ | Complete | UI + API |
| Update extension | ⚠️ | ❌ | Missing | May need for metadata updates |
| Delete extension | ⚠️ | ❌ | Missing | Cleanup functionality |
| Export extension | ✅ | ❌ | Missing | Core feature for distribution |

### Collection Management
| Function | Required | Available | Status | Notes |
|----------|----------|-----------|--------|-------|
| List collections | ✅ | ✅ | Complete | GET /gateway/v1/extensions/:key/collections |
| Create collection | ✅ | ✅ | Complete | POST /gateway/v1/extensions/:key/collections |
| View collection | ✅ | ✅ | Complete | UI shows all details |
| Update collection | ✅ | ✅ | Complete | PUT with auto-save |
| Delete collection | ⚠️ | ❌ | Missing | Cleanup functionality |
| Duplicate collection | ⚠️ | ❌ | Missing | Would be useful |

### Field Management
| Function | Required | Available | Status | Notes |
|----------|----------|-----------|--------|-------|
| Add field | ✅ | ✅ | Complete | Inline editor |
| Edit field | ✅ | ✅ | Complete | Type, label, name |
| Remove field | ✅ | ✅ | Complete | Delete button |
| Reorder fields | ✅ | ✅ | Complete | Up/down arrows |
| Field validation | ⚠️ | ❌ | Missing | Would improve UX |
| Field options (select) | ✅ | ❌ | Missing | Select fields incomplete |
| Advanced config | ⚠️ | ❌ | Missing | Defaults, placeholders, help text |

### Filter Management
| Function | Required | Available | Status | Notes |
|----------|----------|-----------|--------|-------|
| Add filter | ✅ | ✅ | Complete | Inline editor |
| Edit filter | ✅ | ✅ | Complete | Type, field, label |
| Remove filter | ✅ | ✅ | Complete | Delete button |
| Reorder filters | ✅ | ✅ | Complete | Up/down arrows |
| Filter options | ⚠️ | ❌ | Missing | Select filters need options |

### Column Management
| Function | Required | Available | Status | Notes |
|----------|----------|-----------|--------|-------|
| Add column | ✅ | ✅ | Complete | Inline editor |
| Edit column | ✅ | ✅ | Complete | Field, label, sortable |
| Remove column | ✅ | ✅ | Complete | Delete button |
| Reorder columns | ✅ | ✅ | Complete | Up/down arrows |
| Column formatting | ⚠️ | ❌ | Missing | Date format, number format, etc. |

## Summary

### Strengths
- ✅ Core functionality is complete and working
- ✅ API layer is robust and well-designed
- ✅ UI is clean and intuitive
- ✅ Auto-save prevents data loss
- ✅ File-based storage is simple and portable
- ✅ Integration with Gateway ecosystem

### Gaps for MVP
- ❌ Can't export extensions as plugins (CRITICAL)
- ❌ No delete operations (IMPORTANT)
- ❌ Select fields can't have options (IMPORTANT)
- ❌ No documentation (IMPORTANT)

### Recommendation

**For Internal Development Use:** Ready now - just uncomment line 108 in Plugin.php

**For Public Release:** Need to implement:
1. Plugin export functionality (required)
2. Delete operations (strongly recommended)
3. Select field options (strongly recommended)
4. User documentation (required)
5. Basic testing (required)

**Estimated Work:** 2-3 weeks for MVP public release

The builder has a solid foundation and is ~80% feature-complete. The remaining 20% is critical for delivering value (plugin export) and ensuring good UX (documentation, delete operations, field options).
