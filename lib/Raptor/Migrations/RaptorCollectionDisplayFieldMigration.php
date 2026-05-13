<?php

namespace Gateway\Raptor\Migrations;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Migration: add display_field column to gateway_raptor_collection
 *
 * Stores the field name used as the primary display field for a record
 * (e.g. "title", "name"). When not set, getDisplayField() falls back to
 * auto-detection and finally to "id".
 *
 * Safe to run multiple times — dbDelta() is idempotent.
 */
class RaptorCollectionDisplayFieldMigration
{
    public static function create(): void
    {
        global $wpdb;

        $table_name      = $wpdb->prefix . 'gateway_raptor_collection';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            collection_key varchar(200) NOT NULL DEFAULT '',
            extension_id bigint(20) unsigned NULL,
            package_key varchar(200) NULL DEFAULT NULL,
            label_field varchar(200) NULL DEFAULT NULL,
            display_field varchar(200) NULL DEFAULT NULL,
            title varchar(200) NOT NULL DEFAULT '',
            description text NULL,
            status varchar(50) NOT NULL DEFAULT 'active',
            registered tinyint(1) NOT NULL DEFAULT 1,
            relationships longtext NULL,
            created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY collection_key (collection_key)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }
}
