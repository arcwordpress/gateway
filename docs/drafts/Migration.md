# Migrations

Gateway uses a simple class-based migration system. Each migration handles one table. Migrations are grouped by extension and run on demand from the Gateway settings UI.

## Creating a Migration

Extend `\Gateway\Migration` and implement `create()`:

```php
<?php

namespace Keystone\Migrations;

class ListingMigration extends \Gateway\Migration
{
    protected static string  $extension = 'keystone';
    protected static ?string $version   = KEYSTONE_VERSION;

    public static function create(): void
    {
        global $wpdb;

        $table   = $wpdb->prefix . 'keystone_listings';
        $collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            title varchar(255) NOT NULL,
            status varchar(50) NOT NULL DEFAULT 'draft',
            created_at timestamp NULL DEFAULT NULL,
            updated_at timestamp NULL DEFAULT NULL,
            PRIMARY KEY  (id)
        ) $collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }
}
```

- **`$extension`** — groups this migration with others from the same plugin. Used as the registry key and the run-endpoint identifier.
- **`$version`** — your plugin's version constant. Bump it to signal that migrations are due for this extension. All migrations in the group share the same version — there is no per-migration versioning.
- **`create()`** — uses WordPress `dbDelta()`, which is safe to run multiple times (idempotent).

## Registering Migrations

Call `::register()` after the `gateway_loaded` action. Register each migration class individually:

```php
add_action('gateway_loaded', function () {
    \Keystone\Migrations\ListingMigration::register();
    \Keystone\Migrations\ListingGroupMigration::register();
    \Keystone\Migrations\EventMigration::register();
});
```

All classes sharing the same `$extension` value are grouped together in the registry.

## Running Migrations

Once registered, the group appears in **Gateway → Settings → Migrations**.

You can also trigger runs via the REST API:

```
# List all registered groups
GET /wp-json/gateway/v1/migrations

# Filter by extension
GET /wp-json/gateway/v1/migrations?extension=keystone

# Run all migrations for an extension
POST /wp-json/gateway/v1/migrations/keystone
```

## How It Works

```
ListingMigration::register()
  └── MigrationRegistry::push('keystone', ListingMigration::class, KEYSTONE_VERSION)
        └── groups['keystone']['migrations'][] = ListingMigration::class

POST /migrations/keystone
  └── MigrationRegistry::runGroup('keystone')
        └── ListingMigration::create()
        └── ListingGroupMigration::create()
        └── ...
```

`MigrationRegistry` is the underlying static store. `\Gateway\Migration` is the base class that provides `$extension`, `$version`, `create()`, and `register()`.

## Multiple Migrations per Extension

```php
class ListingMigration extends \Gateway\Migration
{
    protected static string  $extension = 'keystone';
    protected static ?string $version   = KEYSTONE_VERSION;

    public static function create(): void { /* listings table */ }
}

class ListingGroupMigration extends \Gateway\Migration
{
    protected static string  $extension = 'keystone';
    protected static ?string $version   = KEYSTONE_VERSION;

    public static function create(): void { /* listing_groups table */ }
}
```

Each class = one table. All share `$extension = 'keystone'` and run together when the group is triggered.
