# Store Block

A WordPress block that enables using Gateway collections with the WordPress Interactivity API.

## Overview

The Store block provides a dropdown selector for choosing from all available Gateway collections, making it easy to create dynamic, data-driven content in the WordPress block editor.

## Key Features

- **Collection Dropdown**: Automatically discovers and lists all registered Gateway collections
- **Fixed Validation**: Properly validates collection selection (fixes the backwards validation issue from the data-source block)
- **Preview Data**: Loads and displays preview data from the selected collection
- **Field Discovery**: Shows available fields from the collection
- **Interactivity API Integration**: Seamlessly integrates with WordPress Interactivity API

## Usage

1. Insert the "Store" block into your page or post
2. In the block settings sidebar, select a collection from the dropdown
3. Configure the store namespace if needed (defaults to `gateway/store`)
4. Add child blocks to define how the data should be displayed
5. Available fields from the collection are shown in the sidebar for reference

## Attributes

- `collectionSlug` (string): The key/slug of the selected Gateway collection
- `namespace` (string): The store namespace for the Interactivity API (default: `gateway/store`)
- `query` (object): Query parameters for filtering collection data
- `previewItems` (array): Preview items loaded from the collection (editor only)
- `availableFields` (array): List of available fields from the collection
- `fieldDefinitions` (object): Field type definitions from the collection

## Context Provided

The block provides the following context to child blocks:

- `gateway/collectionSlug`: The selected collection slug
- `gateway/previewItems`: Preview data for the editor
- `gateway/availableFields`: List of available field keys
- `gateway/fieldDefinitions`: Field type and label definitions

## Frontend Store

The block creates an Interactivity API store with the following state and actions:

### State

- `items`: Array of collection items
- `loading`: Boolean loading state
- `error`: Error message if fetch failed
- `hasItems`: Whether any items exist
- `filteredItems`: Items filtered by search query
- `totalItems`: Total count of items
- `filteredCount`: Count of filtered items

### Actions

- `updateSearch(event)`: Update search query
- `clearSearch()`: Clear search query
- `refresh()`: Refresh data from collection
- `sortBy(event)`: Sort items by field
- `filterBy(event)`: Filter items by custom criteria

### Callbacks

- `init()`: Initializes the store and fetches collection data

## Differences from Data Source Block

1. **Collection Selection**: Uses a dropdown instead of text input
2. **Auto-discovery**: Automatically fetches and lists all available collections
3. **Fixed Validation**: Properly shows errors for invalid collections and success for valid ones
4. **Cleaner Naming**: Uses "Store" as the title without prefixes

## Technical Details

- **Name**: `gateway/store`
- **Category**: Gateway
- **Icon**: Database
- **Supports**: Interactivity API
- **Block Type**: Container block (supports InnerBlocks)
