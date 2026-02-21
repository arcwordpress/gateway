<?php

namespace Gateway\Blocks\JsonBlock;

/**
 * REST API endpoints for managing JSON block definitions stored in the database.
 *
 * Filesystem-defined blocks (schema/blocks/types/*.json) are read-only and
 * not exposed for mutation through these routes.
 *
 * Routes:
 *   GET    /gateway/v1/json-blocks              List all DB-stored definitions
 *   POST   /gateway/v1/json-blocks              Create or update a definition
 *   GET    /gateway/v1/json-blocks/{namespace/name}  Get a single definition
 *   DELETE /gateway/v1/json-blocks/{namespace/name}  Delete a definition
 */
class JsonBlockRoutes
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    public function registerRoutes(): void
    {
        register_rest_route('gateway/v1', '/json-blocks', [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [$this, 'index'],
                'permission_callback' => '__return_true',
            ],
            [
                'methods'             => \WP_REST_Server::CREATABLE,
                'callback'            => [$this, 'upsert'],
                'permission_callback' => [$this, 'canManage'],
            ],
        ]);

        register_rest_route('gateway/v1', '/json-blocks/(?P<name>[a-z0-9-]+/[a-z0-9-]+)', [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [$this, 'show'],
                'permission_callback' => '__return_true',
                'args'                => [
                    'name' => ['required' => true, 'type' => 'string'],
                ],
            ],
            [
                'methods'             => \WP_REST_Server::DELETABLE,
                'callback'            => [$this, 'destroy'],
                'permission_callback' => [$this, 'canManage'],
                'args'                => [
                    'name' => ['required' => true, 'type' => 'string'],
                ],
            ],
        ]);
    }

    /**
     * GET /gateway/v1/json-blocks
     * List all definitions stored in the database.
     */
    public function index(): \WP_REST_Response
    {
        $stored = get_option('gateway_json_blocks', []);
        return rest_ensure_response(array_values(is_array($stored) ? $stored : []));
    }

    /**
     * POST /gateway/v1/json-blocks
     * Create or update a JSON block definition.
     */
    public function upsert(\WP_REST_Request $request): \WP_REST_Response|\WP_Error
    {
        $body = $request->get_json_params();

        if (empty($body) || !is_array($body)) {
            return new \WP_Error(
                'invalid_body',
                'Request body must be valid JSON.',
                ['status' => 400]
            );
        }

        if (!JsonBlockLoader::isValid($body)) {
            return new \WP_Error(
                'invalid_definition',
                'Block definition requires a valid "name" (namespace/block-name) and a "title".',
                ['status' => 422]
            );
        }

        JsonBlockLoader::save($body);

        return rest_ensure_response([
            'saved'      => true,
            'definition' => $body,
        ]);
    }

    /**
     * GET /gateway/v1/json-blocks/{name}
     * Retrieve a single DB-stored definition.
     */
    public function show(\WP_REST_Request $request): \WP_REST_Response|\WP_Error
    {
        $name   = $request->get_param('name');
        $stored = get_option('gateway_json_blocks', []);

        if (!isset($stored[$name])) {
            return new \WP_Error('not_found', 'JSON block definition not found.', ['status' => 404]);
        }

        return rest_ensure_response($stored[$name]);
    }

    /**
     * DELETE /gateway/v1/json-blocks/{name}
     * Remove a definition from the database.
     */
    public function destroy(\WP_REST_Request $request): \WP_REST_Response|\WP_Error
    {
        $name    = $request->get_param('name');
        $deleted = JsonBlockLoader::delete($name);

        if (!$deleted) {
            return new \WP_Error('not_found', 'JSON block definition not found.', ['status' => 404]);
        }

        return rest_ensure_response(['deleted' => true, 'name' => $name]);
    }

    public function canManage(): bool
    {
        return current_user_can('manage_options');
    }
}
