<?php

namespace Gateway\Migrations;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Migration: gateway_settings
 *
 * Creates the gateway_settings table for storing application configuration.
 * Replaces scattered WordPress options (gateway_connection_port, gateway_anthropic_api_key, gateway_db_config).
 *
 * Safe to run multiple times — uses dbDelta() which is idempotent.
 */
class GatewaySettingsMigration
{
    public static function create(): void
    {
        global $wpdb;

        $table_name      = $wpdb->prefix . 'gateway_settings';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            db_driver varchar(50) NOT NULL DEFAULT 'mysql',
            connection_port varchar(10) NOT NULL DEFAULT '',
            sqlite_path varchar(500) NOT NULL DEFAULT '',
            is_sqlite_environment tinyint(1) NOT NULL DEFAULT 0,
            anthropic_api_key text NOT NULL,
            has_anthropic_key tinyint(1) NOT NULL DEFAULT 0,
            created_at timestamp NULL DEFAULT NULL,
            updated_at timestamp NULL DEFAULT NULL,
            PRIMARY KEY  (id)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }

    /**
     * Migrate existing WordPress options to the settings collection
     * 
     * Reads gateway_connection_port, gateway_anthropic_api_key, and gateway_db_config
     * and creates the singleton settings record (id: 1) if it doesn't exist.
     *
     * @param bool $deleteOldOptions Whether to delete old WordPress options after migration
     * @return void
     */
    public static function migrateFromOptions(bool $deleteOldOptions = false): void
    {
        // Check if settings record already exists
        $settings = \Gateway\Collections\GatewaySettingsCollection::find(1);
        if ($settings) {
            // Settings already migrated
            return;
        }

        // Read existing WordPress options
        $port = get_option('gateway_connection_port', '');
        $encryptedApiKey = get_option('gateway_anthropic_api_key', '');
        $dbConfig = get_option('gateway_db_config', []);

        $driver = $dbConfig['driver'] ?? 'mysql';
        $sqlitePath = $dbConfig['database'] ?? '';
        $isSqliteEnv = defined('SQLITE_DB_DROPIN_VERSION') || $driver === 'sqlite';

        // Create the settings record
        \Gateway\Collections\GatewaySettingsCollection::create([
            'id' => 1,
            'db_driver' => $driver,
            'connection_port' => $port,
            'sqlite_path' => $sqlitePath,
            'is_sqlite_environment' => $isSqliteEnv,
            'anthropic_api_key' => $encryptedApiKey, // Already encrypted
            'has_anthropic_key' => !empty($encryptedApiKey),
        ]);

        // Optionally clean up old options
        if ($deleteOldOptions) {
            delete_option('gateway_connection_port');
            delete_option('gateway_anthropic_api_key');
            delete_option('gateway_db_config');
        }
    }
}
