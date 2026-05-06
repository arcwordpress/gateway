<?php

namespace Gateway\Raptor\Endpoints;

use Gateway\Raptor\Build\RaptorBuilder;
use Gateway\Raptor\Collections\RaptorCollection;
use Gateway\Raptor\Collections\RaptorExtension;
use Gateway\Raptor\Controllers\CollectionController;
use Gateway\Raptor\Controllers\RelationshipController;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST API routes for Raptor-managed collections.
 *
 * All endpoints are scoped to /gateway/v1/raptor/collection and require
 * the manage_options capability.
 *
 * Endpoints:
 *   GET    /gateway/v1/raptor/collection              — list all
 *   POST   /gateway/v1/raptor/collection              — create
 *   GET    /gateway/v1/raptor/collection/{key}        — get one
 *   PATCH  /gateway/v1/raptor/collection/{key}        — update
 *   DELETE /gateway/v1/raptor/collection/{key}        — delete
 */
class CollectionRoutes
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    // ─── Route registration ───────────────────────────────────────────────

    public function registerRoutes(): void
    {
        register_rest_route('gateway/v1', '/raptor/collection', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getCollections'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'createCollection'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);

        register_rest_route('gateway/v1', '/raptor/collection/(?P<collection_key>[a-zA-Z0-9_\-]+)', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getCollection'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'PATCH, PUT',
                'callback'            => [$this, 'updateCollection'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'DELETE',
                'callback'            => [$this, 'deleteCollection'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);
    }

    // ─── Handlers ─────────────────────────────────────────────────────────

    public function getCollections(\WP_REST_Request $request): \WP_REST_Response
    {
        try {
            $query = RaptorCollection::orderBy('created_at', 'asc');

            $extensionKey = $request->get_param('extension_key');
            if ($extensionKey) {
                $extension = RaptorExtension::where('extension_key', sanitize_text_field($extensionKey))->first();
                if ($extension) {
                    $query->where('extension_id', $extension->id);
                }
            }

            $collections = $query->get();

            // Eager-load pivot relationships — wrapped so a missing table (pre-migration)
            // degrades gracefully instead of returning 503.
            try {
                $collections->load('collectionRelationships.targetCollection');
            } catch (\Throwable $e) {
                // relationship table not yet migrated — continue without rels
            }

            if ($request->get_param('with_nested')) {
                try {
                    $collections->load('fieldList.fields', 'viewList.views', 'formList.forms');
                } catch (\Throwable $e) {
                    // nested tables not yet migrated — return without nested data
                }
            }

            // Fetch record counts in one query: SELECT table_name, table_rows FROM information_schema
            // keyed by table name so each collection can look up its own count in O(1).
            $recordCounts = $this->fetchRecordCounts(
                $collections->pluck('collection_key')->toArray()
            );

            $output = $collections->map(function (RaptorCollection $col) use ($recordCounts) {
                $arr = $col->toArray();
                try {
                    $arr['relationships'] = RelationshipController::toApiArray($col);
                } catch (\Throwable $e) {
                    $arr['relationships'] = [];
                }
                $arr['record_count'] = $recordCounts[$col->collection_key] ?? null;
                return $arr;
            })->values()->all();

            return new \WP_REST_Response([
                'success'     => true,
                'collections' => $output,
            ], 200);
        } catch (\Throwable $e) {
            return new \WP_REST_Response([
                'code'    => 'gateway_tables_missing',
                'message' => 'Gateway database tables are not yet initialised. Check Gateway Settings.',
            ], 503);
        }
    }

    public function createCollection(\WP_REST_Request $request): \WP_REST_Response
    {
        try {
            $data  = $request->get_json_params() ?? [];
            $title = sanitize_text_field($data['title'] ?? '');

            if (!$title) {
                return new \WP_REST_Response([
                    'success' => false,
                    'message' => 'Title is required.',
                ], 400);
            }

            // Use provided key or auto-generate from title.
            $key = isset($data['collection_key']) && $data['collection_key']
                ? $this->sanitizeKey($data['collection_key'])
                : $this->titleToKey($title);

            if (!$key) {
                return new \WP_REST_Response([
                    'success' => false,
                    'message' => 'Could not generate a valid collection key from the given title.',
                ], 400);
            }

            if (RaptorCollection::where('collection_key', $key)->exists()) {
                return new \WP_REST_Response([
                    'success' => false,
                    'message' => "A collection with key \"{$key}\" already exists.",
                ], 409);
            }

            $extensionId = null;

            // Accept either extension_id (numeric) or extension_key (string)
            if (!empty($data['extension_id'])) {
                $extensionId = (int) $data['extension_id'];
            } elseif (!empty($data['extension_key'])) {
                $ext = RaptorExtension::where('extension_key', sanitize_text_field($data['extension_key']))->first();
                $extensionId = $ext ? $ext->id : null;
            }

            $createData = [
                'collection_key' => $key,
                'extension_id'   => $extensionId,
                'title'          => $title,
                'description'    => sanitize_textarea_field($data['description'] ?? ''),
                'status'         => 'active',
                'registered'     => isset($data['registered']) ? (bool) $data['registered'] : true,
            ];
            $packageKey = !empty($data['package_key']) ? sanitize_text_field($data['package_key']) : null;
            if ($packageKey !== null) {
                $createData['package_key'] = $packageKey;
            }
            $labelField = !empty($data['label_field']) ? sanitize_text_field($data['label_field']) : null;
            if ($labelField !== null) {
                $createData['label_field'] = $labelField;
            }

            $collection = CollectionController::create($createData);

            // Build the extension if this collection has one
            $buildResult = null;
            if ($extensionId) {
                $buildResult = (new RaptorBuilder())->buildFromCollection($collection);
            }

            $response = [
                'success'    => true,
                'message'    => 'Collection created.',
                'collection' => $collection->toArray(),
            ];

            if ($buildResult) {
                $response['build'] = $buildResult;
            }

            return new \WP_REST_Response($response, 201);
        } catch (\Throwable $e) {
            return new \WP_REST_Response([
                'code'    => 'gateway_tables_missing',
                'message' => 'Gateway database tables are not yet initialised. Check Gateway Settings.',
            ], 503);
        }
    }

    public function getCollection(\WP_REST_Request $request): \WP_REST_Response
    {
        try {
            $collection = $this->findOrFail($request->get_param('collection_key'));
            if ($collection instanceof \WP_REST_Response) {
                return $collection;
            }

            $outputFiles = (new RaptorBuilder())->outputFilesForCollection($collection);
            $collection->loadMissing(['collectionRelationships.targetCollection']);

            return new \WP_REST_Response([
                'success'    => true,
                'collection' => array_merge(
                    CollectionController::withNested($collection)->toArray(),
                    ['fields'         => $collection->getFields()],
                    ['output_files'   => $outputFiles],
                    ['package_key'    => $collection->package_key],
                    ['label_field'    => $collection->label_field],
                    ['relationships'  => RelationshipController::toApiArray($collection)],
                ),
            ], 200);
        } catch (\Throwable $e) {
            return new \WP_REST_Response([
                'code'    => 'gateway_tables_missing',
                'message' => 'Gateway database tables are not yet initialised. Check Gateway Settings.',
            ], 503);
        }
    }

    public function updateCollection(\WP_REST_Request $request): \WP_REST_Response
    {
        try {
            $collection = $this->findOrFail($request->get_param('collection_key'));
            if ($collection instanceof \WP_REST_Response) {
                return $collection;
            }

            $data   = $request->get_json_params() ?? [];
            $update = [];

            if (isset($data['title'])) {
                $update['title'] = sanitize_text_field($data['title']);
            }
            if (isset($data['description'])) {
                $update['description'] = sanitize_textarea_field($data['description']);
            }
            if (isset($data['status'])) {
                $update['status'] = sanitize_text_field($data['status']);
            }
            if (array_key_exists('registered', $data)) {
                $update['registered'] = (bool) $data['registered'];
            }
            if (isset($data['relationships'])) {
                $update['relationships'] = is_array($data['relationships']) ? $data['relationships'] : null;
            }
            if (!empty($data['package_key'])) {
                $update['package_key'] = sanitize_text_field($data['package_key']);
            }
            if (array_key_exists('label_field', $data)) {
                $update['label_field'] = !empty($data['label_field'])
                    ? sanitize_text_field($data['label_field'])
                    : null;
            }

            $collection->update($update);

            $buildResult = null;
            if ($collection->extension_id) {
                $buildResult = (new RaptorBuilder())->buildFromCollection($collection);
            }

            $response = [
                'success'    => true,
                'collection' => $collection->fresh()->toArray(),
            ];

            if ($buildResult) {
                $response['build'] = $buildResult;
            }

            return new \WP_REST_Response($response, 200);
        } catch (\Throwable $e) {
            return new \WP_REST_Response([
                'code'    => 'gateway_tables_missing',
                'message' => 'Gateway database tables are not yet initialised. Check Gateway Settings.',
            ], 503);
        }
    }

    public function deleteCollection(\WP_REST_Request $request): \WP_REST_Response
    {
        try {
            $collection = $this->findOrFail($request->get_param('collection_key'));
            if ($collection instanceof \WP_REST_Response) {
                return $collection;
            }

            $extension = $collection->extension_id ? $collection->extension : null;
            $collection->delete();

            if ($extension) {
                (new RaptorBuilder())->build($extension->extension_key);
            }

            return new \WP_REST_Response([
                'success' => true,
                'message' => 'Collection deleted.',
            ], 200);
        } catch (\Throwable $e) {
            return new \WP_REST_Response([
                'code'    => 'gateway_tables_missing',
                'message' => 'Gateway database tables are not yet initialised. Check Gateway Settings.',
            ], 503);
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────

    /**
     * Returns the RaptorCollection model or a 404 response.
     *
     * @return RaptorCollection|\WP_REST_Response
     */
    private function findOrFail(string $key)
    {
        $collection = RaptorCollection::where('collection_key', $key)->first();

        if (!$collection) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Collection not found.',
            ], 404);
        }

        return $collection;
    }

    private function titleToKey(string $title): string
    {
        $key = strtolower($title);
        $key = preg_replace('/\s+/', '_', $key);
        $key = preg_replace('/[^a-z0-9_]/', '', $key);
        $key = trim($key, '_');
        return (string) substr($key, 0, 200);
    }

    private function sanitizeKey(string $key): string
    {
        $key = strtolower($key);
        $key = preg_replace('/[^a-z0-9_]/', '', $key);
        return (string) substr(trim($key, '_'), 0, 200);
    }

    /**
     * Returns a map of collection_key => record_count fetched in a single
     * information_schema query rather than one COUNT(*) per collection.
     *
     * Note: information_schema.tables.TABLE_ROWS is an estimate for InnoDB.
     * For exact counts pass $exact = true (runs one COUNT per table).
     *
     * @param  string[] $collectionKeys
     * @return array<string, int|null>
     */
    private function fetchRecordCounts(array $collectionKeys): array
    {
        if (empty($collectionKeys)) {
            return [];
        }

        global $wpdb;

        $prefix     = $wpdb->prefix . 'gateway_';
        $tableNames = array_map(fn($k) => $prefix . $k . 's', $collectionKeys);

        $placeholders = implode(',', array_fill(0, count($tableNames), '%s'));
        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT TABLE_NAME, TABLE_ROWS
                 FROM information_schema.TABLES
                 WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME IN ($placeholders)",
                ...$tableNames
            ),
            ARRAY_A
        );

        // Build lookup keyed by table name.
        $byTable = [];
        foreach ((array) $rows as $row) {
            $byTable[$row['TABLE_NAME']] = (int) $row['TABLE_ROWS'];
        }

        $counts = [];
        foreach ($collectionKeys as $key) {
            $table          = $prefix . $key . 's';
            $counts[$key]   = isset($byTable[$table]) ? $byTable[$table] : null;
        }

        return $counts;
    }

    public function checkPermissions(): bool
    {
        return current_user_can('manage_options');
    }
}
