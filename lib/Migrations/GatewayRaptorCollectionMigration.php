<?php

namespace Gateway\Migrations;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Migration: gateway_raptor_collections
 *
 * Stores collection definitions created through the Raptor UI.
 * Each row is a lightweight record (key, title, description, status)
 * representing a named collection managed in the database.
 *
 * Safe to run multiple times — dbDelta() is idempotent.
 */
class GatewayRaptorCollectionMigration
{
    public static function create(): void
    {
        global $wpdb;

        $table_name      = $wpdb->prefix . 'gateway_raptor_collections';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            collection_key varchar(200) NOT NULL DEFAULT '',
            title varchar(200) NOT NULL DEFAULT '',
            description text NULL,
            status varchar(50) NOT NULL DEFAULT 'active',
            created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY collection_key (collection_key)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }
}
