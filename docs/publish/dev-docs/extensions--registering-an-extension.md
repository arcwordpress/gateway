# Registering an Extension

Extensions add functionality to Gateway. Each extension is a PHP class that extends `\Gateway\Extension` and calls `register()` on the `gateway_plugin_loaded` action.

## Minimal example

```php
add_action('gateway_plugin_loaded', function () {
    MyPlugin\MyExtension::register();
});
```

```php
namespace MyPlugin;

class MyExtension extends \Gateway\Extension
{
    protected $key   = 'my-extension';
    protected $title = 'My Extension';
}
```

## Required properties

| Property | Description |
|----------|-------------|
| `$key` | Unique identifier. Use lowercase and hyphens. Underscores are converted to hyphens automatically when resolving the plugin slug. |
| `$title` | Human-readable name shown in the Gateway admin. |

## How register() works

`register()` is a static method on `\Gateway\Extension`. It instantiates the calling class via `new static()` and passes the instance to `ExtensionRegistry`. Register on `gateway_plugin_loaded` — this fires after Gateway has fully booted and the registry is available.

## Path helpers

The base class provides helpers that resolve paths relative to where the extension class file lives:

| Method | Returns |
|--------|---------|
| `getPluginPath()` | Absolute path to the extension's plugin root directory |
| `getLibPath()` | `{pluginPath}/lib` |
| `getDatabasePath()` | `{pluginPath}/lib/Database` |
| `hasStandardStructure()` | `true` if `lib/Database/` exists |
| `getPluginSlug()` | `$key` with underscores replaced by hyphens |

These use reflection to walk up the directory tree from the class file until the `plugins/` parent directory is found.
