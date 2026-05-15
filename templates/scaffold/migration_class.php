<?php

namespace {{NAMESPACE}}\Migrations;

if (!defined('ABSPATH')) {
    exit;
}

class {{CLASS_NAME}} extends \Gateway\Migration
{
    protected static string $extension = '{{EXTENSION_KEY}}';
    protected static ?string $version  = null;

    public static function create(): void
    {
        global $wpdb;

        $table_name      = $wpdb->prefix . '{{TABLE_NAME}}';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            PRIMARY KEY  (id)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }
}
