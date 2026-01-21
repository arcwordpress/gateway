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
        $driver = $config['driver'] ?? 'mysql';

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
                'options' => [
                    \PDO::ATTR_TIMEOUT => apply_filters('gateway_pdo_timeout', 2),
                    \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                ],
            ]);
        }

        self::$capsule->setAsGlobal();
        self::$capsule->bootEloquent();

        do_action('gateway_eloquent_booted', self::$capsule);

        return self::$capsule;
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
     * Test database connection with timeout
     *
     * This method performs a quick connection test with a configurable timeout.
     * Note: PDO timeout is set during connection initialization in boot(),
     * so this test will respect that timeout setting.
     *
     * @param int $timeout Timeout in seconds (default: 2) - used for documentation/reference only
     * @return bool True if connection successful within timeout
     */
    public static function testConnectionWithTimeout($timeout = 2)
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
