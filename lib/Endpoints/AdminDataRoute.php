<?php

namespace Gateway\Endpoints;

use Gateway\Extensions\ExtensionRegistry;
use Gateway\Plugin;
use Gateway\REST\RequestLog;
use Gateway\Raptor\Collections\RaptorCollection;

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
        /*
         * 
         * We have several registries now, this was the first one and was likely named as simply "registry" referring to collections register.
         * 
         */
        $registry = Plugin::getInstance()->getRegistry();
        $standardRoutes = Plugin::getInstance()->getStandardRoutes();

        // Get all collections
        $collections = $registry->getAll();
        $collectionsData = [];
        $recordCount = 0; // Total records across all collections

        // Collections that exist in gateway_raptor_collection are DB-managed.
        // They must never be treated as code-defined even if the extension
        // builder later generated a PHP class for them.
        $dbManagedKeys = [];
        try {
            $dbManagedKeys = RaptorCollection::pluck('collection_key')->flip()->toArray();
        } catch (\Exception $e) {
            // Table may not exist yet — leave empty, fall back to field check.
        }

        // Get actual registered routes
        $actualRoutes = $standardRoutes->getActualRegisteredRoutes();

        foreach ($collections as $key => $collection) {
            // Skip private (structural/internal) collections.
            if (method_exists($collection, 'isPrivate') && $collection->isPrivate()) {
                continue;
            }

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

            // Check if table exists before counting
            if ($this->tableExists($fullTableName)) {
                $count = $fqcn::count();
            } else {
                $count = 0;
            }
            $recordCount += $count;

            $collectionsData[] = [
                'key'             => $key,
                'title'           => $title,
                'titlePlural'     => $titlePlural,
                'className'       => $className,
                'fqcn'            => $fqcn,
                'table'           => $fullTableName,
                'routes'          => $collectionRoutes,
                'record_count'    => $count,
                'is_code_defined' => !isset($dbManagedKeys[$key]) && !empty($collection->getFields()),
            ];
        }

        return [
            'collections' => $collectionsData,
            'record_count' => $recordCount,
            'registered_extensions_count' => ExtensionRegistry::instance()->count(),
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

    /**
     * Helper to check if a database table exists.
     * 
     * This is needed to prevent fatal errors when collections are registered
     * but their database tables have not yet been created. This allows the
     * admin UI to load and display the auto-generated migration file that
     * creates the missing tables. If the UI is ever separated so this code
     * only runs after tables are created, this check can be removed.
     */
    private function tableExists($table) {
        global $wpdb;
        return $wpdb->get_var($wpdb->prepare(
            "SHOW TABLES LIKE %s", $table
        )) === $table;
    }
}
