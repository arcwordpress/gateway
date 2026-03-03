<?php

namespace Gateway\Migrations;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Migration: rename gateway_raptor_collections → gateway_raptor_collection
 *
 * One-time rename to enforce the singular-table convention across all
 * Raptor-managed tables. Safe to run multiple times — no-op when the old
 * table no longer exists or the new table is already present.
 */
class GatewayRaptorCollectionRenameMigration
{
    public static function create(): void
    {
        global $wpdb;

        $old = $wpdb->prefix . 'gateway_raptor_collections';
        $new = $wpdb->prefix . 'gateway_raptor_collection';

        $old_exists = $wpdb->get_var("SHOW TABLES LIKE '{$old}'") === $old;
        $new_exists = $wpdb->get_var("SHOW TABLES LIKE '{$new}'") === $new;

        if ($old_exists && !$new_exists) {
            $wpdb->query("RENAME TABLE `{$old}` TO `{$new}`");
        }
    }
}
