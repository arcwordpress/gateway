<?php

namespace Gateway\Migrations;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Migration: gateway_raptor_extension
 *
 * Stores extension records created through the Raptor UI.
 * Replaces the error-prone attempt to insert into wp_extension (which does
 * not exist) by providing a purpose-built table with the correct schema.
 *
 * Safe to run multiple times — dbDelta() is idempotent.
 */
class GatewayRaptorExtensionMigration
{
    public static function create(): void
    {
        global $wpdb;

        $table_name      = $wpdb->prefix . 'gateway_raptor_extension';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
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
            created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY extension_key (extension_key)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }
}
