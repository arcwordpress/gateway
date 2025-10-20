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

        // Get actual registered routes
        $actualRoutes = $standardRoutes->getActualRegisteredRoutes();

        foreach ($collections as $key => $collection) {
            $fqcn = get_class($collection);
            $className = class_basename($fqcn);

            // Get title from collection
            $title = $this->getCollectionTitle($collection);

            // Get routes for this specific collection
            $collectionRoutes = [];
            if (isset($actualRoutes[$key])) {
                foreach ($actualRoutes[$key] as $route) {
                    $collectionRoutes[] = [
                        'type' => $route['type'],
                        'method' => $route['method'],
                        'route' => $route['full_route'],
                        'displayRoute' => $this->getFriendlyRoute($route['full_route']),
                        'namespace' => $route['namespace'],
                        'path' => $route['route'],
                    ];
                }
            }

            // Get table name with WordPress prefix
            global $wpdb;
            $tableName = $collection->getTable();
            $fullTableName = $wpdb->prefix . $tableName;

            $collectionsData[] = [
                'key' => $key,
                'title' => $title,
                'className' => $className,
                'fqcn' => $fqcn,
                'table' => $fullTableName,
                'routes' => $collectionRoutes
            ];
        }

        return [
            'collections' => $collectionsData
        ];
    }

    /**
     * Convert route pattern to friendly display format
     * Replaces regex patterns like (?P<id>\d+) with [id]
     *
     * @param string $route
     * @return string
     */
    private function getFriendlyRoute($route)
    {
        // Replace named regex patterns like (?P<id>\d+) with [id]
        $friendlyRoute = preg_replace('/\(\?P<([^>]+)>[^)]+\)/', '[$1]', $route);

        // Replace other common regex patterns
        $friendlyRoute = preg_replace('/\(\?:([^)]+)\)/', '[$1]', $friendlyRoute);

        return $friendlyRoute;
    }

    /**
     * Get the title for a collection
     *
     * @param \Gateway\Collection $collection
     * @return string
     */
    private function getCollectionTitle($collection)
    {
        // Check if collection has a title property
        $reflectionClass = new \ReflectionClass($collection);

        if ($reflectionClass->hasProperty('title')) {
            $property = $reflectionClass->getProperty('title');
            $property->setAccessible(true);
            $title = $property->getValue($collection);

            if (!empty($title)) {
                return $title;
            }
        }

        // Fallback: Generate title from class name
        $className = class_basename(get_class($collection));
        $name = str_replace('Collection', '', $className);

        // Convert PascalCase to Title Case with spaces
        $title = preg_replace('/(?<!^)[A-Z]/', ' $0', $name);

        return ucwords($title);
    }
}
