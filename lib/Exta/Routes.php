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

        register_rest_route('gateway/v1', '/extensions', [
            'methods' => 'GET',
            'callback' => [$this, 'getExtensions'],
            'permission_callback' => [$this, 'checkPermissions'],
        ]);

        register_rest_route('gateway/v1', '/extensions', [
            'methods' => 'POST',
            'callback' => [$this, 'createExtension'],
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
     * Get all extensions from JSON files in extensions directory
     *
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response
     */
    public function getExtensions($request)
    {
        $extensions_dir = WP_CONTENT_DIR . '/gateway/extensions';
        $extensions = [];

        // Check if directory exists
        if (!is_dir($extensions_dir)) {
            return new \WP_REST_Response([
                'success' => true,
                'extensions' => []
            ], 200);
        }

        // Scan directory for JSON files
        $files = glob($extensions_dir . '/*.json');

        if ($files === false) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Failed to read extensions directory'
            ], 500);
        }

        // Parse each JSON file
        foreach ($files as $file) {
            $json_content = file_get_contents($file);
            
            if ($json_content === false) {
                continue;
            }

            $parsed = json_decode($json_content, true);
            
            if (json_last_error() === JSON_ERROR_NONE && $parsed !== null) {
                $extensions[] = $parsed;
            }
        }

        return new \WP_REST_Response([
            'success' => true,
            'extensions' => $extensions
        ], 200);
    }

    /**
     * Create a new extension
     *
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response
     */
    public function createExtension($request)
    {
        $json_data = $request->get_json_params();

        if (empty($json_data)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'No JSON data provided'
            ], 400);
        }

        if (!isset($json_data['key']) || empty($json_data['key'])) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Extension key is required'
            ], 400);
        }

        // Ensure extensions directory exists
        $extensions_dir = WP_CONTENT_DIR . '/gateway/extensions';
        if (!is_dir($extensions_dir)) {
            mkdir($extensions_dir, 0755, true);
        }

        $file_path = $extensions_dir . '/' . $json_data['key'] . '.json';

        // Check if file already exists
        if (file_exists($file_path)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Extension with this key already exists'
            ], 409);
        }

        // Save JSON to file
        $json_string = json_encode($json_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        $result = file_put_contents($file_path, $json_string);

        if ($result === false) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Failed to save extension file'
            ], 500);
        }

        return new \WP_REST_Response([
            'success' => true,
            'message' => 'Extension created successfully',
            'file_path' => $file_path,
            'extension' => $json_data
        ], 201);
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
