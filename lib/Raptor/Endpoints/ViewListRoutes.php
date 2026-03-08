<?php

namespace Gateway\Raptor\Endpoints;

use Gateway\Raptor\Collections\RaptorCollection;
use Gateway\Raptor\Collections\RaptorViewList;

if (!defined('ABSPATH')) {
    exit;
}

class ViewListRoutes
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    public function registerRoutes(): void
    {
        register_rest_route('gateway/v1', '/raptor/view_list', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getViewLists'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'createViewList'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);

        register_rest_route('gateway/v1', '/raptor/view_list/(?P<collection_key>[a-zA-Z0-9_\-]+)', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getViewList'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'PATCH, PUT',
                'callback'            => [$this, 'updateViewList'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'DELETE',
                'callback'            => [$this, 'deleteViewList'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);
    }

    public function getViewLists(\WP_REST_Request $request): \WP_REST_Response
    {
        $lists = RaptorViewList::orderBy('created_at', 'asc')->get();

        return new \WP_REST_Response([
            'success'    => true,
            'view_lists' => $lists->toArray(),
        ], 200);
    }

    public function createViewList(\WP_REST_Request $request): \WP_REST_Response
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

        $list = RaptorViewList::create([
            'collection_id' => $collection->id,
        ]);

        return new \WP_REST_Response([
            'success'   => true,
            'message'   => 'View list created.',
            'view_list' => $list->toArray(),
        ], 201);
    }

    public function getViewList(\WP_REST_Request $request): \WP_REST_Response
    {
        $list = $this->findOrFail($request->get_param('collection_key'));
        if ($list instanceof \WP_REST_Response) {
            return $list;
        }

        return new \WP_REST_Response([
            'success'   => true,
            'view_list' => $list->toArray(),
        ], 200);
    }

    public function updateViewList(\WP_REST_Request $request): \WP_REST_Response
    {
        $list = $this->findOrFail($request->get_param('collection_key'));
        if ($list instanceof \WP_REST_Response) {
            return $list;
        }

        return new \WP_REST_Response([
            'success'   => true,
            'view_list' => $list->fresh()->toArray(),
        ], 200);
    }

    public function deleteViewList(\WP_REST_Request $request): \WP_REST_Response
    {
        $list = $this->findOrFail($request->get_param('collection_key'));
        if ($list instanceof \WP_REST_Response) {
            return $list;
        }

        $list->delete();

        return new \WP_REST_Response([
            'success' => true,
            'message' => 'View list deleted.',
        ], 200);
    }

    private function findOrFail(string $collectionKey)
    {
        $collection = RaptorCollection::where('collection_key', $collectionKey)->first();

        if (!$collection) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Collection not found.',
            ], 404);
        }

        $list = RaptorViewList::where('collection_id', $collection->id)->first();

        if (!$list) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'View list not found.',
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
