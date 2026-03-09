<?php

namespace Gateway\Raptor\Endpoints;

use Gateway\Raptor\Collections\RaptorView;
use Gateway\Raptor\Collections\RaptorCollection;
use Gateway\Raptor\Collections\RaptorViewList;
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

        register_rest_route('gateway/v1', '/raptor/view/(?P<view_key>[a-zA-Z0-9_\-]+)/preview', [
            'methods'             => 'GET',
            'callback'            => [$this, 'getViewPreview'],
            'permission_callback' => [$this, 'checkPermissions'],
        ]);
    }

    public function checkPermissions(): bool
    {
        return current_user_can('manage_options');
    }

    public function getViews(\WP_REST_Request $request): \WP_REST_Response
    {
        $query = RaptorView::orderBy('sort_order', 'asc')->orderBy('id', 'asc');

        $collectionKey = $request->get_param('collection_key');
        if ($collectionKey) {
            $collection = RaptorCollection::where('collection_key', sanitize_text_field($collectionKey))->first();
            if ($collection) {
                $viewList = RaptorViewList::where('collection_id', $collection->id)->first();
                if ($viewList) {
                    $query->where('view_list_id', $viewList->id);
                }
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

        $key = $this->ensureUniqueKey($key);

        $collectionId = null;
        $viewListId = null;

        if (!empty($data['collection_id'])) {
            $collectionId = (int) $data['collection_id'];
        } elseif (!empty($data['collection_key'])) {
            $coll = RaptorCollection::where('collection_key', sanitize_text_field($data['collection_key']))->first();
            $collectionId = $coll ? $coll->id : null;
        }

        if ($collectionId) {
            $viewList = RaptorViewList::where('collection_id', $collectionId)->first();
            $viewListId = $viewList ? $viewList->id : null;
        }

        $view = ViewController::create([
            'view_key'      => $key,
            'view_list_id'  => $viewListId,
            'title'         => $title,
            'description'   => sanitize_textarea_field($data['description'] ?? ''),
            'status'        => 'active',
            'sort_order'    => isset($data['sort_order']) ? (int) $data['sort_order'] : 0,
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

        if (isset($data['sort_order'])) {
            $updates['sort_order'] = (int) $data['sort_order'];
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
            $collectionId = $data['collection_id'] ? (int) $data['collection_id'] : null;
            if ($collectionId) {
                $viewList = RaptorViewList::where('collection_id', $collectionId)->first();
                $updates['view_list_id'] = $viewList ? $viewList->id : null;
            } else {
                $updates['view_list_id'] = null;
            }
        } elseif (isset($data['collection_key'])) {
            $collKey = sanitize_text_field($data['collection_key']);
            if ($collKey) {
                $coll = RaptorCollection::where('collection_key', $collKey)->first();
                if ($coll) {
                    $viewList = RaptorViewList::where('collection_id', $coll->id)->first();
                    $updates['view_list_id'] = $viewList ? $viewList->id : null;
                } else {
                    $updates['view_list_id'] = null;
                }
            } else {
                $updates['view_list_id'] = null;
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

    public function getViewPreview(\WP_REST_Request $request): \WP_REST_Response
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

        // Get sample records for preview if available
        $records = [];
        $collection = $view->viewList?->collection ?? null;
        
        if ($collection) {
            $adminData = get_option('gateway_admin_data', []);
            
            if (isset($adminData['collections'])) {
                foreach ($adminData['collections'] as $collData) {
                    if ($collData['key'] === $collection->collection_key) {
                        $getManyRoute = null;
                        foreach ($collData['routes'] as $route) {
                            if ($route['type'] === 'get_many') {
                                $getManyRoute = $route['route'];
                                break;
                            }
                        }
                        
                        if ($getManyRoute) {
                            $apiUrl = rest_url($getManyRoute . '?per_page=5');
                            $response = wp_remote_get($apiUrl, [
                                'headers' => [
                                    'X-WP-Nonce' => wp_create_nonce('wp_rest'),
                                ],
                            ]);
                            
                            if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
                                $body = wp_remote_retrieve_body($response);
                                $data = json_decode($body, true);
                                
                                if (isset($data['data']['items'])) {
                                    $records = $data['data']['items'];
                                }
                            }
                        }
                        break;
                    }
                }
            }
        }

        $html = \Gateway\Raptor\ViewRenderer::renderViewPreview($view, $records);

        return new \WP_REST_Response([
            'success' => true,
            'html'    => $html,
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

    private function ensureUniqueKey(string $baseKey): string
    {
        if (!RaptorView::where('view_key', $baseKey)->exists()) {
            return $baseKey;
        }

        $suffix = 1;
        do {
            $candidate = $baseKey . '_' . $suffix;
            $suffix++;
        } while (RaptorView::where('view_key', $candidate)->exists());

        return $candidate;
    }
}
