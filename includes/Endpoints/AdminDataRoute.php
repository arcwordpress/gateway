<?php

namespace Gateway\Endpoints;

use Gateway\Plugin;

if (!defined('ABSPATH')) exit;

/**
 * Admin Data Route
 *
 * Provides API endpoint for retrieving admin page data
 */
class AdminDataRoute
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoute']);
    }

    public function registerRoute()
    {
        register_rest_route('gateway/v1', '/admin-data', [
            'methods' => 'GET',
            'callback' => [$this, 'getData'],
            'permission_callback' => function () {
                return current_user_can('manage_options');
            }
        ]);
    }

    public function getData($request)
    {
        $registry = Plugin::getInstance()->getRegistry();
        $standardRoutes = Plugin::getInstance()->getStandardRoutes();

        // Get all collections
        $collections = $registry->getAll();
        $collectionsData = [];

        foreach ($collections as $key => $collection) {
            $collectionsData[] = [
                'key' => $key,
                'class' => get_class($collection),
                'table' => $collection->getTable()
            ];
        }

        // Get all routes
        $routes = $standardRoutes->getRouteInfo();
        $routesData = [];

        foreach ($routes as $collectionName => $endpoints) {
            $routesForCollection = [];
            foreach ($endpoints as $route) {
                $routesForCollection[] = [
                    'type' => $route['type'],
                    'method' => $route['method'],
                    'route' => $route['route']
                ];
            }
            $routesData[$collectionName] = $routesForCollection;
        }

        return [
            'collections' => $collectionsData,
            'routes' => $routesData
        ];
    }
}
