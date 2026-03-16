# Extension

## Overview

`Extension` is the base class for all Gateway extensions. An extension is a separate WordPress plugin that integrates with Gateway by registering itself into the `ExtensionRegistry`. Extensions follow a standard directory convention and expose path helpers to locate their own resources.

Developers creating a Gateway extension should extend this class and call `register()` on boot.

---

## Properties

| Property | Type | Description |
|---|---|---|
| `$key` | `string\|null` | Optional explicit key override. If not set, derived from class name. |
| `$pluginPath` | `string\|null` | Cached absolute path to the plugin root directory. |

---

## Methods

### `register()`
```php
public static function register(): mixed
```
Instantiates the extension and registers it with the `ExtensionRegistry`. This is the entry point — call this from your extension plugin's boot/init hook.

---

### `getKey()`
```php
public function getKey(): string
```
Returns the extension's unique key. If `$key` is not explicitly set, it is derived from the class name by converting `PascalCase` to `snake_case`.

**Example:** `MyExtension` → `my_extension`

---

### `getPluginSlug()`
```php
public function getPluginSlug(): string
```
Returns the WordPress plugin slug (directory name convention). Converts underscores to hyphens.

**Example:** `my_extension` → `my-extension`

---

### `getPluginPath()`
```php
public function getPluginPath(): string|null
```
Returns the absolute path to the extension's plugin root directory. Uses reflection to locate the class file and walks up the directory tree until it finds a directory inside `/plugins/`. Result is cached in `$pluginPath`.

Returns `null` if the path cannot be resolved.

---

### `getLibPath()`
```php
public function getLibPath(): string|null
```
Returns the absolute path to the extension's `/lib` directory.

Returns `null` if `getPluginPath()` returns null.

---

### `getDatabasePath()`
```php
public function getDatabasePath(): string|null
```
Returns the absolute path to the extension's `/lib/Database` directory.

Returns `null` if `getLibPath()` returns null.

---

### `hasStandardStructure()`
```php
public function hasStandardStructure(): bool
```
Returns `true` if the extension's `/lib/Database` directory exists on disk. Used to verify the extension follows the expected directory convention.

---

## Relationships

| Relationship | Description |
|---|---|
| `ExtensionRegistry` | Extensions are registered into and managed by the `ExtensionRegistry` singleton. |

---

## Usage

```php
namespace MyPlugin;

use Gateway\Extension;

class MyExtension extends Extension
{
    protected $key = 'my_extension';
}

// In your plugin boot:
MyExtension::register();
```

---

## Standard Directory Structure

```
/wp-content/plugins/my-extension/
  /lib/
    /Database/       ← required for hasStandardStructure() to return true
```

---

## Notes

- The key derivation from class name assumes the class is named after the extension (e.g. `RaptorExtension` → `raptor_extension`). Setting `$key` explicitly is recommended for clarity.
- `getPluginPath()` relies on reflection and file traversal — it will not work correctly if the class is defined outside of the standard WordPress plugins directory.
