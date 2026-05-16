<?php

namespace Gateway;

if (!defined('ABSPATH')) {
    exit;
}

class PluginController
{
    public static function maybeRunMigrations(): void
    {
        $stored_version  = get_option('gateway_tables_schema', '');
        $current_version = GATEWAY_VERSION;

        if ($stored_version === $current_version && Database\CoreTablesController::coreTablesExist()) {
            set_transient('gateway_tables_installed', true, DAY_IN_SECONDS);
            return;
        }

        $success = Migrations\MigrationHooks::runCoreMigrations();

        if ($success && Database\CoreTablesController::coreTablesExist()) {
            update_option('gateway_tables_schema', $current_version, false);
            set_transient('gateway_tables_installed', true, DAY_IN_SECONDS);
        } else {
            set_transient('gateway_tables_installed', false, DAY_IN_SECONDS);
        }
    }

    public static function showConnectionNotice(): void
    {
        $settings_url = admin_url('admin.php?page=gateway#/settings/connection');
        echo '<div class="notice notice-error"><p>'
            . '<strong>Gateway:</strong> Cannot connect to the database. '
            . '<a href="' . esc_url($settings_url) . '">Open Gateway Settings</a> '
            . 'to restore the connection.'
            . '</p></div>';
    }
}
