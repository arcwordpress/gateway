<?php

namespace Gateway\Raptor\Migrations;

if (!defined('ABSPATH')) {
    exit;
}

class RaptorFormMigration
{
    public static function create(): void
    {
        global $wpdb;

        $table_name      = $wpdb->prefix . 'gateway_raptor_form';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            form_key varchar(200) NOT NULL DEFAULT '',
            form_list_id bigint(20) unsigned NULL,
            title varchar(200) NOT NULL DEFAULT '',
            description text NULL,
            status varchar(50) NOT NULL DEFAULT 'draft',
            sort_order int(11) NOT NULL DEFAULT 0,
            form_config longtext NULL,
            success_message text NULL,
            notification_email varchar(200) NULL,
            created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY form_key (form_key),
            KEY form_list_id (form_list_id)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }
}
