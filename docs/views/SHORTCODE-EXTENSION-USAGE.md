# Shortcode View Usage

Minimal flow:

1. Define a View (data source, columns, facets, sort)
2. Register the View once
3. Render with WordPress shortcode (`do_shortcode` or `[orders]` in content)

```php
<?php

namespace MyPlugin\Views;

class OrdersView extends \Gateway\View
{
    protected $key = 'orders';
    protected $source = \Gateway\Collections\WP\Post::class;
    protected $columns = ['ID', 'post_title', 'post_date'];
}

add_action('gateway_loaded', function () {
    OrdersView::register();
});
```

```php
// PHP render
echo do_shortcode('[gateway_view key="orders"]');
```

Notes:

- The View does not declare a render strategy.
- The shortcode integration explicitly uses the `shortcode` render strategy.
- The shortcode tag is always `gateway_view`; the `key` attribute matches `$key`.
- `OrdersView::register()` adds the view to the registry so the shortcode can resolve it.
