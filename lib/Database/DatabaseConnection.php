<?php

namespace Gateway\Database;

use Illuminate\Database\Capsule\Manager as Capsule;

if (!defined('ABSPATH')) {
    exit;
}

class DatabaseConnection
{
    private static $capsule = null;

    public static function boot()
    {
        if (self::$capsule !== null) {
            return self::$capsule;
        }

        global $wpdb;

        self::$capsule = new Capsule;

        $detected    = self::autoDetectDriver();
        $driver      = get_option('gateway_connection_driver', $detected['driver'] ?? 'mysql');
        $custom_port = get_option('gateway_connection_port', '');
        $sqlite_path = get_option('gateway_sqlite_path', $detected['database'] ?? '');

        try {
            if ($driver === 'sqlite') {
                $database = !empty($sqlite_path) ? $sqlite_path : WP_CONTENT_DIR . '/database/.ht.sqlite';
                self::$capsule->addConnection([
                    'driver'    => 'sqlite',
                    'database'  => $database,
                    'prefix'    => $wpdb->prefix,
                    'foreign_key_constraints' => true,
                ]);
            } else {
                $collation = $wpdb->collate ?: 'utf8mb4_unicode_ci';
                if (DB_CHARSET === 'utf8' && strpos($collation, 'utf8mb4') !== false) {
                    $collation = 'utf8_general_ci';
                }
                $host = DB_HOST;
                $port = 3306; 
                if (strpos(DB_HOST, ':') !== false) {
                    list($host, $port) = explode(':', DB_HOST, 2);
                    $port = intval($port);
                }
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
        }

        return self::$capsule;
    }

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
        $driver = function_exists('get_option') ? get_option('gateway_connection_driver', '') : '';
        if ($driver === 'mysql') {
            return false;
        }
        if ($driver === 'sqlite') {
            return true;
        }

        // 2. Constant check
        if (defined('DB_ENGINE')) {
            if (DB_ENGINE === 'mysql') {
                return false;
            }
            if (DB_ENGINE === 'sqlite') {
                return true;
            }
        }
        return false;
    }

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

        return WP_CONTENT_DIR . '/database/.ht.sqlite';
    }

    public static function getCapsule()
    {
        return self::$capsule;
    }

    public static function getDriver()
    {
        if (self::$capsule !== null) {
            return self::$capsule->getConnection()->getDriverName();
        }

        global $wpdb;
        $table = $wpdb->prefix . 'gateway_settings';
        $wpdb->suppress_errors(true);
        $driver = $wpdb->get_var("SELECT db_driver FROM `{$table}` WHERE id = 1");
        $wpdb->suppress_errors(false);

        return $driver ?: 'mysql';
    }

    public static function testConnection()
    {
        $detected    = self::autoDetectDriver();
        $driver      = get_option('gateway_connection_driver', $detected['driver'] ?? 'mysql');
        $custom_port = get_option('gateway_connection_port', '');
        $sqlite_path = get_option('gateway_sqlite_path', $detected['database'] ?? '');

        error_log('driver is ' . $driver);
        error_log('custom_port is ' . $custom_port);

        if ($driver === 'sqlite') {
            $database = !empty($sqlite_path) ? $sqlite_path : WP_CONTENT_DIR . '/database/.ht.sqlite';
            return file_exists($database) && is_readable($database);
        } else {
            $host = DB_HOST;
            $port = 3306;
            if (strpos(DB_HOST, ':') !== false) {
                list($host, $port) = explode(':', DB_HOST, 2);
                $port = intval($port);
            }
            if (!empty($custom_port)) {
                $port = intval($custom_port);
            }
            $dsn = "mysql:host=$host;port=$port;dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            try {
                $pdo = new \PDO($dsn, DB_USER, DB_PASSWORD, [
                    \PDO::ATTR_TIMEOUT => 3,
                    \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                ]);
                $pdo->query('SELECT 1');
                return true;
            } catch (\Exception $e) {
                error_log('Gateway config test failed: ' . $e->getMessage());
                return false;
            }
        }
    }
}
