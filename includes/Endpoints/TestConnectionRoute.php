<?php

namespace Gateway\Endpoints;

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
        ];

        try {
            global $wpdb;

            $capsule = DatabaseConnection::getCapsule();
            $connection = $capsule->getConnection();

            // Get server version
            $version = $connection->selectOne('SELECT VERSION() as version');
            $result['server_version'] = $version->version;

            // Get table count with WordPress prefix
            $tables = $connection->select("SHOW TABLES LIKE '" . $wpdb->prefix . "%'");
            $result['table_count'] = count($tables);

            // Get custom port if set
            $custom_port = get_option('gateway_connection_port', '');
            if (!empty($custom_port)) {
                $result['custom_port'] = intval($custom_port);
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
