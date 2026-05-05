<?php

namespace Gateway\Raptor\Migrations;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Migration: gateway_raptor_package
 *
 * Stores package records created through the Raptor UI.
 * Each row is the DB-backed equivalent of a hand-written
 * `class MyPackage extends \Gateway\Package { ... }`.
 *
 * Safe to run multiple times — dbDelta() is idempotent.
 */
class RaptorPackageMigration
{
    public static function create(): void
    {
        global $wpdb;

        $table_name      = $wpdb->prefix . 'gateway_raptor_package';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            package_key varchar(200) NOT NULL DEFAULT '',
            extension_id bigint(20) unsigned NULL,
            label varchar(200) NOT NULL DEFAULT '',
            description text NULL,
            icon varchar(200) NOT NULL DEFAULT 'dashicons-admin-generic',
            position int(11) NOT NULL DEFAULT 20,
            capability varchar(200) NOT NULL DEFAULT 'manage_options',
            parent varchar(200) NULL DEFAULT NULL,
            status varchar(50) NOT NULL DEFAULT 'active',
            created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY package_key (package_key)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }
}
