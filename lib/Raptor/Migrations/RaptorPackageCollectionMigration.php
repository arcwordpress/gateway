<?php

namespace Gateway\Raptor\Migrations;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Migration: gateway_raptor_package_collection
 *
 * Pivot table linking packages to their assigned collections.
 * Safe to run multiple times — dbDelta() is idempotent.
 */
class RaptorPackageCollectionMigration
{
    public static function create(): void
    {
        global $wpdb;

        $table_name      = $wpdb->prefix . 'gateway_raptor_package_collection';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            package_id bigint(20) unsigned NOT NULL,
            collection_id bigint(20) unsigned NOT NULL,
            position int(11) NOT NULL DEFAULT 0,
            created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY package_collection (package_id, collection_id),
            KEY package_id (package_id),
            KEY collection_id (collection_id)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }
}
