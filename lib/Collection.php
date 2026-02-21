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

    /**
     * Whether this collection is a core plugin-internal collection.
     * Set by the plugin itself on structural collections (e.g. WP core tables,
     * BlockTypeUser, CollectionUser). Excluded from generic listings by default.
     * Plugin consumers should use $private instead.
     *
     * @var bool
     */
    protected $core = false;

    /**
     * Whether this collection is private.
     * Can be set by plugin consumers to hide their own collections from
     * generic listings in the studio and admin apps.
     *
     * @var bool
     */
    protected $private = false;

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
        if (empty($this->fillable) && !empty($this->getFields())) {
            $this->fillable = array_keys($this->getFields());
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
     * Prepare an interactivity store with collection records
     *
     * @param string $namespace The store namespace (e.g., 'myBlock/tickets')
     * @param mixed $query Optional query builder to filter records
     * @param array $options Additional state options to merge into the store
     * @return void
     */
    public static function prepareStore(string $namespace, $query = null, array $options = [])
    {
        try {
            $builder = $query ?? static::query();
            $records = $builder->get()->toArray();

            $context = wp_interactivity_state($namespace, array_merge([
                'records' => $records,
                'searchTerm' => '', // Add this for filtering
                'loading' => false,
                'error' => null,
                'hasRecords' => count($records) > 0,
                'options' => $options
            ]));
        } catch (\Exception $e) {
            // Log the error but don't crash the plugin
            error_log('Gateway Collection::prepareStore failed for ' . $namespace . ': ' . $e->getMessage());

            // Initialize store with empty records and error state
            wp_interactivity_state($namespace, array_merge([
                'records' => [],
                'searchTerm' => '',
                'loading' => false,
                'error' => 'Database connection failed',
                'hasRecords' => false,
                'options' => $options
            ]));
        }
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
        $fields = $this->fields;

        // If $fields is a string, treat as JSON file path and try to load
        if (is_string($fields)) {
            if (is_readable($fields)) {
                $json = file_get_contents($fields);
                $decoded = json_decode($json, true);
                if (is_array($decoded)) {
                    $fields = $decoded;
                } else {
                    error_log("Collection::getFields: Failed to decode JSON from file: $fields");
                    $fields = [];
                }
            } else {
                error_log("Collection::getFields: Fields file not found or not readable: $fields");
                $fields = [];
            }
        }

        // Check if array is flat (numeric keys)
        $isFlat = false;
        if (is_array($fields) && !empty($fields)) {
            $firstKey = array_key_first($fields);
            $isFlat = is_int($firstKey);
        }

        if ($isFlat) {
            $assoc = [];
            foreach ($fields as $field) {
                // Must be array and have 'name' and 'type'
                if (!is_array($field) || empty($field['name']) || empty($field['type'])) {
                    error_log("Collection::getFields: Skipping invalid field definition (missing 'name' or 'type').");
                    continue;
                }
                $assoc[$field['name']] = $field;
            }
            return $assoc;
        }

        // Already associative or empty
        return $fields;
    }

    public function getKey()
    {
        if ($this->key) {
            return $this->key;
        }

        // Infer from class name: ProductImage => product_image
        $className = class_basename(static::class);
        // Remove "Collection" suffix if present
        $className = preg_replace('/Collection$/', '', $className);
        // Convert PascalCase to snake_case
        $key = strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $className));
        return $key;
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

    /**
     * Whether this is a core plugin-internal collection.
     * Core collections are excluded from generic listings by default.
     *
     * @return bool
     */
    public function isCore(): bool
    {
        return (bool) $this->core;
    }

    /**
     * Whether this collection is private (consumer-defined).
     * Private collections are excluded from generic listings by default.
     *
     * @return bool
     */
    public function isPrivate(): bool
    {
        return (bool) $this->private;
    }

    /**
     * Whether this collection should be excluded from generic listings.
     * True when either $core or $private is set.
     *
     * @return bool
     */
    public function isHidden(): bool
    {
        return $this->isCore() || $this->isPrivate();
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

    public function getFillable()
    {
        // Use getFields() to ensure we have an associative array
        $fields = $this->getFields();
        // Return the keys as fillable attributes
        return array_keys($fields);
    }
}