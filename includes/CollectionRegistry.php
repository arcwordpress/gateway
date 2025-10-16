<?php

namespace Gateway;

class CollectionRegistry
{
    protected $collections = [];
    protected $aliases = [];

    /**
     * Register a collection instance
     *
     * @param Collection $collection Collection instance to register
     * @param string|null $alias Optional alias for the collection
     * @return Collection
     */
    public function register($collection, $alias = null)
    {
        if (!$collection instanceof Collection) {
            throw new \InvalidArgumentException("Must pass a Collection instance");
        }

        $collectionClass = get_class($collection);

        // Store the collection instance
        $this->collections[$collectionClass] = $collection;

        // Register alias if provided, otherwise auto-generate from collection name
        if ($alias) {
            if (isset($this->aliases[$alias])) {
                throw new \InvalidArgumentException(
                    sprintf("Alias '%s' is already registered for %s", esc_html($alias), esc_html($this->aliases[$alias]))
                );
            }
            $this->aliases[$alias] = $collectionClass;
        } else {
            // Auto-generate alias from collection class name
            $autoAlias = $this->generateAlias($collectionClass);
            $this->aliases[$autoAlias] = $collectionClass;
        }

        // Fire action hook
        do_action('gateway_collection_registered', $alias, $collectionClass, $collection);

        return $collection;
    }

    /**
     * Generate alias from collection class name
     *
     * @param string $collectionClass
     * @return string
     */
    protected function generateAlias($collectionClass)
    {
        $className = class_basename($collectionClass);
        // Remove "Collection" suffix if present
        $alias = str_replace('Collection', '', $className);
        return $alias;
    }

    /**
     * Get a registered collection
     *
     * @param string $identifier Model class name or alias
     * @return Collection
     */
    public function get($identifier)
    {
        // Check if it's an alias first
        if (isset($this->aliases[$identifier])) {
            $identifier = $this->aliases[$identifier];
        }

        if (!isset($this->collections[$identifier])) {
            throw new \InvalidArgumentException(
                sprintf("Collection for '%s' is not registered", esc_html($identifier))
            );
        }

        return $this->collections[$identifier];
    }

    /**
     * Check if a collection is registered
     *
     * @param string $identifier Model class name or alias
     * @return bool
     */
    public function has($identifier)
    {
        // Check if it's an alias first
        if (isset($this->aliases[$identifier])) {
            $identifier = $this->aliases[$identifier];
        }

        return isset($this->collections[$identifier]);
    }

    /**
     * Unregister a collection
     *
     * @param string $identifier Model class name or alias
     * @return bool
     */
    public function unregister($identifier)
    {
        if (isset($this->aliases[$identifier])) {
            $modelClass = $this->aliases[$identifier];
            unset($this->aliases[$identifier]);
            $identifier = $modelClass;
        }

        if (isset($this->collections[$identifier])) {
            unset($this->collections[$identifier]);

            // Remove all aliases pointing to this model
            foreach ($this->aliases as $alias => $modelClass) {
                if ($modelClass === $identifier) {
                    unset($this->aliases[$alias]);
                }
            }

            do_action('gateway_collection_unregistered', $identifier);
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
     * Get all aliases
     *
     * @return array
     */
    public function getAliases()
    {
        return $this->aliases;
    }

    /**
     * Get all registered model classes
     *
     * @return array
     */
    public function getRegistered()
    {
        return array_keys($this->collections);
    }

    /**
     * Get alias for a collection class
     *
     * @param string $collectionClass
     * @return string|null
     */
    public function getAlias($collectionClass)
    {
        return array_search($collectionClass, $this->aliases) ?: null;
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
        $this->aliases = [];
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

        foreach ($this->collections as $collectionClass => $collection) {
            $alias = $this->getAlias($collectionClass);
            $export[] = [
                'collection_class' => $collectionClass,
                'table' => $collection->getTable(),
                'routes' => $collection->getRoutes(),
                'alias' => $alias,
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
            'total_aliases' => count($this->aliases),
            'collections' => [],
        ];

        foreach ($this->collections as $collectionClass => $collection) {
            $stats['collections'][] = [
                'collection' => $collectionClass,
                'table' => $collection->getTable(),
                'alias' => $this->getAlias($collectionClass),
                'route' => $collection->getRoute(),
                'fillable_count' => count($collection->getFillable()),
                'enabled_routes' => array_keys(array_filter($collection->getRoutes()['methods'])),
            ];
        }

        return $stats;
    }
}
