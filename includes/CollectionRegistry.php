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

        $modelClass = $collection->getModelClass();

        // Store the collection instance
        $this->collections[$modelClass] = $collection;

        // Register alias if provided, otherwise auto-generate from model name
        if ($alias) {
            if (isset($this->aliases[$alias])) {
                throw new \InvalidArgumentException(
                    sprintf("Alias '%s' is already registered for %s", esc_html($alias), esc_html($this->aliases[$alias]))
                );
            }
            $this->aliases[$alias] = $modelClass;
        } else {
            // Auto-generate alias from model class name
            $autoAlias = $this->generateAlias($modelClass);
            $this->aliases[$autoAlias] = $modelClass;
        }

        // Fire action hook
        do_action('gateway_collection_registered', $alias, $modelClass, $collection->getConfig());

        return $collection;
    }

    /**
     * Generate alias from model class name
     *
     * @param string $modelClass
     * @return string
     */
    protected function generateAlias($modelClass)
    {
        $className = class_basename($modelClass);
        // Remove "Model" suffix if present
        $alias = str_replace('Model', '', $className);
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
     * Get alias for a model class
     *
     * @param string $modelClass
     * @return string|null
     */
    public function getAlias($modelClass)
    {
        return array_search($modelClass, $this->aliases) ?: null;
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
        do_action('gateway_registry_cleared');
    }

    /**
     * Export collection configurations
     *
     * @return array
     */
    public function export()
    {
        $export = [];

        foreach ($this->collections as $modelClass => $collection) {
            $alias = $this->getAlias($modelClass);
            $export[] = [
                'model' => $modelClass,
                'collection_class' => get_class($collection),
                'config' => $collection->getConfig(),
                'routes' => $collection->getRoutes(),
                'alias' => $alias,
                'analysis' => $collection->getAnalysis(),
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

        foreach ($this->collections as $modelClass => $collection) {
            $stats['collections'][] = [
                'model' => $modelClass,
                'collection' => get_class($collection),
                'alias' => $this->getAlias($modelClass),
                'route' => $collection->getRoute(),
                'column_count' => $collection->getColumnCount(),
                'enabled_routes' => array_keys(array_filter($collection->getRoutes()['methods'])),
            ];
        }

        return $stats;
    }
}
