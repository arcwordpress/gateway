# Registering a Package

A Package groups collections together and creates a top-level (or submenu) entry in the WordPress admin. When a package is registered, Gateway mounts the **Studio app** at that admin page — a React SPA that provides full CRUD for every collection assigned to the package.

## Minimal example

```php
add_action('gateway_plugin_loaded', function () {
    MyPlugin\MyPackage::register();
});
```

```php
namespace MyPlugin;

class MyPackage extends \Gateway\Package
{
    protected $key      = 'my-package';
    protected $label    = 'My Package';
    protected $icon     = 'dashicons-admin-generic';
    protected $position = 30;
}
```

## Required properties

| Property | Description |
|----------|-------------|
| `$key` | Unique identifier for the package. Used as the WordPress menu slug (`gateway-package-{key}`) and to associate collections. |
| `$label` | Label shown in the WordPress admin sidebar and as the page title. |

## Optional properties

| Property | Default | Description |
|----------|---------|-------------|
| `$icon` | `dashicons-admin-generic` | WordPress dashicon class or a URL to an SVG/image. |
| `$position` | `20` | WordPress admin menu position. |
| `$capability` | `manage_options` | WordPress capability required to access the page. |
| `$parent` | `null` | Set to an existing menu slug to register as a submenu instead of a top-level menu. |

## How register() works

`register()` is a static method inherited from `\Gateway\Package`. It instantiates the calling class and passes the instance to `PackageRegistry`. Gateway then creates the WordPress admin menu on `admin_menu` and mounts the Studio app on that page.

Register on `gateway_plugin_loaded` — this fires after Gateway has fully booted and the registry is ready.

## Assigning collections to a package

Collections declare their package via the `$package` property on the collection class. Gateway resolves the association at runtime — there is no explicit linking step.

```php
class MyRecord extends \Gateway\Collection
{
    protected $key     = 'my-record';
    protected $table   = 'my_records';
    protected $package = 'my-package'; // matches MyPackage::$key
}
```

Every collection assigned to a package appears automatically in the Studio app CRUD interface for that package.

## The Studio app

When a user navigates to the package's admin page, Gateway renders a mount point and loads the Studio React app:

```html
<div gateway-studio-app
     data-package="my-package"
     data-package-label="My Package">
</div>
```

The app fetches all collections belonging to the package (`GET /gateway/v1/collections?package={key}`) and renders a full record management interface — listing, creating, editing, and deleting records — without any additional configuration.
