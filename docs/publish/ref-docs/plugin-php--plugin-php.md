# Plugin.php

The root bootstrap file for the Gateway plugin. Defines constants, registers the autoloader, declares the `Plugin` singleton, and hooks boot into WordPress `init`.

## Constants

| Constant | Value |
|----------|-------|
| `GATEWAY_VERSION` | Current plugin version |
| `GATEWAY_PATH` | Absolute server path to plugin root |
| `GATEWAY_URL` | URL to plugin root |
| `GATEWAY_FILE` | Absolute path to this file |
| `GATEWAY_DATA_DIR` | `WP_CONTENT_DIR/gateway` — writable data directory |
| `GATEWAY_REQUEST_LOG_DIR` | `GATEWAY_DATA_DIR/requests/logs` |

## Autoloader

PSR-4 style: maps `Gateway\` namespace to `lib/`.

## Plugin Class

Singleton. Access via `Plugin::getInstance()`.

### Boot sequence (`boot`)

1. Tests database connection (cached in transient `gateway_connection_ok` for 30 min on success, 1 min on failure).
2. **Connection failed** — loads degraded mode: admin notice, connection route, migration routes, admin page only.
3. **Connection ok** — boots Eloquent then calls `init()`.
4. Fires `gateway_loaded`.

### Full init (`init`)

Registers all subsystems in order: extensions, packages, Raptor endpoints, collection registry, package registry, field type registry, standard/collection/admin/settings/migration/sync routes, core collections, pattern registry, migration hooks, admin pages, render, view renderer, app registry, docs.

Fires `gateway_loaded` again at the end.

### Lifecycle hooks

| Method | Trigger | Notes |
|--------|---------|-------|
| `activate` | Plugin activation | Creates data dir, runs core migrations, seeds collections, flushes rewrite rules |
| `deactivate` | Plugin deactivation | Flushes rewrite rules |

### Public API

| Method | Returns |
|--------|---------|
| `isDbReady()` | `bool` |
| `getRegistry()` | `CollectionRegistry` |
| `getPackageRegistry()` | `PackageRegistry` |
| `getFieldTypeRegistry()` | `FieldTypeRegistry` |
| `getStandardRoutes()` | `StandardRoutes` |
| `getPatternRegistry()` | `PatternRegistry` |
| `bootEloquent()` _(static)_ | Boots Eloquent ORM |
| `isSQLiteEnvironment()` _(static)_ | `bool` |
| `findSQLiteDatabase()` _(static)_ | Path or `false` |

### Deprecated

- `getCoreCollectionMap()` — use `Collections\CoreCollections::getMap()`
- `seedCollections()` — use `Collections\CoreCollections::seed()`

## WordPress Hooks

- **`init` (priority 5)** — boots the plugin via `Plugin::getInstance()->boot()`, then fires `gateway_plugin_loaded`.
- **`gateway_activated`** — fired immediately at file load (before `init`).
