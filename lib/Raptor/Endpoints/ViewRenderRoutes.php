<?php

namespace Gateway\Raptor\Endpoints;

use Gateway\Raptor\Controllers\ViewController;
use Gateway\Raptor\Controllers\ViewRenderController;

if (!defined('ABSPATH')) {
    exit;
}

class ViewRenderRoutes
{
    const VALID_ENGINES  = ['shortcode', 'block', 'template', 'page'];
    const VALID_JS_TYPES = ['react', 'preact', 'wpia'];

    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    public function registerRoutes(): void
    {
        register_rest_route('gateway/v1', '/raptor/view/(?P<view_key>[a-zA-Z0-9_\-]+)/renders', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getViewRenders'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'createViewRender'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);

        register_rest_route('gateway/v1', '/raptor/view/(?P<view_key>[a-zA-Z0-9_\-]+)/renders/(?P<render_id>\d+)', [
            [
                'methods'             => 'DELETE',
                'callback'            => [$this, 'deleteViewRender'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);
    }

    public function checkPermissions(): bool
    {
        return current_user_can('manage_options');
    }

    public function getViewRenders(\WP_REST_Request $request): \WP_REST_Response
    {
        $view = ViewController::get($request->get_param('view_key'));

        if (!$view) {
            return new \WP_REST_Response(['success' => false, 'message' => 'View not found.'], 404);
        }

        $renders = ViewRenderController::getForView($view);

        return new \WP_REST_Response([
            'success' => true,
            'renders' => $renders->toArray(),
        ], 200);
    }

    public function createViewRender(\WP_REST_Request $request): \WP_REST_Response
    {
        $view = ViewController::get($request->get_param('view_key'));

        if (!$view) {
            return new \WP_REST_Response(['success' => false, 'message' => 'View not found.'], 404);
        }

        $data    = $request->get_json_params() ?? [];
        $engine  = sanitize_text_field($data['engine'] ?? '');
        $jsType  = sanitize_text_field($data['js_type'] ?? 'react');

        if (!in_array($engine, self::VALID_ENGINES, true)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Invalid engine. Must be one of: ' . implode(', ', self::VALID_ENGINES),
            ], 400);
        }

        if (!in_array($jsType, self::VALID_JS_TYPES, true)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Invalid js_type. Must be one of: ' . implode(', ', self::VALID_JS_TYPES),
            ], 400);
        }

        $render = ViewRenderController::create($view, $engine, $jsType);

        return new \WP_REST_Response([
            'success' => true,
            'message' => 'Render created.',
            'render'  => $render->toArray(),
        ], 201);
    }

    public function deleteViewRender(\WP_REST_Request $request): \WP_REST_Response
    {
        $view = ViewController::get($request->get_param('view_key'));

        if (!$view) {
            return new \WP_REST_Response(['success' => false, 'message' => 'View not found.'], 404);
        }

        $renderId = (int) $request->get_param('render_id');
        $render   = ViewRenderController::find($renderId);

        if (!$render || (int) $render->view_id !== $view->id) {
            return new \WP_REST_Response(['success' => false, 'message' => 'Render not found.'], 404);
        }

        ViewRenderController::delete($render);

        return new \WP_REST_Response(['success' => true, 'message' => 'Render deleted.'], 200);
    }
}
