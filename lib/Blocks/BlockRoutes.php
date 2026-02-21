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
     * Calls render() to get the template — works with both file-based
     * templates (that call include template.php) and method-based templates
     * (that return HTML directly from render()).
     *
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response
     */
    public function get_template($request)
    {
        $block_name = $request->get_param('name');
        $registry = BlockRegistry::instance();

        if (!$registry->has($block_name)) {
            // Fallback: check JsonBlockLoader for JSON-defined blocks
            $json_def = \Gateway\Blocks\JsonBlock\JsonBlockLoader::get($block_name);
            if ($json_def !== null && isset($json_def['template'])) {
                return rest_ensure_response([
                    'template'  => $json_def['template'],
                    'blockName' => $block_name,
                ]);
            }

            return new \WP_Error(
                'block_not_found',
                'Block not found',
                ['status' => 404]
            );
        }

        $block = $registry->get($block_name);
        
        try {
            // Call render() with empty parameters to get the template content
            // This works whether the template is in a file or defined in the method
            $template_content = $block->render([], '', null);
            
            return rest_ensure_response([
                'template' => $template_content,
                'blockName' => $block_name,
            ]);
        } catch (\Throwable $e) {
            return new \WP_Error(
                'render_error',
                'Failed to render template: ' . $e->getMessage(),
                ['status' => 500]
            );
        }
    }
}
