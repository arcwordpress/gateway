<?php

namespace Gateway\Migrations;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Migration: gateway_collection_users
 *
 * Stores the site-wide active/inactive state for registered collections.
 * Replaces the old options-based gateway_disabled_collections mechanism.
 * Rows are auto-seeded on plugin init by Plugin::seedCollections().
 *
 * Safe to run multiple times — uses dbDelta() which is idempotent.
 */
class GatewayCollectionUserMigration
{
    public static function create(): void
    {
        global $wpdb;

        $table_name      = $wpdb->prefix . 'gateway_collection_users';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            collection_key varchar(200) NOT NULL DEFAULT '',
            active tinyint(1) NOT NULL DEFAULT 1,
            PRIMARY KEY  (id),
            UNIQUE KEY collection_key (collection_key)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }
}
