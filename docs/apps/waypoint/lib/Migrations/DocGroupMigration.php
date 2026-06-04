<?php

namespace Waypoint\Migrations;

class DocGroupMigration extends \Gateway\Migration
{
    protected static string $extension = 'waypoint';

    public static function create(): void
    {
        global $wpdb;

        $table   = $wpdb->prefix . 'doc_groups';
        $charset = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE {$table} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            doc_set_id bigint(20) unsigned NOT NULL,
            title varchar(255) NOT NULL,
            slug varchar(255) NOT NULL,
            position int(11) NOT NULL DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY doc_set_id_idx (doc_set_id),
            KEY slug_idx (slug),
            KEY position_idx (position)
        ) {$charset};";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }
}
