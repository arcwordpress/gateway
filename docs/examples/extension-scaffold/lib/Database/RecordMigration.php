<?php

namespace GatewayExtensionScaffold\Migrations;

class RecordMigration extends \Gateway\Migration
{
    protected static string  $extension = 'extension-scaffold';
    protected static ?string $version   = GATEWAY_EXTENSION_SCAFFOLD_VERSION;

    public static function create(): void
    {
        global $wpdb;

        $table   = $wpdb->prefix . 'extension_records';
        $collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            title varchar(255) NOT NULL,
            status varchar(50) NOT NULL DEFAULT 'draft',
            created_at timestamp NULL DEFAULT NULL,
            updated_at timestamp NULL DEFAULT NULL,
            PRIMARY KEY  (id)
        ) $collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }
}
