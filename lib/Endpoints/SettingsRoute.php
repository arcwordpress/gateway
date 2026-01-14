<?php

namespace Gateway\Endpoints;

use Gateway\Security\Encryption;

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
            ],
        ]);
    }

    public function get_settings(\WP_REST_Request $request)
    {
        $encryptedKey = get_option('gateway_anthropic_api_key', '');
        $hasKey = !empty($encryptedKey);

        return rest_ensure_response([
            'port' => get_option('gateway_connection_port', ''),
            'anthropic_api_key' => '', // Never send the actual key to frontend
            'has_anthropic_key' => $hasKey,
        ]);
    }

    public function save_settings(\WP_REST_Request $request)
    {
        $port = $request->get_param('port');
        $apiKey = $request->get_param('anthropic_api_key');

        // Save the port (empty string is valid for default)
        if ($request->has_param('port')) {
            update_option('gateway_connection_port', $port);
        }

        // Save the API key if provided
        if ($request->has_param('anthropic_api_key')) {
            if (empty($apiKey)) {
                // If empty, delete the stored key
                delete_option('gateway_anthropic_api_key');
            } else {
                // Encrypt and store the API key
                $encrypted = Encryption::encrypt($apiKey);
                if ($encrypted === false) {
                    return new \WP_Error(
                        'encryption_failed',
                        __('Failed to encrypt API key. Please try again.', 'gateway'),
                        ['status' => 500]
                    );
                }
                update_option('gateway_anthropic_api_key', $encrypted);
            }
        }

        return rest_ensure_response([
            'success' => true,
            'message' => __('Settings saved successfully.', 'gateway'),
            'port' => $port,
            'has_anthropic_key' => !empty($apiKey) || !empty(get_option('gateway_anthropic_api_key')),
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
