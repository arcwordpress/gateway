<?php

namespace Gateway;

class CollectionRegistry
{
    protected $collections = [];

    /**
     * Register a collection instance
     *
     * @param Collection $collection Collection instance to register
     * @return Collection
     */
    public function register($collection)
    {
        if (!$collection instanceof Collection) {
            throw new \InvalidArgumentException("Must pass a Collection instance");
        }

        $key = $collection->getKey();

        // Key is required for all collections
        if (empty($key)) {
            throw new \InvalidArgumentException(
                sprintf("Collection '%s' must have a \$key property set", get_class($collection))
            );
        }

        // Store the collection instance by its key
        $this->collections[$key] = $collection;

        // Fire action hook
        do_action('gateway_collection_registered', get_class($collection), $collection);

        return $collection;
    }

    /**
     * Get a registered collection by key
     *
     * @param string $key Collection key
     * @return Collection
     */
    public function get($key)
    {
        if (!isset($this->collections[$key])) {
            throw new \InvalidArgumentException(
                sprintf("Collection with key '%s' is not registered", esc_html($key))
            );
        }

        return $this->collections[$key];
    }

    /**
     * Check if a collection is registered by key
     *
     * @param string $key Collection key
     * @return bool
     */
    public function has($key)
    {
        return isset($this->collections[$key]);
    }

    /**
     * Unregister a collection by key
     *
     * @param string $key Collection key
     * @return bool
     */
    public function unregister($key)
    {
        if (isset($this->collections[$key])) {
            unset($this->collections[$key]);
            do_action('gateway_collection_unregistered', $key);
            return true;
        }

        return false;
    }

    /**
     * Get all registered collections
     *
     * @return array
     */
    public function getAll()
    {
        return $this->collections;
    }

    /**
     * Get all registered collection keys
     *
     * @return array
     */
    public function getRegistered()
    {
        return array_keys($this->collections);
    }

    /**
     * Count registered collections
     *
     * @return int
     */
    public function count()
    {
        return count($this->collections);
    }

    /**
     * Clear all registered collections
     */
    public function clear()
    {
        $this->collections = [];
        do_action('gateway_collection_registry_cleared');
    }

    /**
     * Export collection configurations
     *
     * @return array
     */
    public function export()
    {
        $export = [];

        foreach ($this->collections as $key => $collection) {
            $export[] = [
                'key' => $key,
                'collection_class' => get_class($collection),
                'table' => $collection->getTable(),
                'routes' => $collection->getRoutes(),
                'fields' => $collection->getFields(),
            ];
        }

        return $export;
    }

    /**
     * Get registry statistics
     *
     * @return array
     */
    public function getStats()
    {
        $stats = [
            'total_collections' => count($this->collections),
            'collections' => [],
        ];

        foreach ($this->collections as $key => $collection) {
            $stats['collections'][] = [
                'key' => $key,
                'collection' => get_class($collection),
                'table' => $collection->getTable(),
                'route' => $collection->getRoute(),
                'fillable_count' => count($collection->getFillable()),
                'enabled_routes' => array_keys(array_filter($collection->getRoutes()['methods'])),
            ];
        }

        return $stats;
    }
}
