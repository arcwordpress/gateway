<?php

namespace Gateway\Raptor\Migrations;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Migration: gateway_raptor_extension_file
 *
 * Stores the Extension class record for each Raptor-built plugin.
 * There is always exactly one row per gateway_raptor_extension — it is
 * created automatically on first build and holds any options that control
 * how lib/Extension.php is generated.
 *
 * Safe to run multiple times — dbDelta() is idempotent.
 */
class RaptorExtensionFileMigration
{
    public static function create(): void
    {
        global $wpdb;

        $table_name      = $wpdb->prefix . 'gateway_raptor_extension_file';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            extension_id bigint(20) unsigned NOT NULL,
            status varchar(50) NOT NULL DEFAULT 'active',
            created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY extension_id (extension_id)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }
}
