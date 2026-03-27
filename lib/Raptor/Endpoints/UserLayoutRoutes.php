<?php

namespace Gateway\Raptor\Endpoints;

use Gateway\Raptor\Collections\RaptorUserLayout;
use Gateway\Raptor\Collections\RaptorUserLayoutNode;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST API routes for persisting per-user React Flow graph layouts.
 *
 * All three endpoints operate on the currently authenticated WordPress user —
 * the user_id is always derived server-side from get_current_user_id() and is
 * never read from the request payload.
 *
 * Route key format examples:
 *   collections
 *   collections-relationships
 *   collections-{collectionKey}-fields
 *   collections-{collectionKey}-views
 *   collections-{collectionKey}-forms
 *
 * Endpoints:
 *   GET    /gateway/v1/raptor/user-layout/{route_key}
 *          Returns the saved layout (node positions) or { layout: null } if none.
 *
 *   POST   /gateway/v1/raptor/user-layout/{route_key}
 *          Body: { "nodes": [{ "id": "form-foo", "x": 200, "y": 400 }, ...] }
 *          Upserts the layout header row, deletes all existing node rows, and
 *          bulk-inserts the new set. Returns the full layout.
 *
 *   DELETE /gateway/v1/raptor/user-layout/{route_key}
 *          Removes the saved layout (and its node rows) for the current user,
 *          effectively resetting to the default Dagre / computed layout.
 */
class UserLayoutRoutes
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    public function registerRoutes(): void
    {
        register_rest_route('gateway/v1', '/raptor/user-layout/(?P<route_key>[a-zA-Z0-9_\-]+)', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getLayout'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'saveLayout'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'DELETE',
                'callback'            => [$this, 'resetLayout'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);
    }

    public function checkPermissions(): bool
    {
        return current_user_can('manage_options');
    }

    // ─── GET ─────────────────────────────────────────────────────────────────

    public function getLayout(\WP_REST_Request $request): \WP_REST_Response
    {
        $userId   = get_current_user_id();
        $routeKey = sanitize_text_field($request->get_param('route_key'));

        $layout = RaptorUserLayout::where('user_id', $userId)
            ->where('route_key', $routeKey)
            ->with('nodes')
            ->first();

        if (!$layout) {
            return new \WP_REST_Response([
                'success' => true,
                'layout'  => null,
            ], 200);
        }

        return new \WP_REST_Response([
            'success' => true,
            'layout'  => $this->formatLayout($layout),
        ], 200);
    }

    // ─── POST ────────────────────────────────────────────────────────────────

    public function saveLayout(\WP_REST_Request $request): \WP_REST_Response
    {
        $userId   = get_current_user_id();
        $routeKey = sanitize_text_field($request->get_param('route_key'));
        $data     = $request->get_json_params() ?? [];

        if (!isset($data['nodes']) || !is_array($data['nodes'])) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'nodes array is required.',
            ], 400);
        }

        // Upsert the layout header row
        $layout = RaptorUserLayout::firstOrCreate(
            ['user_id' => $userId, 'route_key' => $routeKey],
        );

        // Replace all node positions: delete existing, bulk-insert new
        RaptorUserLayoutNode::where('layout_id', $layout->id)->delete();

        $now  = current_time('mysql');
        $rows = [];

        foreach ($data['nodes'] as $node) {
            if (!isset($node['id'])) {
                continue;
            }
            $rows[] = [
                'layout_id'  => $layout->id,
                'node_id'    => sanitize_text_field((string) $node['id']),
                'x'          => (float) ($node['x'] ?? 0),
                'y'          => (float) ($node['y'] ?? 0),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (!empty($rows)) {
            RaptorUserLayoutNode::insert($rows);
        }

        $layout->load('nodes');

        return new \WP_REST_Response([
            'success' => true,
            'layout'  => $this->formatLayout($layout),
        ], 200);
    }

    // ─── DELETE ──────────────────────────────────────────────────────────────

    public function resetLayout(\WP_REST_Request $request): \WP_REST_Response
    {
        $userId   = get_current_user_id();
        $routeKey = sanitize_text_field($request->get_param('route_key'));

        $layout = RaptorUserLayout::where('user_id', $userId)
            ->where('route_key', $routeKey)
            ->first();

        if (!$layout) {
            return new \WP_REST_Response([
                'success' => true,
                'message' => 'No saved layout found.',
            ], 200);
        }

        // Delete nodes first, then the layout row
        RaptorUserLayoutNode::where('layout_id', $layout->id)->delete();
        $layout->delete();

        return new \WP_REST_Response([
            'success' => true,
            'message' => 'Layout reset to default.',
        ], 200);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function formatLayout(RaptorUserLayout $layout): array
    {
        return [
            'route_key' => $layout->route_key,
            'nodes'     => $layout->nodes->map(fn ($n) => [
                'id' => $n->node_id,
                'x'  => $n->x,
                'y'  => $n->y,
            ])->values()->toArray(),
        ];
    }
}
