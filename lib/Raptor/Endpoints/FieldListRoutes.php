<?php

namespace Gateway\Raptor\Endpoints;

use Gateway\Raptor\Build\RaptorBuilder;
use Gateway\Raptor\Collections\RaptorCollection;
use Gateway\Raptor\Collections\RaptorFieldList;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST API routes for Raptor field lists.
 *
 * All endpoints are scoped to /gateway/v1/raptor/field_list and require
 * the manage_options capability.
 *
 * Endpoints:
 *   GET    /gateway/v1/raptor/field_list              — list all
 *   POST   /gateway/v1/raptor/field_list              — create
 *   GET    /gateway/v1/raptor/field_list/{key}        — get one
 *   PATCH  /gateway/v1/raptor/field_list/{key}        — update
 *   DELETE /gateway/v1/raptor/field_list/{key}        — delete
 */
class FieldListRoutes
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    // ─── Route registration ───────────────────────────────────────────────

    public function registerRoutes(): void
    {
        register_rest_route('gateway/v1', '/raptor/field_list', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getFieldLists'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'createFieldList'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);

        register_rest_route('gateway/v1', '/raptor/field_list/(?P<collection_key>[a-zA-Z0-9_\-]+)', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getFieldList'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'PATCH, PUT',
                'callback'            => [$this, 'updateFieldList'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'DELETE',
                'callback'            => [$this, 'deleteFieldList'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);
    }

    // ─── Handlers ─────────────────────────────────────────────────────────

    public function getFieldLists(\WP_REST_Request $request): \WP_REST_Response
    {
        $lists = RaptorFieldList::orderBy('created_at', 'asc')->get();

        return new \WP_REST_Response([
            'success'     => true,
            'field_lists' => $lists->toArray(),
        ], 200);
    }

    public function createFieldList(\WP_REST_Request $request): \WP_REST_Response
    {
        $data = $request->get_json_params() ?? [];
        $key  = isset($data['collection_key']) ? $this->sanitizeKey($data['collection_key']) : '';

        if (!$key) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'collection_key is required.',
            ], 400);
        }

        $collection = RaptorCollection::where('collection_key', $key)->first();
        if (!$collection) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Collection not found.',
            ], 404);
        }

        $list = RaptorFieldList::create([
            'collection_id' => $collection->id,
        ]);

        RaptorBuilder::rebuildForCollection($collection);

        return new \WP_REST_Response([
            'success'    => true,
            'message'    => 'Field list created.',
            'field_list' => $list->toArray(),
        ], 201);
    }

    public function getFieldList(\WP_REST_Request $request): \WP_REST_Response
    {
        $list = $this->findOrFail($request->get_param('collection_key'));
        if ($list instanceof \WP_REST_Response) {
            return $list;
        }

        return new \WP_REST_Response([
            'success'    => true,
            'field_list' => $list->toArray(),
        ], 200);
    }

    public function updateFieldList(\WP_REST_Request $request): \WP_REST_Response
    {
        $list = $this->findOrFail($request->get_param('collection_key'));
        if ($list instanceof \WP_REST_Response) {
            return $list;
        }

        // No updatable fields currently.
        return new \WP_REST_Response([
            'success'    => true,
            'field_list' => $list->fresh()->toArray(),
        ], 200);
    }

    public function deleteFieldList(\WP_REST_Request $request): \WP_REST_Response
    {
        $list = $this->findOrFail($request->get_param('collection_key'));
        if ($list instanceof \WP_REST_Response) {
            return $list;
        }

        $collection = RaptorCollection::find($list->collection_id);
        $list->delete();

        if ($collection) {
            RaptorBuilder::rebuildForCollection($collection);
        }

        return new \WP_REST_Response([
            'success' => true,
            'message' => 'Field list deleted.',
        ], 200);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────

    /**
     * Returns the RaptorFieldList for the given collection key, or a 404 response.
     *
     * @return RaptorFieldList|\WP_REST_Response
     */
    private function findOrFail(string $collectionKey)
    {
        $collection = RaptorCollection::where('collection_key', $collectionKey)->first();

        if (!$collection) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Collection not found.',
            ], 404);
        }

        $list = RaptorFieldList::where('collection_id', $collection->id)->first();

        if (!$list) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Field list not found.',
            ], 404);
        }

        return $list;
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
