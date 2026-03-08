<?php

namespace Gateway\Raptor\Endpoints;

use Gateway\Raptor\Collections\RaptorView;
use Gateway\Raptor\Collections\RaptorCollection;
use Gateway\Raptor\Controllers\ViewController;

if (!defined('ABSPATH')) {
    exit;
}

class ViewRoutes
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    public function registerRoutes(): void
    {
        register_rest_route('gateway/v1', '/raptor/view', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getViews'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'createView'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);

        register_rest_route('gateway/v1', '/raptor/view/(?P<view_key>[a-zA-Z0-9_\-]+)', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getView'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'PATCH, PUT',
                'callback'            => [$this, 'updateView'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'DELETE',
                'callback'            => [$this, 'deleteView'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);
    }

    public function checkPermissions(): bool
    {
        return current_user_can('manage_options');
    }

    public function getViews(\WP_REST_Request $request): \WP_REST_Response
    {
        $query = RaptorView::orderBy('created_at', 'asc');

        $collectionKey = $request->get_param('collection_key');
        if ($collectionKey) {
            $collection = RaptorCollection::where('collection_key', sanitize_text_field($collectionKey))->first();
            if ($collection) {
                $query->where('collection_id', $collection->id);
            }
        }

        $views = $query->get();

        return new \WP_REST_Response([
            'success' => true,
            'views'   => $views->toArray(),
        ], 200);
    }

    public function createView(\WP_REST_Request $request): \WP_REST_Response
    {
        $data  = $request->get_json_params() ?? [];
        $title = sanitize_text_field($data['title'] ?? '');

        if (!$title) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Title is required.',
            ], 400);
        }

        $key = isset($data['view_key']) && $data['view_key']
            ? $this->sanitizeKey($data['view_key'])
            : $this->titleToKey($title);

        if (!$key) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Could not generate a valid view key from the given title.',
            ], 400);
        }

        if (RaptorView::where('view_key', $key)->exists()) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => "A view with key \"{$key}\" already exists.",
            ], 409);
        }

        $collectionId = null;

        if (!empty($data['collection_id'])) {
            $collectionId = (int) $data['collection_id'];
        } elseif (!empty($data['collection_key'])) {
            $coll = RaptorCollection::where('collection_key', sanitize_text_field($data['collection_key']))->first();
            $collectionId = $coll ? $coll->id : null;
        }

        $view = ViewController::create([
            'view_key'      => $key,
            'collection_id' => $collectionId,
            'title'         => $title,
            'description'   => sanitize_textarea_field($data['description'] ?? ''),
            'status'        => 'active',
            'source'        => sanitize_text_field($data['source'] ?? ''),
            'columns'       => $data['columns'] ?? [],
            'facet_filters' => $data['facet_filters'] ?? [],
            'default_sort'  => $data['default_sort'] ?? [],
            'per_page'      => isset($data['per_page']) ? (int) $data['per_page'] : 20,
        ]);

        return new \WP_REST_Response([
            'success' => true,
            'message' => 'View created.',
            'view'    => $view->toArray(),
        ], 201);
    }

    public function getView(\WP_REST_Request $request): \WP_REST_Response
    {
        $key = $request->get_param('view_key');
        $view = ViewController::get($key);

        if (!$view) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'View not found.',
            ], 404);
        }

        $view = ViewController::withNested($view);

        return new \WP_REST_Response([
            'success' => true,
            'view'    => $view->toArray(),
        ], 200);
    }

    public function updateView(\WP_REST_Request $request): \WP_REST_Response
    {
        $key = $request->get_param('view_key');
        $view = ViewController::get($key);

        if (!$view) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'View not found.',
            ], 404);
        }

        $data = $request->get_json_params() ?? [];
        $updates = [];

        if (isset($data['title'])) {
            $updates['title'] = sanitize_text_field($data['title']);
        }

        if (isset($data['description'])) {
            $updates['description'] = sanitize_textarea_field($data['description']);
        }

        if (isset($data['status'])) {
            $updates['status'] = sanitize_text_field($data['status']);
        }

        if (isset($data['source'])) {
            $updates['source'] = sanitize_text_field($data['source']);
        }

        if (isset($data['columns'])) {
            $updates['columns'] = $data['columns'];
        }

        if (isset($data['facet_filters'])) {
            $updates['facet_filters'] = $data['facet_filters'];
        }

        if (isset($data['default_sort'])) {
            $updates['default_sort'] = $data['default_sort'];
        }

        if (isset($data['per_page'])) {
            $updates['per_page'] = (int) $data['per_page'];
        }

        if (isset($data['collection_id'])) {
            $updates['collection_id'] = $data['collection_id'] ? (int) $data['collection_id'] : null;
        } elseif (isset($data['collection_key'])) {
            $collKey = sanitize_text_field($data['collection_key']);
            if ($collKey) {
                $coll = RaptorCollection::where('collection_key', $collKey)->first();
                $updates['collection_id'] = $coll ? $coll->id : null;
            } else {
                $updates['collection_id'] = null;
            }
        }

        $view = ViewController::update($view, $updates);

        return new \WP_REST_Response([
            'success' => true,
            'message' => 'View updated.',
            'view'    => $view->toArray(),
        ], 200);
    }

    public function deleteView(\WP_REST_Request $request): \WP_REST_Response
    {
        $key = $request->get_param('view_key');
        $view = ViewController::get($key);

        if (!$view) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'View not found.',
            ], 404);
        }

        ViewController::delete($view);

        return new \WP_REST_Response([
            'success' => true,
            'message' => 'View deleted.',
        ], 200);
    }

    private function sanitizeKey(string $key): string
    {
        $key = strtolower($key);
        $key = preg_replace('/[^a-z0-9_\-]/', '', $key);
        return $key;
    }

    private function titleToKey(string $title): string
    {
        $key = strtolower($title);
        $key = preg_replace('/[^a-z0-9]+/', '_', $key);
        $key = trim($key, '_');
        return $key;
    }
}
