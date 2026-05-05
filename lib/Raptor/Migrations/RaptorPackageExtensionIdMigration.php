<?php

namespace Gateway\Raptor\Migrations;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Migration: replace extension_key (string) with extension_id (bigint FK)
 * on gateway_raptor_package.
 *
 * Safe to run multiple times — each step is guarded by a column-existence check.
 */
class RaptorPackageExtensionIdMigration
{
    public static function create(): void
    {
        global $wpdb;

        $table = $wpdb->prefix . 'gateway_raptor_package';
        $ext   = $wpdb->prefix . 'gateway_raptor_extension';

        // 1. Add extension_id if missing (dbDelta handles idempotency for new installs)
        $cols = $wpdb->get_col("SHOW COLUMNS FROM `{$table}`", 0);

        if (!in_array('extension_id', $cols, true)) {
            $wpdb->query("ALTER TABLE `{$table}` ADD COLUMN `extension_id` bigint(20) unsigned NULL AFTER `package_key`");
        }

        // 2. Backfill extension_id from the old extension_key string, if the column still exists
        if (in_array('extension_key', $cols, true)) {
            $wpdb->query(
                "UPDATE `{$table}` p
                 INNER JOIN `{$ext}` e ON e.extension_key = p.extension_key
                 SET p.extension_id = e.id
                 WHERE p.extension_id IS NULL"
            );

            // 3. Drop the old string column now that data is migrated
            $wpdb->query("ALTER TABLE `{$table}` DROP COLUMN `extension_key`");
        }
    }
}
