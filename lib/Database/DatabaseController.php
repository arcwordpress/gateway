<?php

namespace Gateway\Database;

if (!defined('ABSPATH')) {
    exit;
}

class DatabaseController
{
    /**
     * Returns true when the DB connection is confirmed and all core tables are installed.
     * Relies on transients set during Plugin::boot() and Plugin::maybeRunMigrations().
     */
    public static function isDbReady(): bool
    {
        return get_transient('gateway_connection_ok') === '1'
            && (bool) get_transient('gateway_tables_installed');
    }
}
