<?php

namespace Gateway\Raptor\Endpoints;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST API routes for file-based collection management within a Raptor extension.
 *
 * Endpoints:
 *   GET    /gateway/v1/raptor/extension/{key}/collections                      — list collections (JSON files)
 *   POST   /gateway/v1/raptor/extension/{key}/collections                      — save collection JSON + generate class
 *   PATCH  /gateway/v1/raptor/extension/{key}/collections/{collection_key}     — update collection JSON + class
 */
class ExtensionCrudRoutes
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    public function registerRoutes()
    {
        register_rest_route('gateway/v1', '/raptor/extension/(?P<extension_key>[a-zA-Z0-9_-]+)/collections', [
            'methods' => ['GET', 'POST'],
            'callback' => function ($request) {
                if ($request->get_method() === 'POST') {
                    return $this->saveCollection($request);
                }
                return $this->getCollections($request);
            },
            'permission_callback' => [$this, 'checkPermissions'],
        ]);

        register_rest_route('gateway/v1', '/raptor/extension/(?P<extension_key>[a-zA-Z0-9_-]+)/collections/(?P<collection_key>[a-zA-Z0-9_-]+)', [
            'methods' => ['PUT', 'PATCH'],
            'callback' => [$this, 'updateCollection'],
            'permission_callback' => [$this, 'checkPermissions'],
        ]);
    }

    public function saveCollection($request)
    {
        $json_data = $request->get_json_params();

        if (empty($json_data)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'No JSON data provided'
            ], 400);
        }

        $url_params    = $request->get_url_params();
        $extension_key = isset($url_params['extension_key']) ? $url_params['extension_key'] : '';

        if (empty($extension_key)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Extension key is required'
            ], 400);
        }

        if (!$this->validateKey($extension_key)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Invalid extension key'
            ], 400);
        }

        if (!isset($json_data['key']) || empty($json_data['key'])) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Collection key is required'
            ], 400);
        }

        $collection_key = $json_data['key'];

        if (!$this->validateKey($collection_key)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Invalid collection key'
            ], 400);
        }

        $extension_dir   = WP_CONTENT_DIR . '/gateway/extensions/' . $extension_key;
        $collections_dir = $extension_dir . '/collections';

        if (!is_dir($extension_dir)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Extension not found: ' . $extension_dir
            ], 404);
        }

        $base_extensions_dir = WP_CONTENT_DIR . '/gateway/extensions';
        if (!$this->pathWithinBase($extension_dir, $base_extensions_dir)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Invalid extension path'
            ], 400);
        }

        if (!is_dir($collections_dir)) {
            if (!mkdir($collections_dir, 0755)) {
                return new \WP_REST_Response([
                    'success' => false,
                    'message' => 'Failed to create collections directory'
                ], 500);
            }
        }

        $file_path   = $collections_dir . '/' . $collection_key . '.json';
        $json_string = json_encode($json_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        $result      = file_put_contents($file_path, $json_string);

        if ($result === false) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Failed to save collection file'
            ], 500);
        }

        $plugin_slug = str_replace('_', '-', $extension_key);
        $namespace   = str_replace('_', '', ucwords($extension_key, '_'));

        $class_generated = \Gateway\Collections\FileFromData::generateCollectionClass(
            $json_data,
            $plugin_slug,
            $namespace
        );

        $migration_result = $this->generateAndRunMigration($json_data, $extension_key);

        $extension_file = $extension_dir . '/extension.json';
        $extension_data = [];
        if (file_exists($extension_file)) {
            $extension_content = file_get_contents($extension_file);
            if ($extension_content !== false) {
                $extension_data = json_decode($extension_content, true);
            }
        }

        $all_collections    = [];
        $collection_files   = glob($collections_dir . '/*.json');
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

        $extension_data['collections'] = $all_collections;

        $response_data = [
            'success'         => true,
            'message'         => 'Collection saved successfully',
            'file_path'       => $file_path,
            'collection'      => $json_data,
            'extension'       => $extension_data,
            'class_generated' => $class_generated,
            'migration'       => $migration_result,
        ];

        if (!$class_generated) {
            $response_data['message'] .= ', but PHP class generation failed (check error logs)';
        }
        if ($migration_result['migration_ran']) {
            $response_data['message'] .= '. Database table created/updated.';
        } elseif (isset($migration_result['error'])) {
            $response_data['message'] .= '. Migration failed: ' . $migration_result['error'];
        }

        return new \WP_REST_Response($response_data, 200);
    }

    public function updateCollection($request)
    {
        $json_data = $request->get_json_params();

        if (empty($json_data)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'No JSON data provided'
            ], 400);
        }

        $url_params              = $request->get_url_params();
        $extension_key           = isset($url_params['extension_key']) ? $url_params['extension_key'] : '';
        $original_collection_key = isset($url_params['collection_key']) ? $url_params['collection_key'] : '';

        if (empty($extension_key) || !$this->validateKey($extension_key)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Invalid or missing extension key'
            ], 400);
        }

        if (!empty($original_collection_key) && !$this->validateKey($original_collection_key)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Invalid collection key'
            ], 400);
        }

        if (!isset($json_data['key']) || empty($json_data['key'])) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Collection key is required'
            ], 400);
        }

        $new_collection_key = $json_data['key'];
        if (!$this->validateKey($new_collection_key)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Invalid collection key'
            ], 400);
        }

        $collections_dir = WP_CONTENT_DIR . '/gateway/extensions/' . $extension_key . '/collections';

        if (!is_dir($collections_dir)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Collections directory not found'
            ], 404);
        }

        $base_extensions_dir = WP_CONTENT_DIR . '/gateway/extensions';
        if (!$this->pathWithinBase($collections_dir, $base_extensions_dir)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Invalid extension path'
            ], 400);
        }

        $old_file_path = $collections_dir . '/' . $original_collection_key . '.json';
        $new_file_path = $collections_dir . '/' . $new_collection_key . '.json';

        if (!file_exists($old_file_path)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Original collection file not found'
            ], 404);
        }

        if ($original_collection_key !== $new_collection_key && file_exists($new_file_path)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'A collection with the new key already exists'
            ], 409);
        }

        $json_string = json_encode($json_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        $result      = file_put_contents($new_file_path, $json_string);

        if ($result === false) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Failed to save collection file'
            ], 500);
        }

        $plugin_slug = str_replace('_', '-', $extension_key);
        $namespace   = str_replace('_', '', ucwords($extension_key, '_'));

        $class_generated = \Gateway\Collections\FileFromData::generateCollectionClass(
            $json_data,
            $plugin_slug,
            $namespace
        );

        $migration_result = $this->generateAndRunMigration($json_data, $extension_key);

        if ($original_collection_key !== $new_collection_key) {
            unlink($old_file_path);
            $old_class_name = str_replace('_', '', ucwords($original_collection_key, '_'));
            $old_class_file = WP_PLUGIN_DIR . '/' . $plugin_slug . '/lib/Collections/' . $old_class_name . '.php';
            if (file_exists($old_class_file)) {
                unlink($old_class_file);
            }
        }

        $response_data = [
            'success'         => true,
            'message'         => 'Collection updated successfully',
            'file_path'       => $new_file_path,
            'key_changed'     => $original_collection_key !== $new_collection_key,
            'old_key'         => $original_collection_key,
            'new_key'         => $new_collection_key,
            'class_generated' => $class_generated,
            'migration'       => $migration_result,
        ];

        if (!$class_generated) {
            $response_data['message'] .= ', but PHP class regeneration failed (check error logs)';
        }
        if ($migration_result['migration_ran']) {
            $response_data['message'] .= '. Database table updated.';
        } elseif (isset($migration_result['error'])) {
            $response_data['message'] .= '. Migration failed: ' . $migration_result['error'];
        }

        return new \WP_REST_Response($response_data, 200);
    }

    public function getCollections($request)
    {
        $url_params    = $request->get_url_params();
        $extension_key = isset($url_params['extension_key']) ? $url_params['extension_key'] : '';

        if (empty($extension_key) || !$this->validateKey($extension_key)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Invalid or missing extension key'
            ], 400);
        }

        $collections_dir = WP_CONTENT_DIR . '/gateway/extensions/' . $extension_key . '/collections';

        if (!is_dir($collections_dir)) {
            return new \WP_REST_Response(['success' => true, 'collections' => []], 200);
        }

        $files = glob($collections_dir . '/*.json');
        if ($files === false) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Failed to read collections directory'
            ], 500);
        }

        $collections = [];
        foreach ($files as $file) {
            $json_content = file_get_contents($file);
            if ($json_content === false) continue;
            $parsed = json_decode($json_content, true);
            if (json_last_error() === JSON_ERROR_NONE && $parsed !== null) {
                $collections[] = $parsed;
            }
        }

        return new \WP_REST_Response(['success' => true, 'collections' => $collections], 200);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private function generateAndRunMigration($collectionData, $extension_key)
    {
        try {
            if (empty($collectionData['fields'])) {
                return [
                    'success'             => true,
                    'migration_generated' => false,
                    'migration_ran'       => false,
                    'message'             => 'No fields defined, skipping migration',
                    'file_path'           => null,
                ];
            }

            $plugin_slug = str_replace('_', '-', $extension_key);
            $namespace   = str_replace('_', '', ucwords($extension_key, '_'));
            $migration   = \Gateway\Database\MigrationGenerator::generateFromData($collectionData, $namespace);
            $plugin_dir  = WP_PLUGIN_DIR . '/' . $plugin_slug;
            $database_dir = $plugin_dir . '/lib/Database';

            if (!is_dir($database_dir) && !wp_mkdir_p($database_dir)) {
                return [
                    'success'             => false,
                    'migration_generated' => false,
                    'migration_ran'       => false,
                    'error'               => 'Failed to create Database directory',
                    'file_path'           => null,
                ];
            }

            $migration_file = $database_dir . '/' . $migration['className'] . '.php';
            if (file_put_contents($migration_file, $migration['code']) === false) {
                return [
                    'success'             => false,
                    'migration_generated' => false,
                    'migration_ran'       => false,
                    'error'               => 'Failed to write migration file',
                    'file_path'           => null,
                ];
            }

            require_once $migration_file;

            $full_class_name = $namespace . '\\Database\\' . $migration['className'];

            if (class_exists($full_class_name) && method_exists($full_class_name, 'create')) {
                $full_class_name::create();
                return [
                    'success'             => true,
                    'migration_generated' => true,
                    'migration_ran'       => true,
                    'file_path'           => $migration_file,
                    'table_name'          => $collectionData['key'],
                ];
            }

            return [
                'success'             => false,
                'migration_generated' => true,
                'migration_ran'       => false,
                'error'               => "Migration class {$full_class_name} not found or missing create() method",
                'file_path'           => $migration_file,
            ];

        } catch (\Throwable $e) {
            return [
                'success'             => false,
                'migration_generated' => false,
                'migration_ran'       => false,
                'error'               => $e->getMessage(),
                'file_path'           => null,
            ];
        }
    }

    private function validateKey($key)
    {
        return is_string($key) && preg_match('/^[a-zA-Z0-9_-]+$/', $key) === 1;
    }

    private function pathWithinBase($path, $base_dir)
    {
        $real_base = realpath($base_dir);
        $real_path = realpath($path);
        if ($real_base === false || $real_path === false) {
            return false;
        }
        return strpos($real_path . DIRECTORY_SEPARATOR, $real_base . DIRECTORY_SEPARATOR) === 0;
    }

    public function checkPermissions()
    {
        return current_user_can('manage_options');
    }
}
