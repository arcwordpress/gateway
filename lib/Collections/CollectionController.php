<?php

namespace Gateway\Collections;

use Gateway\Controller;
use Gateway\Plugin;
use Gateway\Raptor\Collections\RaptorCollection;
use Gateway\Traits\CollectionEagerLoadable;

class CollectionController extends Controller
{
    /** The Eloquent model class this controller manages. */
    protected static $model = \Gateway\Collection::class;

    /** @var object|null Cached CollectionRegistry instance */
    private $registry = null;

    // ─── Registry & route helpers ─────────────────────────────────────────────

    /**
     * Resolve and return the CollectionRegistry from the Plugin singleton.
     *
     * @return CollectionRegistry
     * @throws \RuntimeException
     */
    public function getRegistry()
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
    public function getActualRegisteredRoutes(): array
    {
        try {
            return Plugin::getInstance()->getStandardRoutes()->getActualRegisteredRoutes();
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Convert a raw WP route pattern to a human-readable display format.
     * e.g. (?P<id>\d+) → [id]
     */
    public function getFriendlyRoute(string $route): string
    {
        $route = preg_replace('/\(\?P<([^>]+)>[^)]+\)/', '[$1]', $route);
        $route = preg_replace('/\(\?:([^)]+)\)/', '[$1]', $route);
        return $route;
    }

    /**
     * Keys that exist in gateway_raptor_collection — DB-managed regardless
     * of whether a PHP class also exists for them.
     */
    public function getDbManagedKeys(): array
    {
        try {
            return RaptorCollection::pluck('collection_key')->flip()->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    // ─── Request handlers ─────────────────────────────────────────────────────

    /**
     * Handle GET /collections
     */
    public function getMany(\WP_REST_Request $request): \WP_REST_Response
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
                [$collectionClass, $collection] = $this->resolveEntry($entry);

                if ($collectionClass === null) {
                    continue;
                }

                if (!$includePrivate &&
                    method_exists($collection, 'isHidden') &&
                    $collection->isHidden()) {
                    continue;
                }

                if ($packageFilter !== null && $packageFilter !== '') {
                    $collectionPackage = method_exists($collection, 'getPackage')
                        ? $collection->getPackage()
                        : 'default';
                    if ($collectionPackage !== $packageFilter) {
                        continue;
                    }
                }

                $item = $this->collectionToArray($collectionClass, $collection, $dbManagedKeys, $actualRoutes);

                if ($withCounts) {
                    $item['record_count'] = $this->countRecords($collectionClass);
                }

                $result[] = $item;
            }

            return $this->respond($result);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    /**
     * Handle GET /collections/{key}
     */
    public function getOne(\WP_REST_Request $request): \WP_REST_Response
    {
        try {
            $key         = $request->get_param('key');
            $collections = $this->getRegistry()->getAll();

            foreach ($collections as $entry) {
                [$collectionClass, $collection] = $this->resolveEntry($entry);

                if ($collectionClass === null) {
                    continue;
                }

                if ($collection->getKey() === $key) {
                    return $this->respond(
                        $this->collectionToArray(
                            $collectionClass,
                            $collection,
                            $this->getDbManagedKeys(),
                            $this->getActualRegisteredRoutes()
                        )
                    );
                }
            }

            return $this->error('Collection not found', 404);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    // ─── Internal helpers ─────────────────────────────────────────────────────

    /**
     * Normalise a registry entry into [class, instance].
     * Returns [null, null] for invalid entries.
     *
     * @param  mixed $entry
     * @return array{0: string|null, 1: object|null}
     */
    private function resolveEntry($entry): array
    {
        if (is_object($entry)) {
            return [get_class($entry), $entry];
        }

        if (is_string($entry) && class_exists($entry)) {
            return [$entry, new $entry()];
        }

        return [null, null];
    }

    /**
     * Serialise a collection to the API array shape.
     *
     * @param  string $collectionClass
     * @param  object $collection
     * @param  array  $dbManagedKeys  Keys from gateway_raptor_collection, flipped for isset() checks
     * @param  array  $actualRoutes   Output of StandardRoutes::getActualRegisteredRoutes()
     */
    public function collectionToArray(
        string $collectionClass,
        object $collection,
        array $dbManagedKeys = [],
        array $actualRoutes  = []
    ): array {
        $key      = method_exists($collection, 'getKey')      ? $collection->getKey()      : null;
        $routeKey = method_exists($collection, 'getRoute')    ? $collection->getRoute()    : '';

        $casts = [];
        $reflection = new \ReflectionClass($collection);
        if ($reflection->hasProperty('casts')) {
            $castsProp = $reflection->getProperty('casts');
            $castsProp->setAccessible(true);
            $casts = $castsProp->getValue($collection);
        }

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
            'title'           => method_exists($collection, 'getTitle')        ? $collection->getTitle()        : null,
            'titlePlural'     => method_exists($collection, 'getTitlePlural')  ? $collection->getTitlePlural()  : null,
            'is_code_defined' => !isset($dbManagedKeys[$key]) && !empty(method_exists($collection, 'getFields') ? $collection->getFields() : []),
            'package'         => method_exists($collection, 'getPackage')      ? $collection->getPackage()      : 'default',
            'core'            => method_exists($collection, 'isCore')          ? $collection->isCore()          : false,
            'private'         => method_exists($collection, 'isPrivate')       ? $collection->isPrivate()       : false,
            'fqcn'            => $collectionClass,
            'className'       => basename(str_replace('\\', '/', $collectionClass)),
            'table'           => method_exists($collection, 'getTable')        ? $collection->getTable()        : null,
            'fillable'        => method_exists($collection, 'getFillable')     ? $collection->getFillable()     : [],
            'casts'           => $casts,
            'routes'          => $registeredRoutes,
            'fields'          => method_exists($collection, 'getFields')       ? $collection->getFields()       : [],
            'filters'         => method_exists($collection, 'getFilters')      ? $collection->getFilters()      : [],
            'grid'            => method_exists($collection, 'getGrid')         ? $collection->getGrid()         : [],
            'displayField'    => method_exists($collection, 'getDisplayField') ? $collection->getDisplayField() : null,
            'relationships'   => $this->discoverCollectionRelationships($collection),
        ];
    }

    /**
     * Discover Eloquent relationship methods on a collection and return their metadata.
     *
     * @param  object $collection
     * @return array  Each entry: { name, type, target_key }
     */
    public function discoverCollectionRelationships(object $collection): array
    {
        $names = CollectionEagerLoadable::discoverRelations($collection);

        $relationships = [];

        foreach ($names as $name) {
            try {
                $rel     = $collection->$name();
                $related = $rel->getRelated();

                $relationships[] = [
                    'name'       => $name,
                    'type'       => class_basename(get_class($rel)),
                    'target_key' => method_exists($related, 'getKey') ? $related->getKey() : null,
                ];
            } catch (\Throwable $e) {
                $relationships[] = [
                    'name'       => $name,
                    'type'       => null,
                    'target_key' => null,
                ];
            }
        }

        return $relationships;
    }

    /**
     * Count records for a collection using Eloquent's count().
     *
     * @param  string $collectionClass Fully-qualified collection class name
     * @return int|null
     */
    public function countRecords(string $collectionClass): ?int
    {
        try {
            return (int) $collectionClass::count();
        } catch (\Throwable $e) {
            return null;
        }
    }
}
