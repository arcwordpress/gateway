# Shortcode View Usage

Minimal flow:

1. Define a View with render type `shortcode`
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

    public function getRenderType(): string
    {
        return 'shortcode';
    }
}

add_action('gateway_loaded', function () {
    OrdersView::register();
});
```

```php
// PHP render
echo do_shortcode('[orders]');
```

Notes:

- `OrdersView::register()` registers the View and wires shortcode handling.
- Shortcode output is produced by the shortcode render strategy.
