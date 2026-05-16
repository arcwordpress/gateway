<?php

namespace Gateway\Grids;

use Gateway\REST\RouteAuthenticationTrait;
use Gateway\Plugin;

class GridRoutes
{
    use RouteAuthenticationTrait;

    private $registry = null;

    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    public function registerRoutes()
    {
        register_rest_route('gateway/v1', '/grids', [
            'methods' => 'GET',
            'callback' => [$this, 'getMany'],
            'permission_callback' => [$this, 'checkPermission'],
        ]);

        register_rest_route('gateway/v1', '/grids/(?P<key>[a-z_]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'getOne'],
            'permission_callback' => [$this, 'checkPermission'],
            'args' => [
                'key' => [
                    'required' => true,
                    'type' => 'string',
                    'pattern' => '^[a-z_]+$',
                ],
            ],
        ]);
    }

    public function checkPermission()
    {
        $authResult = $this->checkAuthentication();

        if (is_wp_error($authResult)) {
            return $authResult;
        }

        return is_user_logged_in() ? true : new \WP_Error(
            'rest_not_authenticated',
            __('User not authenticated.'),
            ['status' => 401]
        );
    }

    private function getRegistry()
    {
        if ($this->registry !== null) {
            return $this->registry;
        }

        $this->registry = Plugin::getInstance()->getGridRegistry();

        return $this->registry;
    }

    public function getMany(\WP_REST_Request $request)
    {
        try {
            $result = [];

            foreach ($this->getRegistry()->getAll() as $grid) {
                $result[] = $this->gridToArray($grid);
            }

            return new \WP_REST_Response($result, 200);
        } catch (\Exception $e) {
            return new \WP_REST_Response(['error' => $e->getMessage()], 500);
        }
    }

    public function getOne(\WP_REST_Request $request)
    {
        try {
            $key = $request->get_param('key');
            $registry = $this->getRegistry();

            if (!$registry->has($key)) {
                return new \WP_REST_Response(['error' => 'Grid not found'], 404);
            }

            return new \WP_REST_Response($this->gridToArray($registry->get($key)), 200);
        } catch (\Exception $e) {
            return new \WP_REST_Response(['error' => $e->getMessage()], 500);
        }
    }

    private function gridToArray(\Gateway\Grid $grid)
    {
        $collection = $grid->getCollection();

        return [
            'key'          => $grid->getKey(),
            'class'        => get_class($grid),
            'columns'      => $grid->getColumns(),
            'facets'       => $grid->getFacets(),
            'defaultSort'  => $grid->getDefaultSort(),
            'perPage'      => $grid->getPerPage(),
            'collection'   => $collection ? $collection->getCollectionKey() : null,
        ];
    }
}
