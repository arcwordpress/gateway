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
        ]);

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
}
