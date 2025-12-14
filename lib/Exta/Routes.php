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
        register_rest_route('gateway/v1', '/extensions/(?P<key>[^/]+)/collections', [
            'methods' => ['GET', 'POST'],
            'callback' => function($request) {
                if ($request->get_method() === 'POST') {
                    return $this->saveCollection($request);
                }
                return $this->getCollections($request);
            },
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

        // Get extension key from URL parameter
        $extension_key = $request->get_param('key');

        if (empty($extension_key)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Extension key is required'
            ], 400);
        }

        if (!isset($json_data['key']) || empty($json_data['key'])) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Collection key is required'
            ], 400);
        }

        $collection_key = $json_data['key'];

        // Ensure collections directory exists for this extension
        $collections_dir = WP_CONTENT_DIR . '/gateway/extensions/' . $extension_key . '/collections';
        if (!is_dir($collections_dir)) {
            mkdir($collections_dir, 0755, true);
        }

        $file_path = $collections_dir . '/' . $collection_key . '.json';

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
     * Get all collections for a specific extension
     *
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response
     */
    public function getCollections($request)
    {
        // Get extension key from URL parameter
        $extension_key = $request->get_param('key');

        if (empty($extension_key)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Extension key is required'
            ], 400);
        }

        $collections_dir = WP_CONTENT_DIR . '/gateway/extensions/' . $extension_key . '/collections';
        $collections = [];

        // Check if directory exists
        if (!is_dir($collections_dir)) {
            return new \WP_REST_Response([
                'success' => true,
                'collections' => []
            ], 200);
        }

        // Scan directory for JSON files
        $files = glob($collections_dir . '/*.json');

        if ($files === false) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Failed to read collections directory'
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
                $collections[] = $parsed;
            }
        }

        return new \WP_REST_Response([
            'success' => true,
            'collections' => $collections
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

        // Scan directory for subdirectories
        $dirs = glob($extensions_dir . '/*', GLOB_ONLYDIR);

        if ($dirs === false) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Failed to read extensions directory'
            ], 500);
        }

        // Parse extension.json from each subdirectory
        foreach ($dirs as $dir) {
            $extension_file = $dir . '/extension.json';
            
            if (!file_exists($extension_file)) {
                continue;
            }
            
            $json_content = file_get_contents($extension_file);
            
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

        $extension_key = $json_data['key'];

        // Ensure extension directory exists
        $extension_dir = WP_CONTENT_DIR . '/gateway/extensions/' . $extension_key;
        if (is_dir($extension_dir)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Extension with this key already exists'
            ], 409);
        }

        if (!mkdir($extension_dir, 0755, true)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Failed to create extension directory'
            ], 500);
        }

        $file_path = $extension_dir . '/extension.json';

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
