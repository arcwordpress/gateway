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

    protected $key;

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
    protected $titlePlural;
    
    /**
     * The package this collection belongs to.
     * Determines where the collection is shown in WordPress admin.
     *
     * @var string
     */
    protected $package = 'default';
    
    protected $fields = [];
    protected $filters = [];
    protected $grid = [];
    protected $searchable = [];
    protected $routes = [
        'enabled' => true,
        'namespace' => 'gateway',
        'version' => 'v1',
        'route' => null,
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
     * @return static
     */
    public static function register()
    {
        $instance = new static();
        return Plugin::getInstance()->getRegistry()->register($instance);
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
            // Convert underscores to hyphens for the route
            return str_replace('_', '-', $this->key);
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

    public function getFilters()
    {
        return $this->filters;
    }

    public function getGrid()
    {
        return $this->grid;
    }

    /**
     * Get the package this collection belongs to
     *
     * @return string
     */
    public function getPackage()
    {
        return $this->package;
    }

    public function search(string $term)
    {
        return $this->runDefaultSearch($term);
    }

    /**
     * Get the collection title (singular)
     * Falls back to generating from key or class name
     *
     * @return string
     */
    public function getTitle()
    {
        if ($this->title) {
            return $this->title;
        }

        // Try to generate from key
        if ($this->key) {
            return $this->generateTitleFromKey($this->key);
        }

        // Fall back to class name
        $className = class_basename(static::class);
        $name = str_replace('Collection', '', $className);

        // Convert PascalCase to Title Case with spaces
        return preg_replace('/(?<!^)[A-Z]/', ' $0', $name);
    }

    /**
     * Get the collection title (plural)
     * Falls back to simple pluralization of title
     *
     * @return string
     */
    public function getTitlePlural()
    {
        if ($this->titlePlural) {
            return $this->titlePlural;
        }

        // Get singular title and pluralize it
        $title = $this->getTitle();
        return $this->pluralize($title);
    }

    /**
     * Generate a title from a key (e.g., 'doc_groups' -> 'Doc Group')
     *
     * @param string $key
     * @return string
     */
    protected function generateTitleFromKey($key)
    {
        // Remove trailing 's' for singular form
        $singular = rtrim($key, 's');

        // Convert underscores and hyphens to spaces
        $title = str_replace(['_', '-'], ' ', $singular);

        // Convert to title case
        return ucwords($title);
    }

    /**
     * Simple pluralization
     *
     * @param string $word
     * @return string
     */
    protected function pluralize($word)
    {

        // Already plural?
        if (substr($word, -1) === 's') {
            return $word;
        }

        // Handle words ending in 'y'
        if (substr($word, -1) === 'y' && !in_array(substr($word, -2, 1), ['a', 'e', 'i', 'o', 'u'])) {
            return substr($word, 0, -1) . 'ies';
        }

        // Handle words ending in 's', 'x', 'z', 'ch', 'sh'
        if (preg_match('/(s|x|z|ch|sh)$/i', $word)) {
            return $word . 'es';
        }

        // Default: add 's'
        return $word . 's';
    }

    private function runDefaultSearch(string $term)
    {
        $term = trim((string) $term);

        if ($term === '') {
            return static::query()->limit(0)->get();
        }

        $columns = array_values(array_filter(
            array_map('trim', (array) $this->searchable),
            static fn ($column) => $column !== ''
        ));

        if ($columns === []) {
            return static::query()->limit(0)->get();
        }

        $query = static::query();

        $query->where(function ($builder) use ($columns, $term) {
            foreach ($columns as $index => $column) {
                $method = $index === 0 ? 'where' : 'orWhere';
                $builder->{$method}($column, 'LIKE', '%' . $term . '%');
            }
        });

        return $query->get();
    }
}