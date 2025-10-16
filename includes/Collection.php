<?php

namespace Gateway;

/**
 * Abstract Collection class that configures API routes for Eloquent models
 *
 * Usage:
 * class TicketCollection extends \Gateway\Collection {
 *     protected $model = \TicketSystem\TicketModel::class;
 * }
 *
 * Then register: TicketCollection::register();
 */
abstract class Collection
{

    protected $title;
    protected $key;
    protected $model;
    protected $routes = [
        'enabled' => true,
        'namespace' => 'gateway',    // First segment of REST route (set to '' to omit)
        'version' => 'v1',           // Second segment of REST route (set to '' to omit)
        'route' => null,             // Auto-generated from model if null
        'allow_basic_auth' => true,  // Allow WordPress Application Passwords (Basic Auth) in addition to configured auth
        'methods' => [
            'get_many' => true,      // GET /tickets
            'get_one' => true,       // GET /tickets/{id}
            'create' => true,        // POST /tickets
            'update' => true,        // PUT /tickets/{id}
            'delete' => true,        // DELETE /tickets/{id}
        ],
        'middleware' => [],
        'permissions' => [
            // Multi-type auth system
            // Use '*' for all routes or specify per route: 'get_many', 'get_one', 'create', 'update', 'delete'
            // Set to false for public access
            // Example:
            // '*' => [
            //     'type' => 'cookie_authentication',
            //     'settings' => [
            //         'capability' => 'edit_posts',
            //     ]
            // ],
        ],
    ];

    private $modelInstance;


    public function __construct()
    {
        $this->validateModel();
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
     * Validate that model property is set and valid
     */
    protected function validateModel()
    {
        if (!$this->model) {
            throw new \InvalidArgumentException(
                static::class . " must define a \$model property"
            );
        }

        if (!class_exists($this->model)) {
            throw new \InvalidArgumentException(
                sprintf('Model class %s does not exist', esc_html($this->model))
            );
        }

        $reflection = new \ReflectionClass($this->model);
        if (!$reflection->isSubclassOf('Illuminate\Database\Eloquent\Model')) {
            throw new \InvalidArgumentException(
                sprintf('%s must extend Illuminate\Database\Eloquent\Model', esc_html($this->model))
            );
        }
    }

    /**
     * Generate route from model name
     */
    protected function generateRoute()
    {
        $modelName = class_basename($this->model);

        // Convert "TicketModel" or "Ticket" to "tickets"
        $route = str_replace('Model', '', $modelName);

        // Convert PascalCase to kebab-case (e.g., "DocSet" -> "doc-set", "MyPluginModel" -> "my-plugin")
        $route = strtolower(preg_replace('/(?<!^)[A-Z]/', '-$0', $route));

        // Simple pluralization (can be made more sophisticated)
        if (!str_ends_with($route, 's')) {
            $route .= 's';
        }

        return $route;
    }

    /**
     * Generate route prefix from model name (deprecated - use generateRoute() instead)
     * @deprecated Use generateRoute() instead
     */
    protected function generateRoutePrefix()
    {
        return $this->generateRoute();
    }

    /**
     * Get fresh model instance
     */
    public function getModelInstance()
    {
        if (!$this->modelInstance) {
            $this->modelInstance = new $this->model();
        }
        return clone $this->modelInstance;
    }

    /**
     * Get model class name
     */
    public function getModelClass()
    {
        return $this->model;
    }

    /**
     * Get route configuration
     */
    public function getRoutes()
    {
        return $this->routes;
    }

    /**
     * Get configuration value(s)
     */
    public function getConfig($key = null)
    {
        if ($key) {
            return $this->config[$key] ?? null;
        }
        return $this->config;
    }

    /**
     * Check if route method is enabled
     */
    public function isRouteEnabled($method)
    {
        return $this->routes['enabled'] &&
               ($this->routes['methods'][$method] ?? false);
    }

    /**
     * Get route
     */
    public function getRoute()
    {
        return $this->routes['route'];
    }

    /**
     * Get route prefix (deprecated - use getRoute() instead)
     * @deprecated Use getRoute() instead
     */
    public function getRoutePrefix()
    {
        return $this->getRoute();
    }

    /**
     * Get full REST namespace (e.g., "gateway/v1" or "productify/v1" or just "productify")
     */
    public function getRestNamespace()
    {
        $namespace = $this->routes['namespace'] ?? 'gateway';
        $version = $this->routes['version'] ?? 'v1';

        $parts = array_filter([$namespace, $version]);
        return implode('/', $parts);
    }

    /**
     * Override route configuration
     */
    protected function configureRoutes(array $config)
    {
        $this->routes = array_merge($this->routes, $config);
    }

    /**
     * Override configuration
     */
    protected function configureApi(array $config)
    {
        $this->config = array_merge($this->config, $config);
    }
}
