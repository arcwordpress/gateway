<?php

namespace Gateway\Endpoints;

use Gateway\Plugin;
use Gateway\REST\RequestLog;

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
        $recordCount = 0; // Total records across all collections

        // Get actual registered routes
        $actualRoutes = $standardRoutes->getActualRegisteredRoutes();

        foreach ($collections as $key => $collection) {
            $fqcn = get_class($collection);
            $className = class_basename($fqcn);

            // Get title and titlePlural from collection
            $title = $collection->getTitle();
            $titlePlural = $collection->getTitlePlural();

            // Get routes for this specific collection
            $routeKey = $collection->getRoute();
            $collectionRoutes = [];
            if (isset($actualRoutes[$routeKey])) {
                foreach ($actualRoutes[$routeKey] as $route) {
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

            // Use Eloquent's static count() to get the number of records for this collection
            $count = $fqcn::count();
            $recordCount += $count;

            $collectionsData[] = [
                'key' => $key,
                'title' => $title,
                'titlePlural' => $titlePlural,
                'className' => $className,
                'fqcn' => $fqcn,
                'table' => $fullTableName,
                'routes' => $collectionRoutes,
                'record_count' => $count,
            ];
        }

        return [
            'collections' => $collectionsData,
            'record_count' => $recordCount,
            'weekly_request_totals' => RequestLog::getWeeklyRequestTotals(),
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

}
