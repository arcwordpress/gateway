<?php

namespace Gateway\Endpoints;

use Gateway\Collections\GatewaySettingsCollection;
use Gateway\Database\DatabaseConnection;

class SettingsRoute
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    public function register_routes()
    {
        register_rest_route('gateway/v1', '/settings', [
            'methods' => 'GET',
            'callback' => [$this, 'get_settings'],
            'permission_callback' => [$this, 'check_permissions'],
        ]);

        register_rest_route('gateway/v1', '/settings', [
            'methods' => 'POST',
            'callback' => [$this, 'save_settings'],
            'permission_callback' => [$this, 'check_permissions'],
            'args' => [
                'port' => [
                    'required' => false,
                    'type' => 'string',
                    'validate_callback' => [$this, 'validate_port'],
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'anthropic_api_key' => [
                    'required' => false,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'db_driver' => [
                    'required' => false,
                    'type' => 'string',
                    'validate_callback' => [$this, 'validate_db_driver'],
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'sqlite_path' => [
                    'required' => false,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
        ]);
    }

    public function get_settings(\WP_REST_Request $request)
    {
        $settings = GatewaySettingsCollection::getSettings();
        return rest_ensure_response($settings->toApiResponse());
    }

    public function save_settings(\WP_REST_Request $request)
    {
        $settings = GatewaySettingsCollection::getSettings();

        if ($request->has_param('port')) {
            $settings->connection_port = $request->get_param('port') ?? '';
        }

        if ($request->has_param('anthropic_api_key')) {
            // The GatewaySettingsCollection saving hook handles encryption and
            // the has_anthropic_key flag automatically.
            $settings->anthropic_api_key = $request->get_param('anthropic_api_key') ?? '';
        }

        if ($request->has_param('db_driver')) {
            $settings->db_driver = $request->get_param('db_driver');
            $sqlitePath = $request->get_param('sqlite_path');
            if ($settings->db_driver === 'sqlite') {
                $settings->sqlite_path = !empty($sqlitePath)
                    ? $sqlitePath
                    : WP_CONTENT_DIR . '/database/.ht.sqlite';
            }
        } elseif ($request->has_param('sqlite_path') && $settings->db_driver === 'sqlite') {
            $settings->sqlite_path = $request->get_param('sqlite_path');
        }

        $settings->save();
        // The GatewaySettingsCollection saved hook clears the connection cache.

        return rest_ensure_response([
            'success'          => true,
            'message'          => __('Settings saved successfully.', 'gateway'),
            'port'             => $settings->connection_port,
            'has_anthropic_key' => (bool) $settings->has_anthropic_key,
        ]);
    }

    public function validate_port($value, $request, $param)
    {
        // Empty is valid (means use default)
        if (empty($value)) {
            return true;
        }

        // Must be numeric
        if (!is_numeric($value)) {
            return new \WP_Error(
                'invalid_port',
                __('Port must be a number.', 'gateway'),
                ['status' => 400]
            );
        }

        $port = intval($value);

        // Must be in valid port range
        if ($port < 1 || $port > 65535) {
            return new \WP_Error(
                'invalid_port_range',
                __('Port must be between 1 and 65535.', 'gateway'),
                ['status' => 400]
            );
        }

        return true;
    }

    public function validate_db_driver($value, $request, $param)
    {
        // Must be either 'mysql' or 'sqlite'
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
