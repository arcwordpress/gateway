<?php

namespace Gateway\Raptor\Migrations;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Migration: gateway_raptor_field
 *
 * Stores individual field definitions belonging to a field list. Each row
 * represents one field with its name (snake_case), type, label, and position.
 *
 * Safe to run multiple times — dbDelta() is idempotent.
 */
class RaptorFieldMigration
{
    public static function create(): void
    {
        global $wpdb;

        $table_name      = $wpdb->prefix . 'gateway_raptor_field';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            field_list_id bigint(20) unsigned NOT NULL,
            name varchar(200) NOT NULL DEFAULT '',
            type varchar(100) NOT NULL DEFAULT 'text',
            label varchar(200) NOT NULL DEFAULT '',
            sort_order int(11) NOT NULL DEFAULT 0,
            searchable tinyint(1) NOT NULL DEFAULT 0,
            config longtext DEFAULT NULL,
            created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY field_list_id (field_list_id)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }
}
