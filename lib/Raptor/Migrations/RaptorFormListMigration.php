<?php

namespace Gateway\Raptor\Migrations;

if (!defined('ABSPATH')) {
    exit;
}

class RaptorFormListMigration
{
    public static function create(): void
    {
        global $wpdb;

        $table_name      = $wpdb->prefix . 'gateway_raptor_form_list';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            collection_id bigint(20) unsigned NOT NULL,
            created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY collection_id (collection_id)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }
}
