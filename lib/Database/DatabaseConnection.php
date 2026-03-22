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

        // Get database configuration
        $config = get_option('gateway_db_config', []);

        // Auto-detect driver if not configured
        if (empty($config) || !isset($config['driver'])) {
            $config = self::autoDetectDriver();
            // Save the detected config
            if (!empty($config)) {
                error_log('Gateway: Auto-detected database driver: ' . $config['driver']);
                if ($config['driver'] === 'sqlite') {
                    error_log('Gateway: SQLite database path: ' . $config['database']);
                }
                update_option('gateway_db_config', $config);
            }
        }

        $driver = $config['driver'] ?? 'mysql';

        try {
            if ($driver === 'sqlite') {
                // SQLite configuration
                $database = $config['database'] ?? WP_CONTENT_DIR . '/database/.ht.sqlite';

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

                // Check for custom port setting (for Local WP and other dynamic environments)
                $custom_port = get_option('gateway_connection_port', '');
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
                    'options' => defined('PDO::MYSQL_ATTR_CONNECT_TIMEOUT')
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
                    self::$capsule->addConnection([
                        'driver'    => 'sqlite',
                        'database'  => $sqlite_path,
                        'prefix'    => $wpdb->prefix,
                        'foreign_key_constraints' => true,
                    ]);

                    self::$capsule->setAsGlobal();
                    self::$capsule->bootEloquent();

                    // Save SQLite config for future loads
                    update_option('gateway_db_config', [
                        'driver' => 'sqlite',
                        'database' => $sqlite_path,
                    ]);

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
    private static function autoDetectDriver()
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
        $config = get_option('gateway_db_config', []);
        return $config['driver'] ?? 'mysql';
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
