<?php

namespace Gateway\Migrations;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Migration: gateway_migration_run
 *
 * Audit log for every migration run triggered via the UI.
 * Replaces ad-hoc tracking in options / extension columns.
 *
 * Safe to run multiple times — dbDelta() is idempotent.
 */
class GatewayMigrationRunMigration
{
    public static function create(): void
    {
        global $wpdb;

        $table_name      = $wpdb->prefix . 'gateway_migration_run';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            subject_type varchar(50) NOT NULL DEFAULT '',
            subject_key varchar(200) NOT NULL DEFAULT '',
            version varchar(20) NOT NULL DEFAULT '',
            success tinyint(1) NOT NULL DEFAULT 0,
            message text NULL,
            ran_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY subject_key (subject_key),
            KEY subject_type_key (subject_type, subject_key)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }
}
