<?php

namespace Gateway\Blocks;

class BlockRoutes
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    public function register_routes()
    {
        register_rest_route('gateway/v1', '/blocks', [
            'methods' => 'GET',
            'callback' => [$this, 'get_blocks'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route('gateway/v1', '/blocks/(?P<name>[a-zA-Z0-9-]+/[a-zA-Z0-9-]+)/template', [
            'methods' => 'GET',
            'callback' => [$this, 'get_template'],
            'permission_callback' => '__return_true',
            'args' => [
                'name' => [
                    'required' => true,
                    'type' => 'string',
                ],
            ],
        ]);
    }

    /**
     * Get all registered blocks metadata
     *
     * @return \WP_REST_Response
     */
    public function get_blocks()
    {
        $registry = BlockRegistry::instance();
        $blocks = array_values($registry->getMetadata());

        return rest_ensure_response($blocks);
    }

    /**
     * Get template content for a specific block
     *
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response
     */
    public function get_template($request)
    {
        $block_name = $request->get_param('name');
        $registry = BlockRegistry::instance();

        if (!$registry->has($block_name)) {
            return new \WP_Error(
                'block_not_found',
                'Block not found',
                ['status' => 404]
            );
        }

        $block = $registry->get($block_name);
        $template_path = $block::getBlockDir() . '/template.php';

        if (!file_exists($template_path)) {
            return new \WP_Error(
                'template_not_found',
                'Template file not found',
                ['status' => 404]
            );
        }

        $template_content = file_get_contents($template_path);

        return rest_ensure_response([
            'template' => $template_content,
            'blockName' => $block_name,
        ]);
    }
}
