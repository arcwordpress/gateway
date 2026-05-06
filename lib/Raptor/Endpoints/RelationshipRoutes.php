<?php

namespace Gateway\Raptor\Endpoints;

use Gateway\Raptor\Collections\RaptorCollection;
use Gateway\Raptor\Controllers\RelationshipController;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST API routes for collection-to-collection relationships.
 *
 * All endpoints are scoped under /gateway/v1/raptor/collection/{key}/relationships
 * and require manage_options capability.
 *
 * Endpoints:
 *   GET    /raptor/collection/{key}/relationships        — list outgoing relationships
 *   POST   /raptor/collection/{key}/relationships        — create a new relationship
 *   DELETE /raptor/collection/{key}/relationships/{id}   — delete a relationship
 */
class RelationshipRoutes
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    public function registerRoutes(): void
    {
        $base = '/raptor/collection/(?P<collection_key>[a-zA-Z0-9_\-]+)/relationships';

        register_rest_route('gateway/v1', $base, [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'listRelationships'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'createRelationship'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);

        register_rest_route('gateway/v1', $base . '/(?P<id>\d+)', [
            [
                'methods'             => 'DELETE',
                'callback'            => [$this, 'deleteRelationship'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);
    }

    // ─── Handlers ─────────────────────────────────────────────────────────────

    public function listRelationships(\WP_REST_Request $request): \WP_REST_Response
    {
        try {
            $collection = $this->findOrFail($request->get_param('collection_key'));
            if ($collection instanceof \WP_REST_Response) return $collection;

            $rels = RelationshipController::forCollection($collection);

            return new \WP_REST_Response([
                'success'       => true,
                'relationships' => $rels->map(fn ($r) => $r->toApiArray())->values()->all(),
            ], 200);
        } catch (\Throwable $e) {
            return $this->serverError($e);
        }
    }

    public function createRelationship(\WP_REST_Request $request): \WP_REST_Response
    {
        try {
            $collection = $this->findOrFail($request->get_param('collection_key'));
            if ($collection instanceof \WP_REST_Response) return $collection;

            $data       = $request->get_json_params() ?? [];
            $targetKey  = sanitize_text_field($data['target_key']  ?? '');
            $type       = sanitize_text_field($data['type']         ?? 'belongsTo');
            $methodName = sanitize_text_field($data['method_name']  ?? '');
            $foreignKey = sanitize_text_field($data['foreign_key']  ?? '');
            $ownerKey   = sanitize_text_field($data['owner_key']    ?? 'id');

            if (!$targetKey) {
                return new \WP_REST_Response(['success' => false, 'message' => 'target_key is required.'], 400);
            }

            $rel = RelationshipController::create($collection, $targetKey, $type, $methodName, $foreignKey, $ownerKey);

            return new \WP_REST_Response([
                'success'      => true,
                'message'      => 'Relationship created.',
                'relationship' => $rel->toApiArray(),
            ], 201);
        } catch (\InvalidArgumentException $e) {
            return new \WP_REST_Response(['success' => false, 'message' => $e->getMessage()], 400);
        } catch (\Throwable $e) {
            return $this->serverError($e);
        }
    }

    public function deleteRelationship(\WP_REST_Request $request): \WP_REST_Response
    {
        try {
            $collection = $this->findOrFail($request->get_param('collection_key'));
            if ($collection instanceof \WP_REST_Response) return $collection;

            $id = (int) $request->get_param('id');

            RelationshipController::delete($id, $collection);

            return new \WP_REST_Response(['success' => true, 'message' => 'Relationship deleted.'], 200);
        } catch (\InvalidArgumentException $e) {
            return new \WP_REST_Response(['success' => false, 'message' => $e->getMessage()], 404);
        } catch (\Throwable $e) {
            return $this->serverError($e);
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /** @return RaptorCollection|\WP_REST_Response */
    private function findOrFail(string $key)
    {
        $collection = RaptorCollection::where('collection_key', $key)->first();
        if (!$collection) {
            return new \WP_REST_Response(['success' => false, 'message' => 'Collection not found.'], 404);
        }
        return $collection;
    }

    private function serverError(\Throwable $e): \WP_REST_Response
    {
        return new \WP_REST_Response([
            'code'    => 'gateway_error',
            'message' => $e->getMessage(),
        ], 503);
    }

    public function checkPermissions(): bool
    {
        return current_user_can('manage_options');
    }
}
