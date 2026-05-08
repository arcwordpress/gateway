<?php

namespace Gateway\Raptor\Migrations;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Alter gateway_raptor_extension: add migration tracking columns.
 *
 * migration_version — the extension version string at the time migrations
 *                     were last run (e.g. "1.0.2").
 * migrations_ran_at — UTC timestamp of the last successful migration run.
 *
 * Safe to run multiple times — dbDelta() is idempotent for ADD COLUMN.
 */
class RaptorExtensionMigrationTrackingMigration
{
    public static function create(): void
    {
        global $wpdb;

        $table           = $wpdb->prefix . 'gateway_raptor_extension';
        $charset_collate = $wpdb->get_charset_collate();

        // dbDelta adds missing columns but will not remove existing ones.
        // We rebuild the full CREATE TABLE so dbDelta can diff the schema.
        $sql = "CREATE TABLE $table (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            extension_key varchar(200) NOT NULL DEFAULT '',
            title varchar(200) NOT NULL DEFAULT '',
            description text NULL,
            version varchar(20) NOT NULL DEFAULT '1.0.0',
            author varchar(200) NULL DEFAULT '',
            author_uri varchar(500) NULL DEFAULT '',
            text_domain varchar(200) NULL DEFAULT '',
            min_wp_version varchar(20) NULL DEFAULT '',
            namespace varchar(200) NULL DEFAULT '',
            status varchar(50) NOT NULL DEFAULT 'active',
            migration_version varchar(20) NULL DEFAULT NULL,
            migrations_ran_at timestamp NULL DEFAULT NULL,
            created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY extension_key (extension_key)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }
}
