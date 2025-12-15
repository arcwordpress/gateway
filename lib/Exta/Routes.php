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
        register_rest_route('gateway/v1', '/extensions/(?P<extension_key>[^/]+)/collections', [
            'methods' => ['GET', 'POST'],
            'callback' => function($request) {
                if ($request->get_method() === 'POST') {
                    return $this->saveCollection($request);
                }
                return $this->getCollections($request);
            },
            'permission_callback' => [$this, 'checkPermissions'],
        ]);

        register_rest_route('gateway/v1', '/extensions/(?P<extension_key>[^/]+)/collections/(?P<collection_key>[^/]+)', [
            'methods' => ['PUT', 'PATCH'],
            'callback' => [$this, 'updateCollection'],
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

        // Get extension key from URL route parameter
        $url_params = $request->get_url_params();
        $extension_key = isset($url_params['extension_key']) ? $url_params['extension_key'] : '';

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

        // Build paths
        $extension_dir = WP_CONTENT_DIR . '/gateway/extensions/' . $extension_key;
        $collections_dir = $extension_dir . '/collections';

        // Check if extension exists first
        if (!is_dir($extension_dir)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Extension not found: ' . $extension_dir
            ], 404);
        }

        // Ensure collections directory exists for this extension
        if (!is_dir($collections_dir)) {
            if (!mkdir($collections_dir, 0755)) {
                return new \WP_REST_Response([
                    'success' => false,
                    'message' => 'Failed to create collections directory'
                ], 500);
            }
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

        // Load extension data and merge all collections
        $extension_file = $extension_dir . '/extension.json';
        $extension_data = [];
        
        if (file_exists($extension_file)) {
            $extension_content = file_get_contents($extension_file);
            if ($extension_content !== false) {
                $extension_data = json_decode($extension_content, true);
            }
        }

        // Load all collections
        $all_collections = [];
        $collection_files = glob($collections_dir . '/*.json');
        if ($collection_files !== false) {
            foreach ($collection_files as $coll_file) {
                $coll_content = file_get_contents($coll_file);
                if ($coll_content !== false) {
                    $parsed = json_decode($coll_content, true);
                    if (json_last_error() === JSON_ERROR_NONE && $parsed !== null) {
                        $all_collections[] = $parsed;
                    }
                }
            }
        }

        // Merge collections into extension data
        $extension_data['collections'] = $all_collections;

        return new \WP_REST_Response([
            'success' => true,
            'message' => 'Collection saved successfully',
            'file_path' => $file_path,
            'collection' => $json_data,
            'extension' => $extension_data
        ], 200);
    }

    /**
     * Update collection JSON file
     *
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response
     */
    public function updateCollection($request)
    {
        $json_data = $request->get_json_params();

        if (empty($json_data)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'No JSON data provided'
            ], 400);
        }

        // Get extension key and original collection key from URL route parameters
        $url_params = $request->get_url_params();
        $extension_key = isset($url_params['extension_key']) ? $url_params['extension_key'] : '';
        $original_collection_key = isset($url_params['collection_key']) ? $url_params['collection_key'] : '';

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

        $new_collection_key = $json_data['key'];
        $collections_dir = WP_CONTENT_DIR . '/gateway/extensions/' . $extension_key . '/collections';

        if (!is_dir($collections_dir)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Collections directory not found'
            ], 404);
        }

        $old_file_path = $collections_dir . '/' . $original_collection_key . '.json';
        $new_file_path = $collections_dir . '/' . $new_collection_key . '.json';

        // Check if original file exists
        if (!file_exists($old_file_path)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Original collection file not found'
            ], 404);
        }

        // If key changed, check that new key doesn't already exist
        if ($original_collection_key !== $new_collection_key && file_exists($new_file_path)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'A collection with the new key already exists'
            ], 409);
        }

        // Save JSON to new file
        $json_string = json_encode($json_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        $result = file_put_contents($new_file_path, $json_string);

        if ($result === false) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Failed to save collection file'
            ], 500);
        }

        // If key changed, delete old file
        if ($original_collection_key !== $new_collection_key) {
            unlink($old_file_path);
        }

        return new \WP_REST_Response([
            'success' => true,
            'message' => 'Collection updated successfully',
            'file_path' => $new_file_path,
            'key_changed' => $original_collection_key !== $new_collection_key,
            'old_key' => $original_collection_key,
            'new_key' => $new_collection_key
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
        // Get extension key from URL route parameter
        $url_params = $request->get_url_params();
        $extension_key = isset($url_params['extension_key']) ? $url_params['extension_key'] : '';

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

        // Create collections subdirectory
        $collections_dir = $extension_dir . '/collections';
        if (!mkdir($collections_dir, 0755, true)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Failed to create collections directory'
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
