<?php

namespace Gateway\Raptor\Migrations;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Migration: gateway_raptor_collection_relationship
 *
 * Normalized pivot table for relationships between Raptor-managed collections.
 * Each row represents one directed relationship (source → target), e.g.
 * "posts hasMany comments" or "comment belongsTo post".
 *
 * Replaces the legacy JSON `relationships` column on gateway_raptor_collection.
 * Safe to run multiple times — dbDelta() is idempotent.
 */
class RaptorCollectionRelationshipMigration
{
    public static function create(): void
    {
        global $wpdb;

        $table_name      = $wpdb->prefix . 'gateway_raptor_collection_relationship';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            source_collection_id bigint(20) unsigned NOT NULL,
            target_collection_id bigint(20) unsigned NOT NULL,
            type varchar(50) NOT NULL DEFAULT 'belongsTo',
            method_name varchar(200) NOT NULL DEFAULT '',
            foreign_key varchar(200) NOT NULL DEFAULT '',
            owner_key varchar(200) NOT NULL DEFAULT 'id',
            created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY source_collection_id (source_collection_id),
            KEY target_collection_id (target_collection_id)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }
}
