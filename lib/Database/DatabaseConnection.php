<?php

namespace Gateway\Database;

use Illuminate\Database\Capsule\Manager as Capsule;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class DatabaseConnection
{
    private static $capsule = null;

    /**
     * Boot Eloquent ORM
     */
    public static function boot()
    {
        if (self::$capsule !== null) {
            return self::$capsule;
        }

        global $wpdb;

        self::$capsule = new Capsule;

        // Read connection config directly from the gateway_settings table via $wpdb.
        // We cannot use Eloquent here because boot() is what initialises Eloquent.
        $settings_table = $wpdb->prefix . 'gateway_settings';
        $wpdb->suppress_errors(true);
        $row = $wpdb->get_row(
            "SELECT db_driver, connection_port, sqlite_path FROM `{$settings_table}` WHERE id = 1",
            ARRAY_A
        );
        $wpdb->suppress_errors(false);

        if ($row) {
            $driver      = $row['db_driver']      ?? 'mysql';
            $custom_port = $row['connection_port'] ?? '';
            $sqlite_path = $row['sqlite_path']     ?? '';
        } else {
            // Fresh install or table not yet created — auto-detect.
            // Also read the port from wp_options: the settings POST endpoint writes there
            // as a fallback when Eloquent is unavailable (degraded mode), so that a port
            // saved by the user in the settings UI is honoured on the very next request
            // even before the gateway_settings table exists.
            $detected    = self::autoDetectDriver();
            // Read driver and port from wp_options: the settings POST endpoint writes there
            // when Eloquent is unavailable (degraded mode) so that the user can switch the
            // driver back out of a broken state even when the settings table doesn't exist.
            $driver      = get_option('gateway_connection_driver', $detected['driver'] ?? 'mysql');
            $custom_port = get_option('gateway_connection_port', '');
            $sqlite_path = $detected['database'] ?? '';
            if ($driver === 'sqlite') {
                error_log('Gateway: Auto-detected SQLite, path: ' . $sqlite_path);
            }
        }

        // $driver / $custom_port / $sqlite_path are now set from whichever branch above.

        try {
            if ($driver === 'sqlite') {
                // SQLite configuration
                $database = !empty($sqlite_path) ? $sqlite_path : WP_CONTENT_DIR . '/database/.ht.sqlite';

                // Ensure the database file exists before Eloquent connects.
                // Laravel's SQLiteConnector calls base_path() (a Laravel-only helper) when
                // realpath() returns false, which happens when the file doesn't exist yet.
                // Creating the file here prevents that fatal error on fresh installs.
                $db_dir = dirname($database);
                if (!is_dir($db_dir)) {
                    wp_mkdir_p($db_dir);
                }
                if (!file_exists($database)) {
                    touch($database);
                }

                self::$capsule->addConnection([
                    'driver'    => 'sqlite',
                    'database'  => $database,
                    'prefix'    => $wpdb->prefix,
                    'foreign_key_constraints' => true,
                ]);
            } else {
                // MySQL configuration (existing logic)
                // Fix collation mismatch
                $collation = $wpdb->collate ?: 'utf8mb4_unicode_ci';
                if (DB_CHARSET === 'utf8' && strpos($collation, 'utf8mb4') !== false) {
                    $collation = 'utf8_general_ci';
                }

                // Parse DB_HOST for port if included (e.g., localhost:3307)
                $host = DB_HOST;
                $port = 3306; // Default MySQL port

                if (strpos(DB_HOST, ':') !== false) {
                    list($host, $port) = explode(':', DB_HOST, 2);
                    $port = intval($port);
                }

                // $custom_port was already loaded from the gateway_settings table above.
                if (!empty($custom_port)) {
                    $port = intval($custom_port);
                }

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
                    // Fail fast when the host is unreachable (e.g. wrong port in Local WP).
                    // PDO's default is ~30 s which hangs every page load until the worker
                    // pool is exhausted.  3 s is enough for localhost.
                    // The constant only exists when pdo_mysql is loaded; skip silently
                    // on environments that use a different driver (e.g. mysqlnd variants).
                    'options' => class_exists('PDO') && defined('\PDO::MYSQL_ATTR_CONNECT_TIMEOUT')
                        ? [\PDO::MYSQL_ATTR_CONNECT_TIMEOUT => 3]
                        : [],
                ]);
            }

            self::$capsule->setAsGlobal();
            self::$capsule->bootEloquent();

            do_action('gateway_eloquent_booted', self::$capsule);
        } catch (\Exception $e) {
            error_log('Gateway database connection failed: ' . $e->getMessage());

            // If MySQL failed and we haven't tried SQLite yet, try to detect and use SQLite
            if ($driver === 'mysql' && self::isSQLiteEnvironment()) {
                error_log('Gateway: MySQL connection failed, attempting SQLite fallback');

                // Reset capsule
                self::$capsule = new Capsule;

                $sqlite_path = self::findSQLiteDatabase();

                try {
                    $db_dir = dirname($sqlite_path);
                    if (!is_dir($db_dir)) {
                        wp_mkdir_p($db_dir);
                    }
                    if (!file_exists($sqlite_path)) {
                        touch($sqlite_path);
                    }

                    self::$capsule->addConnection([
                        'driver'    => 'sqlite',
                        'database'  => $sqlite_path,
                        'prefix'    => $wpdb->prefix,
                        'foreign_key_constraints' => true,
                    ]);

                    self::$capsule->setAsGlobal();
                    self::$capsule->bootEloquent();

                    error_log('Gateway: Successfully connected using SQLite fallback');
                    do_action('gateway_eloquent_booted', self::$capsule);
                } catch (\Exception $sqliteError) {
                    error_log('Gateway: SQLite fallback also failed: ' . $sqliteError->getMessage());
                    // Both failed, but don't crash - return the capsule anyway
                }
            }
        }

        return self::$capsule;
    }

    /**
     * Auto-detect the appropriate database driver
     *
     * @return array Configuration array with driver and database path
     */
    public static function autoDetectDriver()
    {
        if (self::isSQLiteEnvironment()) {
            return [
                'driver' => 'sqlite',
                'database' => self::findSQLiteDatabase(),
            ];
        }

        return [
            'driver' => 'mysql',
        ];
    }

    /**
     * Detect if WordPress is using SQLite
     *
     * @return bool
     */
    public static function isSQLiteEnvironment()
    {
        // Check for DB_ENGINE constant (set by SQLite integration plugin)
        if (defined('DB_ENGINE') && DB_ENGINE === 'sqlite') {
            error_log('Gateway: SQLite detected via DB_ENGINE constant');
            return true;
        }

        // Check if db.php drop-in exists (SQLite integration)
        if (file_exists(WP_CONTENT_DIR . '/db.php')) {
            $db_php_content = @file_get_contents(WP_CONTENT_DIR . '/db.php');
            if ($db_php_content && stripos($db_php_content, 'sqlite') !== false) {
                error_log('Gateway: SQLite detected via db.php drop-in');
                return true;
            }
        }

        // Check for SQLite database file in common locations
        $sqlite_path = self::findSQLiteDatabase();
        if ($sqlite_path && file_exists($sqlite_path)) {
            error_log('Gateway: SQLite detected via database file at: ' . $sqlite_path);
            return true;
        }

        error_log('Gateway: SQLite not detected. WP_CONTENT_DIR: ' . WP_CONTENT_DIR);
        return false;
    }

    /**
     * Find SQLite database file path
     *
     * @return string Path to SQLite database
     */
    public static function findSQLiteDatabase()
    {
        $sqlite_paths = [
            WP_CONTENT_DIR . '/database/.ht.sqlite',
            WP_CONTENT_DIR . '/database/wordpress.sqlite',
            WP_CONTENT_DIR . '/database/database.sqlite',
        ];

        foreach ($sqlite_paths as $path) {
            if (file_exists($path)) {
                return $path;
            }
        }

        // Default to Playground standard location
        return WP_CONTENT_DIR . '/database/.ht.sqlite';
    }

    /**
     * Get the Capsule instance
     */
    public static function getCapsule()
    {
        return self::$capsule;
    }

    /**
     * Get the current database driver
     *
     * @return string 'mysql' or 'sqlite'
     */
    public static function getDriver()
    {
        if (self::$capsule !== null) {
            return self::$capsule->getConnection()->getDriverName();
        }

        // Capsule not yet booted — read directly from gateway_settings via $wpdb.
        global $wpdb;
        $table = $wpdb->prefix . 'gateway_settings';
        $wpdb->suppress_errors(true);
        $driver = $wpdb->get_var("SELECT db_driver FROM `{$table}` WHERE id = 1");
        $wpdb->suppress_errors(false);

        return $driver ?: 'mysql';
    }

    /**
     * Test if database connection is available
     *
     * @return bool True if connection is working, false otherwise
     */
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

    /**
     * Test database connection with a lightweight query
     *
     * The connect timeout is enforced by the PDO::MYSQL_ATTR_CONNECT_TIMEOUT
     * option set in boot(), so this will return false quickly when the host
     * is unreachable rather than blocking for 30 s.
     *
     * @return bool True if connection and a simple query both succeed
     */
    public static function testConnectionWithTimeout()
    {
        try {
            if (self::$capsule === null) {
                return false;
            }

            $driver = self::getDriver();

            // Get PDO connection and perform a simple query
            $pdo = self::$capsule->getConnection()->getPdo();

            // Quick test query appropriate for driver
            if ($driver === 'mysql') {
                $pdo->query('SELECT 1');
            } else {
                // SQLite - just getting PDO is usually enough
                // But we can also test with a query
                $pdo->query('SELECT 1');
            }

            return true;
        } catch (\PDOException $e) {
            // Log specific PDO errors with error codes
            $code = $e->getCode();
            $message = 'Gateway database connection test failed';

            if ($code === 2002 || $code === 'HY000') {
                $message .= ' (server unreachable)';
            } elseif ($code === 1045) {
                $message .= ' (authentication failed)';
            }

            error_log($message . ': ' . $e->getMessage());
            return false;
        } catch (\Exception $e) {
            error_log('Gateway database connection test failed: ' . $e->getMessage());
            return false;
        }
    }
}
