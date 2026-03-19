<?php

namespace Gateway\Raptor\Endpoints;

use Gateway\Raptor\Collections\RaptorCollection;
use Gateway\Raptor\Collections\RaptorFormList;

if (!defined('ABSPATH')) {
    exit;
}

class FormListRoutes
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    public function registerRoutes(): void
    {
        register_rest_route('gateway/v1', '/raptor/form_list', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getFormLists'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'createFormList'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);

        register_rest_route('gateway/v1', '/raptor/form_list/(?P<collection_key>[a-zA-Z0-9_\-]+)', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getFormList'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'PATCH, PUT',
                'callback'            => [$this, 'updateFormList'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'DELETE',
                'callback'            => [$this, 'deleteFormList'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);
    }

    public function checkPermissions(): bool
    {
        return current_user_can('manage_options');
    }

    public function getFormLists(\WP_REST_Request $request): \WP_REST_Response
    {
        $lists = RaptorFormList::orderBy('created_at', 'asc')->get();

        return new \WP_REST_Response([
            'success'    => true,
            'form_lists' => $lists->toArray(),
        ], 200);
    }

    public function createFormList(\WP_REST_Request $request): \WP_REST_Response
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

        $list = RaptorFormList::create([
            'collection_id' => $collection->id,
        ]);

        return new \WP_REST_Response([
            'success'   => true,
            'message'   => 'Form list created.',
            'form_list' => $list->toArray(),
        ], 201);
    }

    public function getFormList(\WP_REST_Request $request): \WP_REST_Response
    {
        $list = $this->findOrFail($request->get_param('collection_key'));
        if ($list instanceof \WP_REST_Response) {
            return $list;
        }

        return new \WP_REST_Response([
            'success'   => true,
            'form_list' => $list->toArray(),
        ], 200);
    }

    public function updateFormList(\WP_REST_Request $request): \WP_REST_Response
    {
        $list = $this->findOrFail($request->get_param('collection_key'));
        if ($list instanceof \WP_REST_Response) {
            return $list;
        }

        $data = $request->get_json_params() ?? [];

        // For FormList, there are currently no editable fields
        // This endpoint is here for consistency with other list routes

        return new \WP_REST_Response([
            'success'   => true,
            'message'   => 'Form list updated.',
            'form_list' => $list->toArray(),
        ], 200);
    }

    public function deleteFormList(\WP_REST_Request $request): \WP_REST_Response
    {
        $list = $this->findOrFail($request->get_param('collection_key'));
        if ($list instanceof \WP_REST_Response) {
            return $list;
        }

        $list->delete();

        return new \WP_REST_Response([
            'success' => true,
            'message' => 'Form list deleted.',
        ], 200);
    }

    // ─── Helpers ───────────────────────────────────────────────────────────

    private function findOrFail(string $collectionKey): RaptorFormList | \WP_REST_Response
    {
        $collection = RaptorCollection::where('collection_key', sanitize_text_field($collectionKey))->first();

        if (!$collection) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Collection not found.',
            ], 404);
        }

        $list = RaptorFormList::where('collection_id', $collection->id)->first();

        if (!$list) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Form list not found.',
            ], 404);
        }

        return $list;
    }

    private function sanitizeKey(string $key): string
    {
        return strtolower(preg_replace('/[^a-z0-9_\-]/i', '', $key) ?? '');
    }
}
