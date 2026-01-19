<?php

namespace Gateway\Endpoints;

use Gateway\Security\Encryption;
use Gateway\Plugin;
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
        $encryptedKey = get_option('gateway_anthropic_api_key', '');
        $hasKey = !empty($encryptedKey);

        // Get database configuration
        $db_config = get_option('gateway_db_config', []);
        $driver = $db_config['driver'] ?? 'mysql';
        $sqlite_path = $db_config['database'] ?? '';

        // Check if we're in a SQLite environment (WordPress Playground detection)
        $is_sqlite_env = defined('SQLITE_DB_DROPIN_VERSION') || $driver === 'sqlite';

        return rest_ensure_response([
            'port' => get_option('gateway_connection_port', ''),
            'anthropic_api_key' => '', // Never send the actual key to frontend
            'has_anthropic_key' => $hasKey,
            'db_driver' => $driver,
            'sqlite_path' => $sqlite_path,
            'is_sqlite_environment' => $is_sqlite_env,
        ]);
    }

    public function save_settings(\WP_REST_Request $request)
    {
        $port = $request->get_param('port');
        $apiKey = $request->get_param('anthropic_api_key');
        $dbDriver = $request->get_param('db_driver');
        $sqlitePath = $request->get_param('sqlite_path');

        // Track if we need to clear connection cache
        $clear_cache = false;

        // Save the port (empty string is valid for default)
        if ($request->has_param('port')) {
            update_option('gateway_connection_port', $port);
            $clear_cache = true; // Port change affects connection
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

        // Save database configuration
        if ($request->has_param('db_driver')) {
            $db_config = get_option('gateway_db_config', []);
            $db_config['driver'] = $dbDriver;

            // If switching to SQLite, set the path
            if ($dbDriver === 'sqlite') {
                if (!empty($sqlitePath)) {
                    $db_config['database'] = $sqlitePath;
                } else {
                    // Use default path (findSQLiteDatabase method needs implementation)
                    $db_config['database'] = WP_CONTENT_DIR . '/database/.ht.sqlite';
                }
            }

            update_option('gateway_db_config', $db_config);
            $clear_cache = true; // Driver change affects connection
        } elseif ($request->has_param('sqlite_path')) {
            // Update just the SQLite path if driver is already SQLite
            $db_config = get_option('gateway_db_config', []);
            if (($db_config['driver'] ?? 'mysql') === 'sqlite') {
                $db_config['database'] = $sqlitePath;
                update_option('gateway_db_config', $db_config);
                $clear_cache = true; // Path change affects connection
            }
        }

        // Clear connection cache if any database settings changed
        if ($clear_cache && function_exists('gateway_clear_connection_cache')) {
            gateway_clear_connection_cache();
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
