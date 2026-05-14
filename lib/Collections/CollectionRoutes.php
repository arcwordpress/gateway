<?php

namespace Gateway\Collections;

use Gateway\REST\RouteAuthenticationTrait;
use Gateway\Plugin;
use Gateway\Raptor\Collections\RaptorCollection;

class CollectionRoutes
{
    use RouteAuthenticationTrait;

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
                    'required'    => false,
                    'type'        => 'string',
                    'description' => 'Filter collections by package name',
                ],
                'include_private' => [
                    'required'    => false,
                    'type'        => 'boolean',
                    'default'     => false,
                    'description' => 'When true, include core and private collections in the response.',
                ],
            ],
        ]);

        // Get one collection by key
        register_rest_route('gateway/v1', '/collections/(?P<key>[a-zA-Z0-9_\-]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'getOne'],
            'permission_callback' => '__return_true',
            'args' => [
                'key' => [
                    'required' => true,
                    'type' => 'string',
                    'pattern' => '^[a-zA-Z0-9_\-]+$',
                ],
            ],
        ]);
    }

    /**
     * Check permission - these routes require authentication
     */
    public function checkPermission()
    {
        $authResult = $this->checkAuthentication();
        
        if (is_wp_error($authResult)) {
            return $authResult;
        }
        
        // After authentication passes, verify user is logged in
        return is_user_logged_in() ? true : new \WP_Error(
            'rest_not_authenticated',
            __('User not authenticated.'),
            ['status' => 401]
        );
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
     * Fetch actual registered routes for every collection from StandardRoutes.
     * Keyed by collection route key (e.g. 'events').
     */
    private function getActualRegisteredRoutes(): array
    {
        try {
            $standardRoutes = Plugin::getInstance()->getStandardRoutes();
            return $standardRoutes->getActualRegisteredRoutes();
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Convert a raw route pattern to a human-readable display format.
     * e.g. (?P<id>\d+) → [id]
     */
    private function getFriendlyRoute(string $route): string
    {
        $route = preg_replace('/\(\?P<([^>]+)>[^)]+\)/', '[$1]', $route);
        $route = preg_replace('/\(\?:([^)]+)\)/', '[$1]', $route);
        return $route;
    }

    /**
     * Keys that exist in gateway_raptor_collection — these are DB-managed regardless
     * of whether a PHP class also exists for them.
     */
    private function getDbManagedKeys(): array
    {
        try {
            return RaptorCollection::pluck('collection_key')->flip()->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Get many collections
     */
    public function getMany(\WP_REST_Request $request)
    {
        try {
            $packageFilter  = $request->get_param('package');
            $includePrivate = (bool) $request->get_param('include_private');
            $withCounts     = (bool) $request->get_param('with_counts');
            $collections    = $this->getRegistry()->getAll();
            $dbManagedKeys  = $this->getDbManagedKeys();
            $actualRoutes   = $this->getActualRegisteredRoutes();
            $result         = [];

            foreach ($collections as $entry) {
                // If registry returned an instance, use it; if it returned a class name, instantiate.
                if (is_object($entry)) {
                    $collection      = $entry;
                    $collectionClass = get_class($collection);
                } elseif (is_string($entry) && class_exists($entry)) {
                    $collectionClass = $entry;
                    $collection      = new $collectionClass();
                } else {
                    // Skip invalid entries
                    continue;
                }

                // Exclude core / private collections unless the caller opts in.
                if (!$includePrivate &&
                    method_exists($collection, 'isHidden') &&
                    $collection->isHidden()) {
                    continue;
                }

                // Filter by package if specified — collection's own $package property is the source of truth
                if ($packageFilter !== null && $packageFilter !== '') {
                    $collectionPackage = method_exists($collection, 'getPackage')
                        ? $collection->getPackage()
                        : 'default';
                    if ($collectionPackage !== $packageFilter) {
                        continue;
                    }
                }

                $entry = $this->collectionToArray($collectionClass, $collection, $dbManagedKeys, $actualRoutes);

                if ($withCounts) {
                    $entry['record_count'] = $this->countRecords($collectionClass);
                }

                $result[] = $entry;
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
                        $this->collectionToArray(
                            $collectionClass,
                            $collection,
                            $this->getDbManagedKeys(),
                            $this->getActualRegisteredRoutes()
                        ),
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
     *
     * @param string $collectionClass
     * @param object $collection
     * @param array  $dbManagedKeys   Keys from gateway_raptor_collection, keyed by collection_key
     */
    private function collectionToArray($collectionClass, $collection, array $dbManagedKeys = [], array $actualRoutes = [])
    {
        // Route key used to look up actual registered routes (may differ from collection key)
        $routeKey = method_exists($collection, 'getRoute') ? $collection->getRoute() : '';

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
            $casts = $castsProp->getValue($collection);
        }

        // Get the collection key
        $key = method_exists($collection, 'getKey') ? $collection->getKey() : null;

        // Get title and titlePlural
        $title = method_exists($collection, 'getTitle') ? $collection->getTitle() : null;
        $titlePlural = method_exists($collection, 'getTitlePlural') ? $collection->getTitlePlural() : null;

        // Get package
        $package = method_exists($collection, 'getPackage') ? $collection->getPackage() : 'default';

        // Visibility flags
        $core    = method_exists($collection, 'isCore')    ? $collection->isCore()    : false;
        $private = method_exists($collection, 'isPrivate') ? $collection->isPrivate() : false;

        // A collection is code-defined only if it has NO record in gateway_raptor_collection.
        // Once built into the DB it is DB-managed even if a PHP class also exists.
        $isCodeDefined = !isset($dbManagedKeys[$key]) && !empty($fields);

        // Build registered-route list from StandardRoutes (post-customisation)
        $registeredRoutes = [];
        foreach ($actualRoutes[$routeKey] ?? [] as $r) {
            $registeredRoutes[] = [
                'type'         => $r['type'],
                'method'       => $r['method'],
                'route'        => $r['full_route'],
                'displayRoute' => $this->getFriendlyRoute($r['full_route']),
                'namespace'    => $r['namespace'],
                'path'         => $r['route'],
            ];
        }

        return [
            'key'             => $key,
            'title'           => $title,
            'titlePlural'     => $titlePlural,
            'is_code_defined' => $isCodeDefined,
            'package'         => $package,
            'core'            => $core,
            'private'         => $private,
            'fqcn'            => $collectionClass,
            'className'       => basename(str_replace('\\', '/', $collectionClass)),
            'table'           => $table,
            'fillable'        => $fillable,
            'casts'           => $casts,
            'routes'          => $registeredRoutes,
            'fields'       => $fields,
            'filters'      => $filters,
            'grid'         => $grid,
            'displayField' => method_exists($collection, 'getDisplayField') ? $collection->getDisplayField() : null,
        ];
    }

    /**
     * Count records for a collection using Eloquent's count().
     *
     * @param  string $collectionClass Fully-qualified collection class name
     * @return int|null
     */
    private function countRecords(string $collectionClass): ?int
    {
        try {
            return (int) $collectionClass::count();
        } catch (\Throwable $e) {
            return null;
        }
    }
}