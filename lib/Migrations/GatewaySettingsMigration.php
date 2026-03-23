<?php

namespace Gateway\Migrations;

if (!defined('ABSPATH')) {
    exit;
}

class GatewaySettingsMigration
{
    public static function create(): void
    {
        global $wpdb;

        $table_name      = $wpdb->prefix . 'gateway_settings';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            anthropic_api_key text NOT NULL,
            has_anthropic_key tinyint(1) NOT NULL DEFAULT 0,
            created_at timestamp NULL DEFAULT NULL,
            updated_at timestamp NULL DEFAULT NULL,
            PRIMARY KEY  (id)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }

    public static function migrateFromOptions(bool $overwrite = true): void
    {
        try {
            $settings = \Gateway\Collections\GatewaySettingsCollection::find(1);
        } catch (\Exception $e) {
            return;
        }

        try {
            \Gateway\Collections\GatewaySettingsCollection::create([
                'id'                 => 1,
                'anthropic_api_key'  => $encryptedApiKey,
                'has_anthropic_key'  => !empty($encryptedApiKey),
            ]);
        } catch (\Exception $e) {
            error_log('Gateway: migrateFromOptions could not create settings record: ' . $e->getMessage());
            return;
        }

    }
}