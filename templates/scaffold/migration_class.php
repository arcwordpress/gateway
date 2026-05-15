<?php

namespace {{NAMESPACE}}\Migrations;

if (!defined('ABSPATH')) {
    exit;
}

class {{CLASS_NAME}} extends \Gateway\Migration
{
    protected static string $extension = '{{EXTENSION_KEY}}';

    public static function getVersion(): ?string
    {
        return defined('{{CONSTANT_PREFIX}}_VERSION') ? {{CONSTANT_PREFIX}}_VERSION : null;
    }

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
