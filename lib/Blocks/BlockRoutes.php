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
}
