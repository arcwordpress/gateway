# Interactivity API Integration - Implementation Summary

## What Was Built

A complete WordPress Interactivity API integration for the Gateway plugin's View system, enabling dynamic, interactive view rendering both on the frontend and within the React admin editor.

## Components Created

### 1. Backend Rendering System

**ViewRenderer.php** (`lib/Raptor/ViewRenderer.php`)
- Main class for rendering views with Interactivity API directives
- Shortcode: `[gateway_view key="view-key"]`
- Methods:
  - `renderView()` - Full interactive rendering with data-wp-* directives
  - `renderViewPreview()` - Static preview with sample data
  - `enqueueScripts()` - Loads view-store.js on frontend
  - `enqueueAdminScripts()` - Loads store in admin for previews
  - `enqueueStyles()` - Loads view-styles.css

### 2. JavaScript Store

**view-store.js** (`lib/Raptor/store/view-store.js`)
- Uses `@wordpress/interactivity` package
- Namespace: `gateway/view-{viewKey}`
- State management for:
  - Records fetching from REST API
  - Loading states
  - Error handling
  - Pagination
- Actions:
  - `loadRecords()` - Fetch records from API
  - `nextPage()` / `prevPage()` - Pagination controls
  - `refresh()` - Reload data

### 3. Styling

**view-styles.css** (`lib/Raptor/store/view-styles.css`)
- Complete table styling for views
- Separate preview styles for editor context
- Responsive, clean design with hover effects
- Loading, error, and empty states

### 4. REST API Endpoint

**ViewRoutes.php** (modified)
- New endpoint: `/gateway/v1/raptor/view/{view_key}/preview`
- Returns rendered HTML with sample data
- Used by React admin for live previews

### 5. React Components

**InteractiveHTML.tsx** (`react/apps/raptor/src/components/InteractiveHTML.tsx`)
- React wrapper for HTML with Interactivity directives
- Handles hydration in admin context
- Dispatches events for WP Interactivity API

**ViewPreviewNodeInteractive.example.tsx**
- Example showing how to enhance ViewPreviewNode
- Backward compatible with toggle flag
- Demonstrates query integration

### 6. Plugin Integration

**Plugin.php** (modified)
- Added `Raptor\ViewRenderer::init()` call
- Positioned after Render system initialization
- Loads on every page load for shortcode support

## Usage Examples

### Frontend Shortcode
```php
[gateway_view key="my-events-list"]
```

### Programmatic PHP
```php
use Gateway\Raptor\ViewRenderer;
$view = RaptorView::where('view_key', 'events')->first();
echo ViewRenderer::renderView($view);
```

### React Admin
```tsx
import { InteractiveHTML } from '../components/InteractiveHTML'

<InteractiveHTML html={previewHtml} />
```

### REST API
```bash
GET /wp-json/gateway/v1/raptor/view/my-view/preview
```

## Interactivity Directives Used

Generated HTML includes:
- `data-wp-interactive="gateway/view-{key}"` - Interactive region
- `data-wp-init="actions.loadRecords"` - Auto-load on mount
- `data-wp-each="state.records"` - Loop through records
- `data-wp-text="context.item.{column}"` - Display column values
- `data-wp-show="state.isLoading"` - Conditional visibility

## State Structure

```javascript
{
  apiRoute: string,
  records: array,
  isLoading: boolean,
  error: string | null,
  columns: array,
  perPage: number,
  currentPage: number,
  totalPages: number
}
```

## Key Features

✅ **Frontend Rendering** - Views work via shortcode on any page/post
✅ **Dynamic Data** - Automatically fetches records from REST API
✅ **Loading States** - Shows loading, error, and empty states
✅ **Pagination Ready** - State includes current/total pages
✅ **Admin Preview** - REST endpoint provides preview HTML
✅ **React Integration** - InteractiveHTML component for editor
✅ **Styled** - Complete CSS with table formatting
✅ **Extensible** - Easy to customize templates and actions
✅ **Backward Compatible** - Existing views continue working

## Testing Workflow

1. **Create a View**
   - Go to Raptor admin
   - Create/edit a view
   - Select columns
   - Save

2. **Test Shortcode**
   - Add to any post: `[gateway_view key="your-view-key"]`
   - View frontend
   - Should see table with live data

3. **Test Editor Preview**
   - Use REST endpoint: `/wp-json/gateway/v1/raptor/view/{key}/preview`
   - Should return HTML with preview data
   - Integrate into ViewPreviewNode or ViewDesign page

4. **Test Interactivity**
   - Open browser console on frontend
   - Check state: `wp.interactivity.getContext('gateway/view-myview')`
   - Manually trigger: `wp.interactivity.store('gateway/view').actions.refresh()`

## Files Modified

- `Plugin.php` - Added ViewRenderer initialization
- `lib/Raptor/Endpoints/ViewRoutes.php` - Added preview endpoint

## Files Created

- `lib/Raptor/ViewRenderer.php` - Main renderer class
- `lib/Raptor/store/view-store.js` - Interactivity store
- `lib/Raptor/store/view-styles.css` - View styles
- `react/apps/raptor/src/components/InteractiveHTML.tsx` - React component
- `react/apps/raptor/src/components/graph_node_types/ViewPreviewNodeInteractive.example.tsx` - Example usage
- `docs/VIEW_INTERACTIVITY.md` - Comprehensive documentation
- `docs/VIEW_INTERACTIVITY_SUMMARY.md` - This file

## Next Steps / Future Enhancements

### Immediate
- [ ] Enable interactive preview in ViewDesign page
- [ ] Update ViewPreviewNode to use InteractiveHTML
- [ ] Test with various view configurations

### Short Term
- [ ] Add pagination UI to rendered views
- [ ] Implement facet filters in store
- [ ] Add column sorting support
- [ ] Create Gutenberg block wrapper

### Long Term
- [ ] Per-view custom templates
- [ ] Client-side caching strategy
- [ ] Real-time updates (WebSocket)
- [ ] Export/import view configurations
- [ ] View analytics and usage tracking

## Requirements

- WordPress 6.5+ (Interactivity API introduced in 6.5)
- PHP 7.4+
- Modern browser with ES6+ support

## Benefits

1. **Unified System** - Same markup works in editor and frontend
2. **Live Data** - No static snapshots, always fresh
3. **Maintainable** - Single source of truth for rendering
4. **Performant** - Interactivity API is optimized for hydration
5. **Flexible** - Easy to extend with custom actions/templates
6. **Standard** - Uses WordPress core APIs, no custom frameworks
