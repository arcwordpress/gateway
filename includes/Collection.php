<?php

namespace Gateway;

use Illuminate\Database\Eloquent\Model as EloquentModel;

/**
 * Collection class that extends Eloquent Model and configures API routes
 *
 * Usage:
 * class TicketCollection extends \Gateway\Collection {
 *     protected $table = 'gateway_tickets';
 *     protected $fillable = ['title', 'status'];
 *
 *     protected $routes = [
 *         'enabled' => true,
 *         'namespace' => 'gateway',
 *         'version' => 'v1',
 *         'route' => 'tickets',
 *     ];
 * }
 *
 * Then register: TicketCollection::register();
 */
class Collection extends EloquentModel
{
    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = true;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [];

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table;

    protected $title;
    protected $key;
    protected $fields = [];
    protected $routes = [
        'enabled' => true,
        'namespace' => 'gateway',
        'version' => 'v1',
        'route' => null,
        'allow_basic_auth' => true,
        'methods' => [
            'get_many' => true,
            'get_one' => true,
            'create' => true,
            'update' => true,
            'delete' => true,
        ],
        'middleware' => [],
        'permissions' => [],
    ];

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        // Set table if not already set
        if (!$this->table && $this->key) {
            $this->table = $this->key;
        } elseif (!$this->table) {
            $this->table = $this->generateTableName();
        }

        // Set fillable from fields if not already set
        if (empty($this->fillable) && !empty($this->fields)) {
            $this->fillable = array_keys($this->fields);
        }

        // Set route if not configured
        if (!isset($this->routes['route']) || $this->routes['route'] === null) {
            $this->routes['route'] = $this->generateRoute();
        }
    }

    /**
     * Register this collection with the CollectionRegistry
     *
     * @param string|null $alias Optional alias for the collection
     * @return static
     */
    public static function register($alias = null)
    {
        $instance = new static();
        return Plugin::getInstance()->getRegistry()->register($instance, $alias);
    }

    /**
     * Generate table name from collection key or class name
     *
     * @return string The generated table name
     */
    protected function generateTableName()
    {
        $collectionName = class_basename(static::class);

        // Remove "Collection" suffix if present
        $name = str_replace('Collection', '', $collectionName);

        // Convert PascalCase to snake_case
        $name = strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $name));

        // Add gateway_ prefix
        return 'gateway_' . $name . 's';
    }

    /**
     * Generate route from collection name
     */
    protected function generateRoute()
    {
        if ($this->key) {
            return $this->key;
        }

        $collectionName = class_basename(static::class);
        $route = str_replace('Collection', '', $collectionName);

        // Convert PascalCase to kebab-case
        $route = strtolower(preg_replace('/(?<!^)[A-Z]/', '-$0', $route));

        // Simple pluralization
        if (!str_ends_with($route, 's')) {
            $route .= 's';
        }

        return $route;
    }

    public function getRoutes()
    {
        return $this->routes;
    }

    public function isRouteEnabled($method)
    {
        return $this->routes['enabled'] &&
               ($this->routes['methods'][$method] ?? false);
    }

    public function getRoute()
    {
        return $this->routes['route'];
    }

    public function getRestNamespace()
    {
        $namespace = $this->routes['namespace'] ?? 'gateway';
        $version = $this->routes['version'] ?? 'v1';

        $parts = array_filter([$namespace, $version]);
        return implode('/', $parts);
    }

    public function getFields()
    {
        return $this->fields;
    }

    public function getKey()
    {
        return $this->key;
    }
}