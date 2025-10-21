<?php

namespace Gateway\Endpoints;

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
            ],
        ]);
    }

    public function get_settings(\WP_REST_Request $request)
    {
        return rest_ensure_response([
            'port' => get_option('gateway_connection_port', ''),
        ]);
    }

    public function save_settings(\WP_REST_Request $request)
    {
        $port = $request->get_param('port');

        // Save the port (empty string is valid for default)
        update_option('gateway_connection_port', $port);

        return rest_ensure_response([
            'success' => true,
            'message' => __('Settings saved successfully.', 'gateway'),
            'port' => $port,
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

    public function check_permissions()
    {
        return current_user_can('manage_options');
    }
}
