<?php

namespace Gateway\Collections;

use Gateway\PermissionChecksTrait;
use Gateway\Plugin;

class CollectionRoutes
{
    use PermissionChecksTrait;

    /**
     * @var object|null
     */
    private $registry = null;

    /**
     * Register REST API routes
     */
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    /**
     * Register the routes
     */
    public function registerRoutes()
    {
        // Get many collections
        register_rest_route('gateway/v1', '/collections', [
            'methods' => 'GET',
            'callback' => [$this, 'getMany'],
            'permission_callback' => [$this, 'checkPermission'],
            'args' => [
                'package' => [
                    'required' => false,
                    'type' => 'string',
                    'description' => 'Filter collections by package name',
                ],
            ],
        ]);

        // Get one collection by key
        register_rest_route('gateway/v1', '/collections/(?P<key>[a-z_]+)', [
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

    /**
     * Check permission
     */
    public function checkPermission()
    {
        return $this->checkProtectedPermission();
    }

    /**
     * Resolve and return the CollectionRegistry instance.
     *
     * Uses the Plugin singleton which constructs and holds the registry.
     *
     * @return CollectionRegistry
     * @throws \RuntimeException
     */
    private function getRegistry()
    {
        if ($this->registry !== null) {
            return $this->registry;
        }

        if (!class_exists(Plugin::class)) {
            throw new \RuntimeException('Plugin class not found; cannot obtain CollectionRegistry.');
        }

        $plugin = Plugin::getInstance();

        if (!method_exists($plugin, 'getRegistry')) {
            throw new \RuntimeException('Plugin::getRegistry() not available; check Plugin.php.');
        }

        $this->registry = $plugin->getRegistry();

        return $this->registry;
    }

    /**
     * Get many collections
     */
    public function getMany(\WP_REST_Request $request)
    {
        try {
            $packageFilter = $request->get_param('package');
            $collections = $this->getRegistry()->getAll();
            $result = [];

            foreach ($collections as $entry) {
                // If registry returned an instance, use it; if it returned a class name, instantiate.
                if (is_object($entry)) {
                    $collection = $entry;
                    $collectionClass = get_class($collection);
                } elseif (is_string($entry) && class_exists($entry)) {
                    $collectionClass = $entry;
                    $collection = new $collectionClass();
                } else {
                    // Skip invalid entries
                    continue;
                }

                // Filter by package if specified
                if ($packageFilter !== null && $packageFilter !== '') {
                    $collectionPackage = method_exists($collection, 'getPackage') 
                        ? $collection->getPackage() 
                        : 'default';
                    
                    if ($collectionPackage !== $packageFilter) {
                        continue;
                    }
                }

                $result[] = $this->collectionToArray($collectionClass, $collection);
            }

            return new \WP_REST_Response($result, 200);
        } catch (\Exception $e) {
            return new \WP_REST_Response([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get one collection by key
     *
     * Since collections are registered by class and not by a registry key,
     * iterate registered collections and compare their $key (or getKey()).
     */
    public function getOne(\WP_REST_Request $request)
    {
        try {
            $key = $request->get_param('key');

            $collections = $this->getRegistry()->getAll();

            foreach ($collections as $entry) {
                if (is_object($entry)) {
                    $collection = $entry;
                    $collectionClass = get_class($collection);
                } elseif (is_string($entry) && class_exists($entry)) {
                    $collectionClass = $entry;
                    $collection = new $collectionClass();
                } else {
                    continue;
                }

                // getKey() is always available — use it directly
                $collectionKey = $collection->getKey();

                if ($collectionKey === $key) {
                    return new \WP_REST_Response(
                        $this->collectionToArray($collectionClass, $collection), 
                        200
                    );
                }
            }

            return new \WP_REST_Response([
                'error' => 'Collection not found',
            ], 404);
        } catch (\Exception $e) {
            return new \WP_REST_Response([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Convert collection to array
     */
    private function collectionToArray($collectionClass, $collection)
    {
        // Get route configuration from collection
        $routes = method_exists($collection, 'getRoutes') ? $collection->getRoutes() : [];
        $restNamespace = method_exists($collection, 'getRestNamespace') ? $collection->getRestNamespace() : '';
        $route = method_exists($collection, 'getRoute') ? $collection->getRoute() : '';

        // Build the full API endpoint URL
        $baseUrl = rest_url();
        $apiEndpoint = rtrim($baseUrl, '/') . '/' . trim($restNamespace, '/') . '/' . trim($route, '/');

        // Fields are part of the collection
        $fields = method_exists($collection, 'getFields') ? $collection->getFields() : [];

        // Filters are part of the collection
        $filters = method_exists($collection, 'getFilters') ? $collection->getFilters() : [];

        // Grid configuration
        $grid = method_exists($collection, 'getGrid') ? $collection->getGrid() : [];

        // Since Collection extends Eloquent Model, we can get model data directly
        $table = method_exists($collection, 'getTable') ? $collection->getTable() : null;
        $fillable = method_exists($collection, 'getFillable') ? $collection->getFillable() : [];

        // Get casts if available
        $casts = [];
        $reflection = new \ReflectionClass($collection);
        if ($reflection->hasProperty('casts')) {
            $castsProp = $reflection->getProperty('casts');
            $castsProp->setAccessible(true);
            $casts = $castsProp->getValue($collection);
        }

        // Get the collection key
        $key = method_exists($collection, 'getKey') ? $collection->getKey() : null;

        // Get title and titlePlural
        $title = method_exists($collection, 'getTitle') ? $collection->getTitle() : null;
        $titlePlural = method_exists($collection, 'getTitlePlural') ? $collection->getTitlePlural() : null;

        // Get package
        $package = method_exists($collection, 'getPackage') ? $collection->getPackage() : 'default';

        return [
            'key' => $key,
            'title' => $title,
            'titlePlural' => $titlePlural,
            'package' => $package,
            'class' => $collectionClass,
            'name' => basename(str_replace('\\', '/', $collectionClass)),
            'table' => $table,
            'fillable' => $fillable,
            'casts' => $casts,
            'routes' => [
                'namespace' => $restNamespace,
                'route' => $route,
                'endpoint' => $apiEndpoint,
                'methods' => $routes['methods'] ?? [],
            ],
            'fields' => $fields,
            'filters' => $filters,
            'grid' => $grid,
        ];
    }
}