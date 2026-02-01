<?php

namespace GatewayExtensionScaffold\Database;

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Database Migration: RecordMigration
 *
 * This class creates the database table for the Record collection.
 *
 * The migration uses WordPress's dbDelta() function which:
 * - Creates the table if it doesn't exist
 * - Updates the table schema if it has changed
 * - Is safe to run multiple times (idempotent)
 *
 * USAGE:
 * This migration is automatically executed during plugin activation
 * via the Plugin::run_migrations() method.
 */
class RecordMigration
{
    /**
     * Create or update the database table
     *
     * This method uses WordPress's dbDelta() function which safely
     * handles both table creation and updates.
     *
     * @return void
     */
    public static function create()
    {
        global $wpdb;

        $table_name = $wpdb->prefix . 'extension_records';
        $charset_collate = $wpdb->get_charset_collate();

        // Note: dbDelta() has specific formatting requirements:
        // - Each column must be on its own line
        // - Two spaces after PRIMARY KEY
        // - KEY must be used instead of INDEX
        $sql = "CREATE TABLE $table_name (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT NULL,
            status VARCHAR(255) NULL DEFAULT 'draft',
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

    /**
     * Drop the database table
     *
     * Use with caution - this permanently deletes all data.
     * Typically called during plugin uninstall (not deactivation).
     *
     * @return void
     */
    public static function drop()
    {
        global $wpdb;

        $table_name = $wpdb->prefix . 'extension_records';

        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $wpdb->query("DROP TABLE IF EXISTS $table_name");
    }
}
