<?php

namespace Gateway;

class SchemaRegistry
{
    /**
     * Registered schemas (key => class)
     *
     * @var array
     */
    private static $schemas = [];

    /**
     * Register a schema with a key
     *
     * @param string $key Schema key
     * @param string $schemaClass Schema class name
     * @return void
     */
    public static function register($key, $schemaClass)
    {
        self::$schemas[$key] = $schemaClass;
    }

    /**
     * Get all registered schemas
     *
     * @return array
     */
    public static function all()
    {
        return self::$schemas;
    }

    /**
     * Get a schema by key
     *
     * @param string $key
     * @return string|null Schema class name or null if not found
     */
    public static function get($key)
    {
        return self::$schemas[$key] ?? null;
    }

    /**
     * Check if a schema is registered by key
     *
     * @param string $key
     * @return bool
     */
    public static function has($key)
    {
        return isset(self::$schemas[$key]);
    }

    /**
     * Clear all registered schemas
     *
     * @return void
     */
    public static function clear()
    {
        self::$schemas = [];
    }
}
