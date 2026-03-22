<?php

namespace Gateway\Endpoints;

use Gateway\Database\DatabaseConnection;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * GET/POST /gateway/v1/settings/connection
 *
 * Reads and writes ONLY from wp_options — zero Eloquent, zero DB queries.
 * This endpoint is guaranteed to work regardless of the database state, so
 * the user can always recover from a broken connection (wrong driver, wrong
 * port, missing tables, etc.) without needing the gateway_settings table.
 */
class ConnectionRoute
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    public function register_routes()
    {
        register_rest_route('gateway/v1', '/settings/connection', [
            'methods'             => 'GET',
            'callback'            => [$this, 'get_connection'],
            'permission_callback' => [$this, 'check_permissions'],
        ]);

        register_rest_route('gateway/v1', '/settings/connection', [
            'methods'             => 'POST',
            'callback'            => [$this, 'save_connection'],
            'permission_callback' => [$this, 'check_permissions'],
            'args'                => [
                'db_driver' => [
                    'required'          => false,
                    'type'              => 'string',
                    'validate_callback' => [$this, 'validate_db_driver'],
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'connection_port' => [
                    'required'          => false,
                    'type'              => 'string',
                    'validate_callback' => [$this, 'validate_port'],
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
        ]);
    }

    public function get_connection(\WP_REST_Request $request)
    {
        $detected = DatabaseConnection::autoDetectDriver();

        return rest_ensure_response([
            'db_driver'       => get_option('gateway_connection_driver', $detected['driver'] ?? 'mysql'),
            'connection_port' => get_option('gateway_connection_port', ''),
        ]);
    }

    public function save_connection(\WP_REST_Request $request)
    {
        $driver = $request->has_param('db_driver')
            ? sanitize_text_field($request->get_param('db_driver'))
            : null;
        $port = $request->has_param('connection_port')
            ? (sanitize_text_field($request->get_param('connection_port')) ?? '')
            : null;

        if ($driver !== null) {
            update_option('gateway_connection_driver', $driver);
        }
        if ($port !== null) {
            update_option('gateway_connection_port', $port);
        }

        // Clear schema version so maybeRunMigrations() re-runs on next page load,
        // and clear the connection OK transient so boot() retries the connection.
        delete_option('gateway_schema_version');
        delete_transient('gateway_connection_ok');
        delete_transient('gateway_tables_missing');

        return rest_ensure_response([
            'success'         => true,
            'message'         => __('Connection settings saved. Reload the page to apply.', 'gateway'),
            'db_driver'       => get_option('gateway_connection_driver', 'mysql'),
            'connection_port' => get_option('gateway_connection_port', ''),
        ]);
    }

    public function validate_port($value, $request, $param)
    {
        if (empty($value)) {
            return true;
        }

        if (!is_numeric($value)) {
            return new \WP_Error('invalid_port', __('Port must be a number.', 'gateway'), ['status' => 400]);
        }

        $port = intval($value);
        if ($port < 1 || $port > 65535) {
            return new \WP_Error('invalid_port_range', __('Port must be between 1 and 65535.', 'gateway'), ['status' => 400]);
        }

        return true;
    }

    public function validate_db_driver($value, $request, $param)
    {
        if (!in_array($value, ['mysql', 'sqlite'], true)) {
            return new \WP_Error(
                'invalid_db_driver',
                __('Database driver must be either "mysql" or "sqlite".', 'gateway'),
                ['status' => 400]
            );
        }

        return true;
    }

    public function check_permissions()
    {
        return current_user_can('manage_options');
    }
}
