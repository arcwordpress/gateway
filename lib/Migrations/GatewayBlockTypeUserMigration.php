<?php

namespace Gateway\Migrations;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Migration: gateway_block_type_users
 *
 * Stores the site-wide active/inactive state for each block type slug,
 * unified across all three registration systems (Gutenberg/React, PHP-class,
 * JSON-schema). Rows are auto-seeded on plugin init by Plugin::seedBlockTypes().
 *
 * Safe to run multiple times — uses dbDelta() which is idempotent.
 */
class GatewayBlockTypeUserMigration
{
    public static function create(): void
    {
        global $wpdb;

        $table_name      = $wpdb->prefix . 'gateway_block_type_users';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            slug varchar(200) NOT NULL DEFAULT '',
            label varchar(200) NOT NULL DEFAULT '',
            source varchar(50) NOT NULL DEFAULT '',
            active tinyint(1) NOT NULL DEFAULT 1,
            PRIMARY KEY  (id),
            UNIQUE KEY slug (slug)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }
}
