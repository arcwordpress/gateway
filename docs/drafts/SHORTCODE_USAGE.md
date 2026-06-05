# Shortcode Usage

Gateway registers two production shortcodes. A third (`gateway_render_test`) exists
for internal development only and should not be used in live sites.

---

## Shortcodes at a Glance

| Shortcode | Purpose |
|---|---|
| `[gateway_form]` | Renders a React form for any registered collection |
| `[gateway_view]` | Renders a table of records from any registered view |

---

## `[gateway_form]`

Mounts a React-powered form on any page or post. The form automatically derives
its fields from the collection's `$fields` definition and handles create/edit via
the collection's REST endpoint.

### Attributes

| Attribute | Required | Description |
|---|---|---|
| `schema` | Yes | Collection key (e.g. `events`, `products`, `contact`) |
| `record_id` | No | Integer ID — loads that record for editing instead of creating |
| `class` | No | CSS class(es) added to the form wrapper `<div>` |
| `id` | No | HTML `id` added to the form wrapper `<div>` |

### Basic usage

```
[gateway_form schema="contact"]
```

### Edit mode

```
[gateway_form schema="contact" record_id="42"]
```

### Custom wrapper styling

```
[gateway_form schema="contact" class="my-form" id="contact-form"]
```

### PHP equivalent

```php
\Gateway\Forms\Render::form('contact');
\Gateway\Forms\Render::form('contact', 42);                        // edit mode
\Gateway\Forms\Render::form('contact', null, ['class' => 'my-form']);
```

---

## `[gateway_view]`

Renders a collection's records as an HTML table. The view must be registered with
Gateway's view registry before the shortcode can resolve it. The `key` attribute
maps to the view's `$key` property.

This is the primary way to display a grid of records on the front-end.

### Attributes

| Attribute | Required | Description |
|---|---|---|
| `key` | Yes | View registry key (must match `$key` on the View class) |

### Basic usage

```
[gateway_view key="events-list"]
```

### PHP equivalent

```php
echo do_shortcode('[gateway_view key="events-list"]');
```

### Registering a view

The view class must be registered (typically on `gateway_register`) before the
shortcode can find it. Views defined through the Raptor editor are registered
automatically on build.

```php
namespace MyPlugin\Views;

class EventsListView extends \Gateway\View
{
    protected $key        = 'events-list';
    protected $collection = \MyPlugin\Collections\Event::class;
    protected $columns    = ['title', 'start_date', 'location', 'status'];
}
```

```php
// In your Plugin::register_views()
EventsListView::register();
```

Then on any page or post:

```
[gateway_view key="events-list"]
```

---

## Examples by extension type

The shortcodes are collection-agnostic — any registered collection or view works
the same way. The examples below show the patterns for common extension types.

### Events extension

```
// Display all upcoming events
[gateway_view key="events-list"]

// Let visitors submit a new event
[gateway_form schema="events"]

// Edit an existing event (e.g. from a dynamic page template)
[gateway_form schema="events" record_id="<?php echo $event_id; ?>"]
```

Matching view registration:

```php
namespace Event\Views;

class EventsList extends \Gateway\View
{
    protected $key        = 'events-list';
    protected $collection = \Event\Collections\Event::class;
    protected $columns    = ['title', 'start_date', 'end_date', 'location'];
}
```

### Products extension

```
// Display product catalogue
[gateway_view key="products-grid"]

// Add a new product (admin-facing page)
[gateway_form schema="products"]

// Edit a product
[gateway_form schema="products" record_id="99"]
```

Matching view registration:

```php
namespace Products\Views;

class ProductsGrid extends \Gateway\View
{
    protected $key        = 'products-grid';
    protected $collection = \Products\Collections\Product::class;
    protected $columns    = ['name', 'sku', 'price', 'stock', 'status'];
}
```

### Support / ticketing extension

```
[gateway_form schema="support" class="support-form" id="submit-ticket"]
[gateway_view key="open-tickets"]
```

### Contact / leads extension

```
[gateway_form schema="contact"]
[gateway_view key="leads-table"]
```

---

## Grid display note

There is no separate `gateway_grid` shortcode. `[gateway_view]` is the shortcode
that boots the record-grid display. The underlying render strategy (`ShortcodeRender`)
fetches all records from the view's collection and outputs them as a styled HTML
table. A dedicated interactive grid shortcode (backed by the `@arcwp/gateway-grids`
React app) is planned but not yet registered.

---

## Initialization requirement

Both shortcodes are registered by Gateway core automatically. No extra init call is
needed in extension plugins. The required calls in `Gateway\Plugin` are:

```php
Forms\Shortcode::init();                      // registers [gateway_form]
Views\Render\Shortcode\Shortcode::init();     // registers [gateway_view]
```

Extension views and collections must be registered on the `gateway_register` hook
(fired just before `gateway_loaded` at `init` priority 5) so the shortcode
resolvers can find them:

```php
add_action('gateway_register', function () {
    \MyPlugin\Collections\Event::register();
    \MyPlugin\Views\EventsList::register();
});
```

Raptor-built extensions handle this automatically via the generated `Plugin` class.
