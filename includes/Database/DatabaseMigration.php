<?php

namespace Gateway\Database;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class DatabaseMigration
{
    /**
     * Run all migrations
     */
    public static function run()
    {
        self::createTestsTable();
    }

    /**
     * Create gateway_tests table
     */
    private static function createTestsTable()
    {
        global $wpdb;

        $table_name = $wpdb->prefix . 'gateway_tests';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE IF NOT EXISTS {$table_name} (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(50) NOT NULL DEFAULT 'active',
            created_at TIMESTAMP NULL DEFAULT NULL,
            updated_at TIMESTAMP NULL DEFAULT NULL
        ) {$charset_collate};";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
}
