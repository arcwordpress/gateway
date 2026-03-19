# WordPress Interactivity API Integration for Views

## Overview

The Gateway plugin now integrates WordPress Interactivity API to provide dynamic, interactive view rendering both in the frontend and within the React admin editor.

## Architecture

### Backend Components

1. **ViewRenderer** (`lib/Raptor/ViewRenderer.php`)
   - Generates HTML markup with `data-wp-*` directives
   - Registers `[gateway_view]` shortcode for frontend rendering
   - Provides REST endpoint for preview HTML: `/gateway/v1/raptor/view/{view_key}/preview`
   - Enqueues Interactivity API scripts and styles

2. **View Store** (`lib/Raptor/store/view-store.js`)
   - JavaScript module using `@wordpress/interactivity`
   - Manages state for records, loading, errors, pagination
   - Actions: `loadRecords`, `nextPage`, `prevPage`, `refresh`
   - Each view gets its own namespace: `gateway/view-{viewKey}`

3. **Styles** (`lib/Raptor/store/view-styles.css`)
   - Consistent styling for view tables
   - Separate preview styles for editor context

### Frontend Components

1. **InteractiveHTML Component** (`react/apps/raptor/src/components/InteractiveHTML.tsx`)
   - React component that renders HTML with Interactivity directives
   - Handles hydration for admin preview context
   - Can be used to embed interactive views in React admin UI

## Usage

### Frontend Shortcode

Render a view on any page or post using:

```php
[gateway_view key="my-view-key"]
```

The shortcode will:
- Load the view configuration from database
- Generate HTML with `data-wp-interactive` directives
- Initialize state with API route and configuration
- Automatically fetch and display records on page load

### Programmatic Rendering (PHP)

```php
use Gateway\Raptor\ViewRenderer;
use Gateway\Raptor\Collections\RaptorView;

$view = RaptorView::where('view_key', 'my-view')->first();
$html = ViewRenderer::renderView($view);
echo $html;
```

### Preview Rendering (Static)

For static previews with sample data:

```php
$records = [
  ['id' => 1, 'title' => 'Record 1', 'status' => 'active'],
  ['id' => 2, 'title' => 'Record 2', 'status' => 'pending'],
];

$html = ViewRenderer::renderViewPreview($view, $records);
echo $html;
```

### REST API Preview

Get preview HTML via REST API:

```
GET /wp-json/gateway/v1/raptor/view/{view_key}/preview
```

Response:
```json
{
  "success": true,
  "html": "<div class=\"gateway-view-preview\">...</div>"
}
```

### React Admin Integration

Use the InteractiveHTML component to render views with interactivity in the React admin:

```tsx
import { InteractiveHTML } from '../components/InteractiveHTML'
import { useQuery } from '@tanstack/react-query'

function ViewPreview({ viewKey }: { viewKey: string }) {
  const { data } = useQuery({
    queryKey: ['view-preview-html', viewKey],
    queryFn: async () => {
      const res = await fetch(`/wp-json/gateway/v1/raptor/view/${viewKey}/preview`)
      const json = await res.json()
      return json.html
    },
  })

  return <InteractiveHTML html={data ?? ''} />
}
```

## Interactivity Directives

The ViewRenderer uses the following WordPress Interactivity API directives:

- `data-wp-interactive="gateway/view-{viewKey}"` - Defines the interactive region
- `data-wp-init="actions.loadRecords"` - Triggers record loading on mount
- `data-wp-each="state.records"` - Loops through records
- `data-wp-text="context.item.{column}"` - Displays column values
- `data-wp-show="state.isLoading"` - Conditional visibility based on state

## State Structure

Each view maintains the following state:

```javascript
{
  apiRoute: string,      // REST API endpoint for records
  records: array,        // Fetched records
  isLoading: boolean,    // Loading indicator
  error: string | null,  // Error message
  columns: array,        // Column names to display
  perPage: number,       // Records per page
  currentPage: number,   // Current page number
  totalPages: number,    // Total pages available
}
```

## Customization

### Custom Store Actions

Extend the view store with custom actions:

```javascript
import { store, getContext } from '@wordpress/interactivity';

store('gateway/view', {
  actions: {
    *customAction() {
      const context = getContext();
      // Custom logic here
    },
  },
});
```

### Custom Styles

Override view styles by adding your own CSS after `gateway-view-styles`:

```css
.gateway-view-table {
  /* Custom table styles */
}

.gateway-view-header h2 {
  /* Custom header styles */
}
```

### Custom Markup

Create custom view templates by extending ViewRenderer::renderView():

```php
namespace MyPlugin;

class CustomViewRenderer extends \Gateway\Raptor\ViewRenderer
{
    public static function renderView(\Gateway\Raptor\Collections\RaptorView $view): string
    {
        // Custom rendering logic
        return $customHtml;
    }
}
```

## Editor Integration

### ViewPreviewNode

The ViewPreviewNode component (`react/apps/raptor/src/components/graph_node_types/ViewPreviewNode.tsx`) currently renders a static preview. To enable full interactivity, you can:

1. **Option A: Keep Static (Current)**
   - Fast rendering
   - No external dependencies
   - Good for quick previews

2. **Option B: Use InteractiveHTML**
   - Fetch preview HTML from REST endpoint
   - Render with InteractiveHTML component
   - Full interactivity in editor
   - Requires Interactivity API loaded in admin

### ViewDesign Page

The ViewDesign page shows a live preview of the view. To add interactivity:

```tsx
import { InteractiveHTML } from '../components/InteractiveHTML'

// Inside ViewDesignContent component
const { data: previewHtml } = useQuery({
  queryKey: ['view-preview-html', viewKey],
  queryFn: async () => {
    const res = await fetch(apiUrl(`gateway/v1/raptor/view/${viewKey}/preview`))
    const json = await res.json()
    return json.html as string
  },
})

// Replace current preview node with:
<InteractiveHTML html={previewHtml ?? ''} />
```

## Testing

### Test Shortcode

1. Create a view in the Raptor admin
2. Note the view key (e.g., `my-collection-view`)
3. Add to any post/page:
   ```
   [gateway_view key="my-collection-view"]
   ```
4. View the page on frontend

### Test Interactivity

Open browser console and test state access:

```javascript
// Access view state
const state = wp.interactivity.getContext('gateway/view-my-view')
console.log(state.records)

// Manually trigger refresh
const { actions } = wp.interactivity.store('gateway/view')
actions.refresh()
```

## Compatibility

- **WordPress**: 6.5+  (Interactivity API introduced in 6.5)
- **PHP**: 7.4+
- **Browsers**: Modern browsers with ES6+ support

## Files Created/Modified

### New Files
- `lib/Raptor/ViewRenderer.php` - Main rendering class
- `lib/Raptor/store/view-store.js` - Interactivity store
- `lib/Raptor/store/view-styles.css` - View styles
- `react/apps/raptor/src/components/InteractiveHTML.tsx` - React component
- `docs/VIEW_INTERACTIVITY.md` - This documentation

### Modified Files
- `Plugin.php` - Added ViewRenderer::init()
- `lib/Raptor/Endpoints/ViewRoutes.php` - Added preview endpoint

## Next Steps

1. **Enable in ViewPreviewNode**: Update the graph node to use InteractiveHTML
2. **Add Pagination UI**: Include prev/next buttons in rendered views
3. **Custom Filters**: Add facet filter support to the store
4. **Sorting**: Implement column sorting with Interactivity API
5. **Export to Block**: Create a Gutenberg block wrapper for views
