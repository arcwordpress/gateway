<?php

namespace Gateway\Raptor\Migrations;

if (!defined('ABSPATH')) {
    exit;
}

class RaptorViewRenderMigration
{
    public static function create(): void
    {
        global $wpdb;

        $table_name      = $wpdb->prefix . 'gateway_raptor_view_render';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            view_id bigint(20) unsigned NOT NULL,
            engine varchar(100) NOT NULL DEFAULT 'shortcode',
            js_type varchar(50) NOT NULL DEFAULT 'react',
            created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY view_id (view_id)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }
}
