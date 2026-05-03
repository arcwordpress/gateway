<?php

namespace Gateway\Raptor\Endpoints;

use Gateway\Raptor\Build\RaptorBuilder;
use Gateway\Raptor\Collections\RaptorField;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST API routes for Raptor fields.
 *
 * All endpoints are scoped to /gateway/v1/raptor/field and require
 * the manage_options capability.
 *
 * Endpoints:
 *   GET    /gateway/v1/raptor/field               — list all (filter: ?field_list_id=X)
 *   POST   /gateway/v1/raptor/field               — create
 *   GET    /gateway/v1/raptor/field/{id}          — get one
 *   PATCH  /gateway/v1/raptor/field/{id}          — update
 *   DELETE /gateway/v1/raptor/field/{id}          — delete
 */
class FieldRoutes
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    // ─── Route registration ───────────────────────────────────────────────

    public function registerRoutes(): void
    {
        register_rest_route('gateway/v1', '/raptor/field', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getFields'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'createField'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);

        register_rest_route('gateway/v1', '/raptor/field/(?P<id>\d+)', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getField'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'PATCH, PUT',
                'callback'            => [$this, 'updateField'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'DELETE',
                'callback'            => [$this, 'deleteField'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);
    }

    // ─── Handlers ─────────────────────────────────────────────────────────

    public function getFields(\WP_REST_Request $request): \WP_REST_Response
    {
        $query = RaptorField::orderBy('sort_order', 'asc')->orderBy('id', 'asc');

        $field_list_id = $request->get_param('field_list_id');
        if ($field_list_id !== null) {
            $query->where('field_list_id', (int) $field_list_id);
        }

        return new \WP_REST_Response([
            'success' => true,
            'fields'  => $query->get()->toArray(),
        ], 200);
    }

    public function createField(\WP_REST_Request $request): \WP_REST_Response
    {
        $data = $request->get_json_params() ?? [];

        $field_list_id = isset($data['field_list_id']) ? (int) $data['field_list_id'] : 0;
        if (!$field_list_id) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'field_list_id is required.',
            ], 400);
        }

        $name = sanitize_key($data['name'] ?? '');
        if (!$name) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'name is required.',
            ], 400);
        }

        if (RaptorField::where('field_list_id', $field_list_id)->where('name', $name)->exists()) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => "A field named '{$name}' already exists in this collection.",
            ], 409);
        }

        $config = isset($data['config']) && is_array($data['config']) ? $data['config'] : null;

        $field = RaptorField::create([
            'field_list_id' => $field_list_id,
            'name'          => $name,
            'type'          => sanitize_text_field($data['type'] ?? 'text'),
            'label'         => sanitize_text_field($data['label'] ?? ''),
            'sort_order'    => isset($data['sort_order']) ? (int) $data['sort_order'] : 0,
            'config'        => $config,
        ]);

        $this->triggerBuildFromField($field);

        return new \WP_REST_Response([
            'success' => true,
            'message' => 'Field created.',
            'field'   => $field->toArray(),
        ], 201);
    }

    public function getField(\WP_REST_Request $request): \WP_REST_Response
    {
        $field = $this->findOrFail((int) $request->get_param('id'));
        if ($field instanceof \WP_REST_Response) {
            return $field;
        }

        return new \WP_REST_Response([
            'success' => true,
            'field'   => $field->toArray(),
        ], 200);
    }

    public function updateField(\WP_REST_Request $request): \WP_REST_Response
    {
        $field = $this->findOrFail((int) $request->get_param('id'));
        if ($field instanceof \WP_REST_Response) {
            return $field;
        }

        $data   = $request->get_json_params() ?? [];
        $update = [];

        if (isset($data['name'])) {
            $newName = sanitize_key($data['name']);

            if (!$newName) {
                return new \WP_REST_Response([
                    'success' => false,
                    'message' => 'name cannot be empty.',
                ], 400);
            }

            $duplicate = RaptorField::where('field_list_id', $field->field_list_id)
                ->where('name', $newName)
                ->where('id', '!=', $field->id)
                ->exists();

            if ($duplicate) {
                return new \WP_REST_Response([
                    'success' => false,
                    'message' => "A field named '{$newName}' already exists in this collection.",
                ], 409);
            }

            $update['name'] = $newName;
        }
        if (isset($data['type'])) {
            $update['type'] = sanitize_text_field($data['type']);
        }
        if (isset($data['label'])) {
            $update['label'] = sanitize_text_field($data['label']);
        }
        if (isset($data['sort_order'])) {
            $update['sort_order'] = (int) $data['sort_order'];
        }
        if (array_key_exists('config', $data)) {
            $update['config'] = is_array($data['config']) ? $data['config'] : null;
        }

        if ($update) {
            $field->update($update);
        }

        $this->triggerBuildFromField($field);

        return new \WP_REST_Response([
            'success' => true,
            'field'   => $field->fresh()->toArray(),
        ], 200);
    }

    public function deleteField(\WP_REST_Request $request): \WP_REST_Response
    {
        $field = $this->findOrFail((int) $request->get_param('id'));
        if ($field instanceof \WP_REST_Response) {
            return $field;
        }

        $this->triggerBuildFromField($field);
        $field->delete();

        return new \WP_REST_Response([
            'success' => true,
            'message' => 'Field deleted.',
        ], 200);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────

    /**
     * Returns the RaptorField model or a 404 response.
     *
     * @return RaptorField|\WP_REST_Response
     */
    private function findOrFail(int $id)
    {
        $field = RaptorField::find($id);

        if (!$field) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Field not found.',
            ], 404);
        }

        return $field;
    }

    /**
     * Rebuild the extension that owns this field's collection, if any.
     * Chain: field → field_list → collection → extension.
     * Wrapped in try/catch so a builder failure never corrupts the REST response.
     */
    private function triggerBuildFromField(RaptorField $field): void
    {
        $field->load('fieldList.collection.extension');

        $extension = null;
        if ($field->fieldList && $field->fieldList->collection) {
            $extension = $field->fieldList->collection->extension;
        }

        if (!$extension) {
            return;
        }

        try {
            (new RaptorBuilder())->build($extension->extension_key);
        } catch (\Throwable $e) {
            error_log('[Gateway] FieldRoutes: build failed after field save — ' . $e->getMessage());
        }
    }

    public function checkPermissions(): bool
    {
        return current_user_can('manage_options');
    }
}
