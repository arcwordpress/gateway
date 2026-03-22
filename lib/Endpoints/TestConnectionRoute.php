<?php

namespace Gateway\Endpoints;

use Gateway\Collections\GatewaySettingsCollection;
use Gateway\Database\DatabaseConnection;

class TestConnectionRoute
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    public function register_routes()
    {
        register_rest_route('gateway/v1', '/test-connection', [
            'methods' => 'POST',
            'callback' => [$this, 'test_connection'],
            'permission_callback' => [$this, 'check_permissions'],
        ]);
    }

    public function test_connection(\WP_REST_Request $request)
    {
        $result = [
            'success' => false,
            'error' => '',
            'server_version' => '',
            'table_count' => 0,
            'custom_port' => '',
            'driver' => '',
        ];

        try {
            global $wpdb;

            $capsule = DatabaseConnection::getCapsule();
            if ($capsule === null) {
                return new \WP_REST_Response(['error' => 'Database not initialised'], 503);
            }
            $connection = $capsule->getConnection();
            $driver = DatabaseConnection::getDriver();
            $result['driver'] = $driver;

            // Get server version (driver-specific)
            if ($driver === 'sqlite') {
                $version = $connection->selectOne('SELECT sqlite_version() as version');
                $result['server_version'] = 'SQLite ' . $version->version;
            } else {
                $version = $connection->selectOne('SELECT VERSION() as version');
                $result['server_version'] = $version->version;
            }

            // Get table count with WordPress prefix (driver-specific)
            if ($driver === 'sqlite') {
                $tables = $connection->select(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE ?",
                    [$wpdb->prefix . '%']
                );
                $result['table_count'] = count($tables);
            } else {
                $tables = $connection->select("SHOW TABLES LIKE '" . $wpdb->prefix . "%'");
                $result['table_count'] = count($tables);
            }

            // Get custom port if set (only relevant for MySQL)
            if ($driver === 'mysql') {
                $custom_port = GatewaySettingsCollection::getSettings()->connection_port ?? '';
                if (!empty($custom_port)) {
                    $result['custom_port'] = intval($custom_port);
                }
            }

            $result['success'] = true;
        } catch (\Exception $e) {
            $result['error'] = $e->getMessage();
        }

        return rest_ensure_response($result);
    }

    public function check_permissions()
    {
        return current_user_can('manage_options');
    }
}
