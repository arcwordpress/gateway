<?php 

namespace Gateway\Migrations;

/**
 * Database Migration: GatewayProjectMigration
 *
 * This class creates the database table for the gateway_project collection.
 *
 * USAGE INSTRUCTIONS:
 * 1. Call GatewayProjectMigration::create() from your plugin activation hook
 *
 * Example:
 * register_activation_hook(__FILE__, function() {
 *     \Gateway\Migrations\GatewayProjectMigration::create();
 * });
 */
class GatewayProjectMigration
{
    /**
     * Create or update the database table
     *
     * This method uses WordPress's dbDelta() function which safely
     * handles both table creation and updates.
     */
    public static function create()
    {
        global $wpdb;

        $table_name = $wpdb->prefix . 'gateway_project';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL,
            created_at TIMESTAMP NULL DEFAULT NULL,
            updated_at TIMESTAMP NULL DEFAULT NULL,
            UNIQUE KEY slug (slug)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
}
