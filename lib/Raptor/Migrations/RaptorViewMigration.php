<?php

namespace Gateway\Raptor\Migrations;

if (!defined('ABSPATH')) {
    exit;
}

class RaptorViewMigration
{
    public static function create(): void
    {
        global $wpdb;

        $table_name      = $wpdb->prefix . 'gateway_raptor_view';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            view_key varchar(200) NOT NULL DEFAULT '',
            view_list_id bigint(20) unsigned NULL,
            title varchar(200) NOT NULL DEFAULT '',
            description text NULL,
            status varchar(50) NOT NULL DEFAULT 'active',
            sort_order int(11) NOT NULL DEFAULT 0,
            source varchar(200) NULL,
            columns longtext NULL,
            facet_filters longtext NULL,
            default_sort longtext NULL,
            per_page int(11) NOT NULL DEFAULT 20,
            created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY view_key (view_key)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }
}
