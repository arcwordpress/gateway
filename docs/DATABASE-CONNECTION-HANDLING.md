# Database Connection Handling

## Overview

Gateway uses Laravel's Illuminate Database (Eloquent ORM) to manage database connections and queries. The plugin supports two database drivers:

1. **MySQL/MariaDB** (default) - Uses PDO with WordPress database credentials
2. **SQLite** - For WordPress Playground environments

This document explains how Gateway handles database connections, connection testing, error handling, and the plugin loading state.

## Table of Contents

- [Database Connection Architecture](#database-connection-architecture)
- [Connection Configuration](#connection-configuration)
- [Connection Testing](#connection-testing)
- [Plugin Activation Flow](#plugin-activation-flow)
- [Error Handling](#error-handling)
- [Helper Functions](#helper-functions)
- [Known Issues and Recommendations](#known-issues-and-recommendations)

---

## Database Connection Architecture

### Initialization Flow

1. **Plugin Bootstrap** (`Plugin.php:234`)
   - `Plugin::getInstance()` creates singleton instance
   - Constructor calls `bootEloquent()` immediately (line 100)

2. **Eloquent Bootstrap** (`Plugin.php:199-202`)
   ```php
   public static function bootEloquent()
   {
       Database\DatabaseConnection::boot();
   }
   ```

3. **Connection Setup** (`lib/Database/DatabaseConnection.php:19-85`)
   - Creates Capsule Manager singleton
   - Reads configuration from `gateway_db_config` option
   - Configures driver-specific connection parameters
   - Sets connection as global and boots Eloquent
   - Fires `gateway_eloquent_booted` action hook

### Connection Singleton

The `DatabaseConnection` class uses a static `$capsule` property to ensure only one connection instance exists:

```php
private static $capsule = null;

public static function boot()
{
    if (self::$capsule !== null) {
        return self::$capsule; // Already initialized
    }
    // ... initialize connection
}
```

---

## Connection Configuration

### MySQL Configuration

**Location**: `lib/Database/DatabaseConnection.php:44-77`

```php
self::$capsule->addConnection([
    'driver' => 'mysql',
    'host' => $host,           // Parsed from DB_HOST
    'port' => $port,           // Default 3306, or custom
    'database' => DB_NAME,
    'username' => DB_USER,
    'password' => DB_PASSWORD,
    'charset' => DB_CHARSET,
    'collation' => $collation, // Handles utf8/utf8mb4 mismatch
    'prefix' => $wpdb->prefix,
]);
```

**Port Handling**:
- Default port: `3306`
- Parses embedded port from `DB_HOST` (e.g., `localhost:3307`)
- Supports custom port override via `gateway_connection_port` option
- **Use case**: Local WP and other environments with dynamic ports

**Collation Handling**:
- Fixes mismatch between `utf8` and `utf8mb4`
- If `DB_CHARSET` is `utf8` but collation contains `utf8mb4`, falls back to `utf8_general_ci`

### SQLite Configuration

**Location**: `lib/Database/DatabaseConnection.php:33-42`

```php
self::$capsule->addConnection([
    'driver'    => 'sqlite',
    'database'  => $database, // Default: WP_CONTENT_DIR/database/.ht.sqlite
    'prefix'    => $wpdb->prefix,
    'foreign_key_constraints' => true,
]);
```

**Configuration Storage**:
- Stored in `gateway_db_config` WordPress option
- Format: `['driver' => 'sqlite', 'database' => '/path/to/db.sqlite']`

### Getting Current Driver

```php
$driver = Database\DatabaseConnection::getDriver();
// Returns: 'mysql' or 'sqlite'
```

---

## Connection Testing

### Current Implementation

**Method**: `DatabaseConnection::testConnection()` (`lib/Database/DatabaseConnection.php:111-125`)

```php
public static function testConnection()
{
    try {
        if (self::$capsule === null) {
            return false;
        }

        // Try a simple query to test the connection
        self::$capsule->getConnection()->getPdo();
        return true;
    } catch (\Exception $e) {
        error_log('Gateway database connection test failed: ' . $e->getMessage());
        return false;
    }
}
```

**How it works**:
1. Checks if Capsule is initialized
2. Calls `getPdo()` which forces a connection attempt
3. Returns `true` if connection succeeds
4. Catches any exceptions and logs error
5. Returns `false` on failure

### REST API Endpoint

**Endpoint**: `POST /wp-json/gateway/v1/test-connection`

**Location**: `lib/Endpoints/TestConnectionRoute.php`

**Functionality**:
- Tests connection by querying database version
- MySQL: `SELECT VERSION()`
- SQLite: `SELECT sqlite_version()`
- Counts tables with WordPress prefix
- Returns connection details including custom port (MySQL only)

### Limitations

**Current limitations**:

1. **No Timeout Configuration**
   - Uses system default PDO timeout (typically 30 seconds)
   - Can cause long hangs if database is unreachable
   - No way to abort connection attempts quickly

2. **No Result Caching**
   - Connection is tested every time `testConnection()` is called
   - Could impact performance if called frequently
   - No transient/option storage for connection state

3. **Generic Exception Handling**
   - Catches all exceptions as `\Exception`
   - Doesn't distinguish between connection timeout, authentication failure, etc.
   - Error details only logged, not exposed to calling code

4. **Single Attempt**
   - No retry logic
   - No exponential backoff
   - Fails immediately on first error

---

## Plugin Activation Flow

### Activation Process

**Method**: `Plugin::activate()` (`Plugin.php:207-222`)

```php
public function activate()
{
    // Run core migrations via action hook
    Database\MigrationHooks::runCoreMigrations();

    // Create directories for request log tracking
    if (!is_dir(GATEWAY_DATA_DIR)) {
        mkdir(GATEWAY_DATA_DIR, 0755, true);
    }
    if (!is_dir(GATEWAY_REQUEST_LOG_DIR)) {
        mkdir(GATEWAY_REQUEST_LOG_DIR, 0755, true);
    }

    // Flush rewrite rules
    flush_rewrite_rules();
}
```

### Critical Issue: No Connection Check Before Activation

**Problem**:
- Plugin attempts to run migrations immediately during activation
- No check for working database connection before migrations
- If connection fails, activation may fail with fatal error
- User gets no helpful error message

**Risk Scenarios**:
1. **Wrong port configured** (e.g., Local WP changed port)
2. **Database server not running**
3. **Invalid credentials**
4. **PDO extension not installed**
5. **Timeout waiting for unreachable database**

### Recent Changes

Commit `04fd8aa` removed `isActivating()` and `prepareStore()` from activation flow:
- These were causing issues during activation
- Likely because they required database connection before it was properly tested
- Removed to allow activation to proceed

---

## Error Handling

### Collection Error Handling

**Location**: `lib/Collection.php:123-151`

**Method**: `Collection::prepareStore()`

```php
public static function prepareStore(string $namespace, $query = null, array $options = [])
{
    try {
        $builder = $query ?? static::query();
        $records = $builder->get()->toArray();

        wp_interactivity_state($namespace, [
            'records' => $records,
            'searchTerm' => '',
            'loading' => false,
            'error' => null,
            'hasRecords' => count($records) > 0,
            'options' => $options
        ]);
    } catch (\Exception $e) {
        error_log('Gateway Collection::prepareStore failed for ' . $namespace . ': ' . $e->getMessage());

        // Initialize store with empty records and error state
        wp_interactivity_state($namespace, [
            'records' => [],
            'searchTerm' => '',
            'loading' => false,
            'error' => 'Database connection failed',
            'hasRecords' => false,
            'options' => $options
        ]);
    }
}
```

**Good practices**:
- Gracefully handles database failures
- Logs error details for debugging
- Returns empty state with generic error message
- Does not crash the plugin
- Frontend receives error state and can display user-friendly message

### CRUD Route Error Handling

**Example**: `lib/Endpoints/Standard/GetManyRoute.php:161-167`

```php
} catch (\Exception $e) {
    return $this->sendErrorResponse(
        'Failed to retrieve ' . $this->collectionName . ' items: ' . $e->getMessage(),
        'retrieval_failed',
        500
    );
}
```

**Pattern across all Standard routes**:
- `GetManyRoute` - Wraps query execution
- `GetOneRoute` - Wraps single record fetch
- `CreateRoute` - Wraps record creation
- `UpdateRoute` - Wraps record update (also logs error)
- `DeleteRoute` - Wraps record deletion

**Characteristics**:
- All catch generic `\Exception`
- Return 500 status code
- Include error message in response (may expose internal details)
- Some routes log errors, others don't

### Migration Error Handling

**Location**: `lib/Database/MigrationRunner.php`

```php
try {
    // Migration execution
} catch (\Exception $e) {
    error_log('Gateway Migration Error: ' . $e->getMessage());
    // Continues execution
}
```

**Issues**:
- Migrations use `eval()` to execute generated code (security risk)
- Errors are logged but migrations continue
- Failed migrations may leave database in inconsistent state
- No rollback mechanism

---

## Helper Functions

### gateway_db_connection()

**Status**: Not yet implemented (recommended)

**Purpose**: Fast, cached database connection check

**Proposed implementation** in `includes/functions.php`:

```php
/**
 * Check if Gateway has a working database connection
 *
 * This function tests the database connection with a fast timeout
 * and caches the result to avoid repeated slow checks.
 *
 * @param bool $force_check Force a new connection test, bypassing cache
 * @return bool True if connection is working, false otherwise
 */
function gateway_db_connection($force_check = false)
{
    // Check cache first unless forced
    if (!$force_check) {
        $cached = get_transient('gateway_db_connection_status');
        if ($cached !== false) {
            return $cached === 'connected';
        }
    }

    // Test connection with timeout
    $connection_ok = \Gateway\Database\DatabaseConnection::testConnectionWithTimeout(2);

    // Cache result for 5 minutes (300 seconds)
    // Cache successful connections longer than failures
    $cache_duration = $connection_ok ? 300 : 60;
    set_transient(
        'gateway_db_connection_status',
        $connection_ok ? 'connected' : 'failed',
        $cache_duration
    );

    return $connection_ok;
}

/**
 * Clear the database connection status cache
 *
 * Call this after changing database configuration settings
 * (e.g., after updating gateway_connection_port)
 */
function gateway_clear_connection_cache()
{
    delete_transient('gateway_db_connection_status');
}
```

**Usage examples**:

```php
// Before running database operations
if (!gateway_db_connection()) {
    return new WP_Error('db_connection', 'Database connection not available');
}

// After changing port configuration
update_option('gateway_connection_port', 3307);
gateway_clear_connection_cache();

// Force a fresh connection test
if (gateway_db_connection(true)) {
    echo 'Connection successful!';
}
```

### testConnectionWithTimeout()

**Status**: Not yet implemented (recommended)

**Purpose**: Test database connection with configurable timeout

**Proposed addition** to `lib/Database/DatabaseConnection.php`:

```php
/**
 * Test database connection with timeout
 *
 * @param int $timeout Timeout in seconds (default: 2)
 * @return bool True if connection successful within timeout
 */
public static function testConnectionWithTimeout($timeout = 2)
{
    try {
        if (self::$capsule === null) {
            return false;
        }

        $driver = self::getDriver();

        // For MySQL, set PDO timeout attributes before connecting
        if ($driver === 'mysql') {
            $connection = self::$capsule->getConnection();
            $pdo = $connection->getPdo();

            // Set timeout attributes (these must be set before connection)
            // Note: For existing connections, we can only test quickly
            $pdo->setAttribute(\PDO::ATTR_TIMEOUT, $timeout);

            // Quick test query
            $pdo->query('SELECT 1');
        } else {
            // SQLite - just try to get PDO (usually instant)
            self::$capsule->getConnection()->getPdo();
        }

        return true;
    } catch (\Exception $e) {
        error_log('Gateway database connection test failed: ' . $e->getMessage());
        return false;
    }
}
```

**Note**: PDO timeout attributes have limitations:
- `PDO::ATTR_TIMEOUT` must be set before connection is established
- For existing connections, cannot change timeout retroactively
- May need to create a new connection with timeout attributes

**Better approach** - Set timeout during connection:

```php
// In boot() method, add timeout to connection config
self::$capsule->addConnection([
    'driver' => 'mysql',
    'host' => $host,
    'port' => $port,
    'database' => DB_NAME,
    'username' => DB_USER,
    'password' => DB_PASSWORD,
    'charset' => DB_CHARSET,
    'collation' => $collation,
    'prefix' => $wpdb->prefix,
    'options' => [
        \PDO::ATTR_TIMEOUT => 2,  // 2 second timeout
        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
    ],
]);
```

---

## Known Issues and Recommendations

### 1. No Timeout Configuration

**Issue**: PDO connections use system default timeout (typically 30 seconds), causing long hangs when database is unreachable.

**Recommendation**:
- Add `PDO::ATTR_TIMEOUT` to connection configuration
- Set default timeout to 2-3 seconds for fast failure
- Make timeout configurable via filter or option

**Implementation**:
```php
// In DatabaseConnection::boot()
$options = [
    \PDO::ATTR_TIMEOUT => apply_filters('gateway_pdo_timeout', 2),
    \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
];

self::$capsule->addConnection([
    // ... other config
    'options' => $options,
]);
```

### 2. No Connection Status Caching

**Issue**: Repeated connection tests can impact performance, especially with slow/failing connections.

**Recommendation**:
- Cache connection test results in transients
- Cache successful connections for 5 minutes
- Cache failed connections for 1 minute (shorter to detect recovery)
- Clear cache when database settings change

**Implementation**: See `gateway_db_connection()` helper function above.

### 3. No Pre-Activation Connection Check

**Issue**: Plugin activation attempts database migrations without verifying connection works, potentially causing fatal errors.

**Recommendation**:
- Add connection check at start of `activate()` method
- Show user-friendly error message if connection fails
- Prevent activation from proceeding without working connection

**Implementation**:
```php
public function activate()
{
    // Test connection before attempting migrations
    if (!Database\DatabaseConnection::testConnection()) {
        $message = 'Gateway plugin activation failed: Unable to connect to database. ';
        $message .= 'Please check your database configuration and try again.';

        // For MySQL, check if custom port is needed
        if (Database\DatabaseConnection::getDriver() === 'mysql') {
            $message .= ' If you are using Local WP or another tool with dynamic database ports, ';
            $message .= 'you may need to configure the connection port in Gateway settings.';
        }

        wp_die(
            esc_html($message),
            'Gateway Activation Error',
            ['back_link' => true]
        );
    }

    // Proceed with migrations...
    Database\MigrationHooks::runCoreMigrations();
    // ... rest of activation
}
```

### 4. Generic Exception Handling

**Issue**: All database exceptions caught as generic `\Exception`, making it hard to distinguish between different failure types.

**Recommendation**:
- Catch specific PDO exceptions for better error handling
- Distinguish between connection failures, authentication errors, timeouts, etc.
- Provide more specific error messages to users

**Implementation**:
```php
try {
    $pdo = self::$capsule->getConnection()->getPdo();
    return true;
} catch (\PDOException $e) {
    $code = $e->getCode();

    if ($code === 2002 || $code === 'HY000') {
        error_log('Gateway: Database server unreachable: ' . $e->getMessage());
    } elseif ($code === 1045) {
        error_log('Gateway: Database authentication failed: ' . $e->getMessage());
    } else {
        error_log('Gateway: Database connection failed: ' . $e->getMessage());
    }

    return false;
} catch (\Exception $e) {
    error_log('Gateway: Unexpected error testing connection: ' . $e->getMessage());
    return false;
}
```

### 5. No Reconnection Logic

**Issue**: If connection is lost during plugin operation, no automatic reconnection attempt.

**Recommendation**:
- Implement connection health monitoring
- Add automatic reconnection on connection loss
- Use Laravel's connection events (`reconnecting`, `connected`)

**Note**: Full Laravel framework includes reconnection logic via `DetectsLostConnections` trait, but Gateway uses minimal Illuminate Database package.

### 6. Migration Uses eval()

**Issue**: `MigrationRunner.php:231` uses `eval()` to execute generated migration code, which is a security risk.

**Recommendation**:
- Generate migration files and `require` them instead of using `eval()`
- Add validation and sanitization of migration code
- Consider using Laravel's migration system more directly

### 7. Exposing Error Details in API Responses

**Issue**: Some API endpoints expose full exception messages to clients, potentially revealing sensitive information.

**Recommendation**:
- Log detailed errors server-side
- Return generic error messages to API consumers
- Only expose details in development/debug mode

**Implementation**:
```php
} catch (\Exception $e) {
    error_log('Gateway ' . __METHOD__ . ' error: ' . $e->getMessage());

    $message = 'Failed to retrieve items';
    if (defined('WP_DEBUG') && WP_DEBUG) {
        $message .= ': ' . $e->getMessage();
    }

    return $this->sendErrorResponse($message, 'retrieval_failed', 500);
}
```

### 8. Settings Route References Undefined Methods

**Issue**: `lib/Endpoints/SettingsRoute.php` calls methods that don't exist:
- `Plugin::isSQLiteEnvironment()`
- `Plugin::findSQLiteDatabase()`

**Recommendation**:
- Implement these methods in Plugin.php
- Or remove references and handle differently

### 9. Undefined Constant in Migrations

**Issue**: `MigrationRunner.php:231` references `GATEWAY_PLUGIN_DIR` which is never defined (should be `GATEWAY_PATH`).

**Recommendation**:
- Replace `GATEWAY_PLUGIN_DIR` with `GATEWAY_PATH` throughout codebase
- Or define `GATEWAY_PLUGIN_DIR` constant if preferred

---

## Best Practices Summary

### When to Check Connection

**Always check before**:
- Plugin activation
- Running migrations
- Bulk operations
- Long-running processes

**Can skip checking**:
- Individual CRUD operations (already wrapped in try/catch)
- Operations that already handle exceptions gracefully
- When connection was verified moments ago (cached)

### Clearing Connection Cache

**Clear cache after**:
- Updating `gateway_connection_port` option
- Changing `gateway_db_config` option
- Manual "test connection" button clicks
- After resolving database issues

**Example**:
```php
// In settings save handler
update_option('gateway_connection_port', $new_port);
gateway_clear_connection_cache();

// Force new test
$connected = gateway_db_connection(true);
```

### Error Messages

**For developers** (error log):
- Include full exception message
- Include stack trace if relevant
- Include context (collection name, query, etc.)

**For users** (UI/API):
- Generic, non-technical message
- No internal details (table names, file paths, etc.)
- Actionable guidance when possible

---

## Quick Reference

### Check if Connection Works

```php
// Current method (no timeout, no caching)
$ok = \Gateway\Database\DatabaseConnection::testConnection();

// Recommended method (with timeout and caching)
$ok = gateway_db_connection();

// Force fresh test
$ok = gateway_db_connection(true);

// Clear cache after config changes
gateway_clear_connection_cache();
```

### Get Current Driver

```php
$driver = \Gateway\Database\DatabaseConnection::getDriver();
// Returns: 'mysql' or 'sqlite'
```

### Get Capsule Instance

```php
$capsule = \Gateway\Database\DatabaseConnection::getCapsule();
$connection = $capsule->getConnection();
$pdo = $connection->getPdo();
```

### Test Connection via REST API

```bash
POST /wp-json/gateway/v1/test-connection
```

### Files to Review

- **Connection**: `lib/Database/DatabaseConnection.php`
- **Plugin Bootstrap**: `Plugin.php`
- **Collections**: `lib/Collection.php`
- **CRUD Routes**: `lib/Endpoints/Standard/*.php`
- **Test Endpoint**: `lib/Endpoints/TestConnectionRoute.php`
- **Settings**: `lib/Endpoints/SettingsRoute.php`
- **Migrations**: `lib/Database/MigrationRunner.php`, `lib/Database/MigrationHooks.php`
- **Helper Functions**: `includes/functions.php`

---

## See Also

- [Collection Reference](COLLECTION-REFERENCE.md)
- [Authentication](AUTHENTICATION.md)
- [Field Types](FIELD-TYPES.md)
- [Front-End Forms](FRONT-END-FORMS.md)
