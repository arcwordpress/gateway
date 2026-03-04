<?php

namespace Gateway\Raptor\Endpoints;

use Gateway\Raptor\Collections\RaptorCollection;
use Gateway\Raptor\Collections\RaptorExtension;
use Gateway\Raptor\Controllers\CollectionController;

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
        $query = RaptorCollection::orderBy('created_at', 'asc');

        $extensionKey = $request->get_param('extension_key');
        if ($extensionKey) {
            $extension = RaptorExtension::where('extension_key', sanitize_text_field($extensionKey))->first();
            if ($extension) {
                $query->where('extension_id', $extension->id);
            }
        }

        $collections = $query->get();

        return new \WP_REST_Response([
            'success'     => true,
            'collections' => $collections->toArray(),
        ], 200);
    }

    public function createCollection(\WP_REST_Request $request): \WP_REST_Response
    {
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
        if (!empty($data['extension_key'])) {
            $ext = RaptorExtension::where('extension_key', sanitize_text_field($data['extension_key']))->first();
            $extensionId = $ext ? $ext->id : null;
        }

        $collection = CollectionController::create([
            'collection_key' => $key,
            'extension_id'   => $extensionId,
            'title'          => $title,
            'description'    => sanitize_textarea_field($data['description'] ?? ''),
            'status'         => 'active',
        ]);

        return new \WP_REST_Response([
            'success'    => true,
            'message'    => 'Collection created.',
            'collection' => $collection->toArray(),
        ], 201);
    }

    public function getCollection(\WP_REST_Request $request): \WP_REST_Response
    {
        $collection = $this->findOrFail($request->get_param('collection_key'));
        if ($collection instanceof \WP_REST_Response) {
            return $collection;
        }

        return new \WP_REST_Response([
            'success'    => true,
            'collection' => CollectionController::withNested($collection)->toArray(),
        ], 200);
    }

    public function updateCollection(\WP_REST_Request $request): \WP_REST_Response
    {
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
        if (array_key_exists('relationships', $data)) {
            $update['relationships'] = is_array($data['relationships']) ? $data['relationships'] : null;
        }

        $collection->update($update);

        return new \WP_REST_Response([
            'success'    => true,
            'collection' => $collection->fresh()->toArray(),
        ], 200);
    }

    public function deleteCollection(\WP_REST_Request $request): \WP_REST_Response
    {
        $collection = $this->findOrFail($request->get_param('collection_key'));
        if ($collection instanceof \WP_REST_Response) {
            return $collection;
        }

        $collection->delete();

        return new \WP_REST_Response([
            'success' => true,
            'message' => 'Collection deleted.',
        ], 200);
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

    public function checkPermissions(): bool
    {
        return current_user_can('manage_options');
    }
}
