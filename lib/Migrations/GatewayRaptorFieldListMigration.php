<?php

namespace Gateway\Migrations;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Migration: gateway_raptor_field_list
 *
 * Stores field-list records for collections. A collection may have multiple
 * field lists (one-to-many). Each record is tied to a collection identified
 * by collection_key (not a DB foreign key — the collection may exist only in code).
 *
 * Safe to run multiple times — dbDelta() is idempotent.
 */
class GatewayRaptorFieldListMigration
{
    public static function create(): void
    {
        global $wpdb;

        $table_name      = $wpdb->prefix . 'gateway_raptor_field_list';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            collection_key varchar(200) NOT NULL DEFAULT '',
            created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY collection_key (collection_key)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }
}
