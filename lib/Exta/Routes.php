<?php

namespace Gateway\Exta;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class Routes
{
    /**
     * Initialize routes
     */
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    /**
     * Register REST API routes
     */
    public function registerRoutes()
    {
        register_rest_route('gateway/v1', '/exta/collection/save', [
            'methods' => 'POST',
            'callback' => [$this, 'saveCollection'],
            'permission_callback' => [$this, 'checkPermissions'],
        ]);
    }

    /**
     * Save collection JSON to file
     *
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response
     */
    public function saveCollection($request)
    {
        $json_data = $request->get_json_params();

        if (empty($json_data)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'No JSON data provided'
            ], 400);
        }

        // Ensure gateway directory exists
        $gateway_dir = WP_CONTENT_DIR . '/gateway';
        if (!is_dir($gateway_dir)) {
            mkdir($gateway_dir, 0755, true);
        }

        $file_path = $gateway_dir . '/collection-exta.json';

        // Save JSON to file
        $json_string = json_encode($json_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        $result = file_put_contents($file_path, $json_string);

        if ($result === false) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Failed to save collection file'
            ], 500);
        }

        return new \WP_REST_Response([
            'success' => true,
            'message' => 'Collection saved successfully',
            'file_path' => $file_path,
            'bytes_written' => $result
        ], 200);
    }

    /**
     * Check user permissions
     *
     * @return bool
     */
    public function checkPermissions()
    {
        return current_user_can('manage_options');
    }
}
