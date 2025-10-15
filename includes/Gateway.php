<?php

namespace Gateway;

/**
 * Gateway - Static facade for Collection operations
 *
 * Provides static access to collection functionality.
 * For better practice, use Collection::get() directly.
 */
class Gateway
{
    protected static $registry;

    protected static function init()
    {
        if (!self::$registry) {
            self::$registry = Plugin::getInstance()->getRegistry();
        }
    }

    /**
     * Get a collection instance
     *
     * @param string $identifier Model class or alias
     * @return Collection
     */
    public static function get($identifier)
    {
        self::init();
        return self::$registry->get($identifier);
    }

    /**
     * Check if a collection exists
     *
     * @param string $identifier Model class or alias
     * @return bool
     */
    public static function has($identifier)
    {
        self::init();
        return self::$registry->has($identifier);
    }

    /**
     * Alias for get() - returns collection instance
     *
     * @param string $identifier Model class or alias
     * @return Collection
     */
    public static function collection($identifier)
    {
        return self::get($identifier);
    }

    /**
     * Get the underlying Eloquent model class
     *
     * @param string $identifier Model class or alias
     * @return string Model class name
     */
    public static function model($identifier)
    {
        return self::get($identifier)->getModelClass();
    }

    /**
     * Get a fresh query builder for the collection
     *
     * @param string $identifier Model class or alias
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public static function query($identifier)
    {
        $modelClass = self::get($identifier)->getModelClass();
        return $modelClass::query();
    }

    /**
     * Get all records
     *
     * @param string $identifier Model class or alias
     * @param array $columns Columns to select
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function all($identifier, $columns = ['*'])
    {
        return self::get($identifier)->all($columns);
    }

    /**
     * Find a record by ID
     *
     * @param string $identifier Model class or alias
     * @param mixed $id Record ID
     * @param array $columns Columns to select
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public static function find($identifier, $id, $columns = ['*'])
    {
        return self::get($identifier)->find($id, $columns);
    }

    /**
     * Create a new record
     *
     * @param string $identifier Model class or alias
     * @param array $attributes Record attributes
     * @return \Illuminate\Database\Eloquent\Model
     */
    public static function create($identifier, array $attributes = [])
    {
        return self::get($identifier)->create($attributes);
    }

    /**
     * Update a record
     *
     * @param string $identifier Model class or alias
     * @param mixed $id Record ID
     * @param array $attributes Attributes to update
     * @return bool
     */
    public static function update($identifier, $id, array $attributes = [])
    {
        return self::get($identifier)->update($id, $attributes);
    }

    /**
     * Delete a record
     *
     * @param string $identifier Model class or alias
     * @param mixed $id Record ID
     * @return bool
     */
    public static function delete($identifier, $id)
    {
        return self::get($identifier)->delete($id);
    }

    /**
     * Search records
     *
     * @param string $identifier Model class or alias
     * @param string $term Search term
     * @param array|null $columns Columns to search in
     * @return Collection
     */
    public static function search($identifier, $term, $columns = null)
    {
        return self::get($identifier)->search($term, $columns);
    }

    /**
     * Filter records
     *
     * @param string $identifier Model class or alias
     * @param array $filters Filters to apply
     * @return Collection
     */
    public static function filter($identifier, array $filters)
    {
        return self::get($identifier)->filter($filters);
    }

    /**
     * Sort records
     *
     * @param string $identifier Model class or alias
     * @param string $column Column to sort by
     * @param string $direction Sort direction (asc|desc)
     * @return Collection
     */
    public static function sort($identifier, $column, $direction = 'asc')
    {
        return self::get($identifier)->sort($column, $direction);
    }

    /**
     * Load relationships
     *
     * @param string $identifier Model class or alias
     * @param array|string|null $relations Relations to load
     * @return Collection
     */
    public static function with($identifier, $relations = null)
    {
        return self::get($identifier)->withRelations($relations);
    }

    /**
     * Get the registry instance (internal use)
     *
     * @return CollectionRegistry
     */
    public static function getRegistry()
    {
        self::init();
        return self::$registry;
    }
}
