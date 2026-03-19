<?php

namespace Gateway\Raptor\Endpoints;

use Gateway\Raptor\Controllers\FacetController;
use Gateway\Raptor\Controllers\ViewController;

if (!defined('ABSPATH')) {
    exit;
}

class FacetRoutes
{
    const VALID_FACET_TYPES = ['text', 'select', 'checkbox', 'range', 'date_range'];

    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    public function registerRoutes(): void
    {
        register_rest_route('gateway/v1', '/raptor/view/(?P<view_key>[a-zA-Z0-9_\-]+)/facets', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getFacets'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'createFacet'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);

        register_rest_route('gateway/v1', '/raptor/view/(?P<view_key>[a-zA-Z0-9_\-]+)/facets/(?P<facet_id>\d+)', [
            [
                'methods'             => 'PATCH,PUT',
                'callback'            => [$this, 'updateFacet'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'DELETE',
                'callback'            => [$this, 'deleteFacet'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);
    }

    public function checkPermissions(): bool
    {
        return current_user_can('manage_options');
    }

    public function getFacets(\WP_REST_Request $request): \WP_REST_Response
    {
        $view = ViewController::get($request->get_param('view_key'));

        if (!$view) {
            return new \WP_REST_Response(['success' => false, 'message' => 'View not found.'], 404);
        }

        $facets = FacetController::getForView($view);

        return new \WP_REST_Response([
            'success' => true,
            'facets'  => $facets->toArray(),
        ], 200);
    }

    public function createFacet(\WP_REST_Request $request): \WP_REST_Response
    {
        $view = ViewController::get($request->get_param('view_key'));

        if (!$view) {
            return new \WP_REST_Response(['success' => false, 'message' => 'View not found.'], 404);
        }

        $data      = $request->get_json_params() ?? [];
        $facetType = sanitize_text_field($data['facet_type'] ?? 'text');

        if (!in_array($facetType, self::VALID_FACET_TYPES, true)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Invalid facet_type. Must be one of: ' . implode(', ', self::VALID_FACET_TYPES),
            ], 400);
        }

        $attributes = [
            'label'      => sanitize_text_field($data['label'] ?? ''),
            'field_name' => sanitize_key($data['field_name'] ?? ''),
            'facet_type' => $facetType,
            'config'     => isset($data['config']) && is_array($data['config']) ? $data['config'] : [],
            'sort_order' => (int) ($data['sort_order'] ?? 0),
        ];

        $facet = FacetController::create($view, $attributes);

        return new \WP_REST_Response([
            'success' => true,
            'message' => 'Facet created.',
            'facet'   => $facet->toArray(),
        ], 201);
    }

    public function updateFacet(\WP_REST_Request $request): \WP_REST_Response
    {
        $view = ViewController::get($request->get_param('view_key'));

        if (!$view) {
            return new \WP_REST_Response(['success' => false, 'message' => 'View not found.'], 404);
        }

        $facetId = (int) $request->get_param('facet_id');
        $facet   = FacetController::find($facetId);

        if (!$facet) {
            return new \WP_REST_Response(['success' => false, 'message' => 'Facet not found.'], 404);
        }

        $data       = $request->get_json_params() ?? [];
        $attributes = [];

        if (isset($data['label'])) {
            $attributes['label'] = sanitize_text_field($data['label']);
        }
        if (isset($data['field_name'])) {
            $attributes['field_name'] = sanitize_key($data['field_name']);
        }
        if (isset($data['facet_type'])) {
            $facetType = sanitize_text_field($data['facet_type']);
            if (!in_array($facetType, self::VALID_FACET_TYPES, true)) {
                return new \WP_REST_Response([
                    'success' => false,
                    'message' => 'Invalid facet_type. Must be one of: ' . implode(', ', self::VALID_FACET_TYPES),
                ], 400);
            }
            $attributes['facet_type'] = $facetType;
        }
        if (isset($data['config']) && is_array($data['config'])) {
            $attributes['config'] = $data['config'];
        }
        if (isset($data['sort_order'])) {
            $attributes['sort_order'] = (int) $data['sort_order'];
        }

        $facet = FacetController::update($facet, $attributes);

        return new \WP_REST_Response([
            'success' => true,
            'message' => 'Facet updated.',
            'facet'   => $facet->toArray(),
        ], 200);
    }

    public function deleteFacet(\WP_REST_Request $request): \WP_REST_Response
    {
        $view = ViewController::get($request->get_param('view_key'));

        if (!$view) {
            return new \WP_REST_Response(['success' => false, 'message' => 'View not found.'], 404);
        }

        $facetId = (int) $request->get_param('facet_id');
        $facet   = FacetController::find($facetId);

        if (!$facet) {
            return new \WP_REST_Response(['success' => false, 'message' => 'Facet not found.'], 404);
        }

        FacetController::delete($facet);

        return new \WP_REST_Response(['success' => true, 'message' => 'Facet deleted.'], 200);
    }
}
