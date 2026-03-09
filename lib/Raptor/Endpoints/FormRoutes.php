<?php

namespace Gateway\Raptor\Endpoints;

use Gateway\Raptor\Collections\RaptorForm;
use Gateway\Raptor\Collections\RaptorFormList;
use Gateway\Raptor\Collections\RaptorCollection;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST API routes for Raptor forms.
 *
 * All endpoints are scoped to /gateway/v1/raptor/form and require
 * the manage_options capability.
 *
 * Endpoints:
 *   GET    /gateway/v1/raptor/form                    — list all (filter: ?form_list_id=X)
 *   POST   /gateway/v1/raptor/form                    — create
 *   GET    /gateway/v1/raptor/form/{form_key}         — get one
 *   PATCH  /gateway/v1/raptor/form/{form_key}         — update
 *   DELETE /gateway/v1/raptor/form/{form_key}         — delete
 */
class FormRoutes
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    public function registerRoutes(): void
    {
        register_rest_route('gateway/v1', '/raptor/form', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getForms'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'createForm'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);

        register_rest_route('gateway/v1', '/raptor/form/(?P<form_key>[a-zA-Z0-9_\-]+)', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getForm'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'PATCH, PUT',
                'callback'            => [$this, 'updateForm'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'DELETE',
                'callback'            => [$this, 'deleteForm'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);
    }

    public function checkPermissions(): bool
    {
        return current_user_can('manage_options');
    }

    public function getForms(\WP_REST_Request $request): \WP_REST_Response
    {
        $query = RaptorForm::orderBy('sort_order', 'asc')->orderBy('id', 'asc');

        $formListId = $request->get_param('form_list_id');
        if ($formListId !== null) {
            $query->where('form_list_id', (int) $formListId);
        }

        $collectionKey = $request->get_param('collection_key');
        if ($collectionKey) {
            $collection = RaptorCollection::where('collection_key', sanitize_text_field($collectionKey))->first();
            if ($collection) {
                $formList = RaptorFormList::where('collection_id', $collection->id)->first();
                if ($formList) {
                    $query->where('form_list_id', $formList->id);
                }
            }
        }

        $forms = $query->get();

        return new \WP_REST_Response([
            'success' => true,
            'forms'   => $forms->toArray(),
        ], 200);
    }

    public function createForm(\WP_REST_Request $request): \WP_REST_Response
    {
        $data  = $request->get_json_params() ?? [];
        $title = sanitize_text_field($data['title'] ?? '');

        if (!$title) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Title is required.',
            ], 400);
        }

        $key = isset($data['form_key']) && $data['form_key']
            ? $this->sanitizeKey($data['form_key'])
            : $this->titleToKey($title);

        if (!$key) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Could not generate a valid form key from the given title.',
            ], 400);
        }

        $key = $this->ensureUniqueKey($key);

        $formListId = null;

        if (!empty($data['form_list_id'])) {
            $formListId = (int) $data['form_list_id'];
        } elseif (!empty($data['collection_id'])) {
            $collectionId = (int) $data['collection_id'];
            $formList = RaptorFormList::where('collection_id', $collectionId)->first();
            $formListId = $formList ? $formList->id : null;
        } elseif (!empty($data['collection_key'])) {
            $coll = RaptorCollection::where('collection_key', sanitize_text_field($data['collection_key']))->first();
            if ($coll) {
                $formList = RaptorFormList::where('collection_id', $coll->id)->first();
                $formListId = $formList ? $formList->id : null;
            }
        }

        $form = RaptorForm::create([
            'form_key'            => $key,
            'form_list_id'        => $formListId,
            'title'               => $title,
            'description'         => sanitize_textarea_field($data['description'] ?? ''),
            'status'              => sanitize_text_field($data['status'] ?? 'active'),
            'sort_order'          => isset($data['sort_order']) ? (int) $data['sort_order'] : 0,
            'form_config'         => isset($data['form_config']) && is_array($data['form_config']) ? $data['form_config'] : [],
            'success_message'     => sanitize_textarea_field($data['success_message'] ?? ''),
            'notification_email'  => sanitize_email($data['notification_email'] ?? ''),
        ]);

        return new \WP_REST_Response([
            'success' => true,
            'message' => 'Form created.',
            'form'    => $form->toArray(),
        ], 201);
    }

    public function getForm(\WP_REST_Request $request): \WP_REST_Response
    {
        $key = $request->get_param('form_key');
        $form = RaptorForm::where('form_key', $key)->first();

        if (!$form) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Form not found.',
            ], 404);
        }

        return new \WP_REST_Response([
            'success' => true,
            'form'    => $form->toArray(),
        ], 200);
    }

    public function updateForm(\WP_REST_Request $request): \WP_REST_Response
    {
        $key = $request->get_param('form_key');
        $form = RaptorForm::where('form_key', $key)->first();

        if (!$form) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Form not found.',
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

        if (isset($data['form_config'])) {
            $updates['form_config'] = is_array($data['form_config']) ? $data['form_config'] : [];
        }

        if (isset($data['success_message'])) {
            $updates['success_message'] = sanitize_textarea_field($data['success_message']);
        }

        if (isset($data['notification_email'])) {
            $updates['notification_email'] = sanitize_email($data['notification_email']);
        }

        $form->update($updates);
        $form = $form->fresh();

        return new \WP_REST_Response([
            'success' => true,
            'message' => 'Form updated.',
            'form'    => $form->toArray(),
        ], 200);
    }

    public function deleteForm(\WP_REST_Request $request): \WP_REST_Response
    {
        $key = $request->get_param('form_key');
        $form = RaptorForm::where('form_key', $key)->first();

        if (!$form) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Form not found.',
            ], 404);
        }

        $form->delete();

        return new \WP_REST_Response([
            'success' => true,
            'message' => 'Form deleted.',
        ], 200);
    }

    // ─── Helpers ───────────────────────────────────────────────────────────

    private function sanitizeKey(string $key): string
    {
        return strtolower(preg_replace('/[^a-z0-9_\-]/i', '', $key) ?? '');
    }

    private function titleToKey(string $title): string
    {
        $key = strtolower(preg_replace('/[^a-z0-9_\-]/i', '_', $title) ?? '');
        $key = preg_replace('/_+/', '_', $key) ?? '';
        return trim($key, '_');
    }

    private function ensureUniqueKey(string $key): string
    {
        $original = $key;
        $counter = 1;

        while (RaptorForm::where('form_key', $key)->exists()) {
            $key = "{$original}_{$counter}";
            $counter++;
        }

        return $key;
    }
}
