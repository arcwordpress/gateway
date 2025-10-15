<?php

namespace Gateway;

use Gateway\Endpoints\Standard\CreateRoute;
use Gateway\Endpoints\Standard\GetOneRoute;
use Gateway\Endpoints\Standard\GetManyRoute;
use Gateway\Endpoints\Standard\UpdateRoute;
use Gateway\Endpoints\Standard\DeleteRoute;

class StandardRoutes
{
    private $registeredRoutes = [];

    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
        add_action('gateway_collection_registered', [$this, 'onCollectionRegistered'], 10, 3);
        add_action('gateway_collection_unregistered', [$this, 'onCollectionUnregistered'], 10, 1);
    }

    public function registerRoutes()
    {
        foreach ($this->registeredRoutes as $collectionName => $endpoints) {
            foreach ($endpoints as $endpoint) {
                register_rest_route(
                    $endpoint->getNamespace(),
                    $collectionName . $endpoint->getRoute(),
                    $endpoint->getArgs()
                );
            }
        }
    }

    public function onCollectionRegistered($alias, $modelClass, $config)
    {
        // Use alias as the collection name, fallback to a normalized model class name
        $collectionName = $alias ?: $this->normalizeCollectionName($modelClass);

        // Get the collection instance
        $collection = Plugin::getInstance()->getRegistry()->get($modelClass);

        $this->registerStandardRoutesForCollection($collection, $collectionName);
    }

    public function onCollectionUnregistered($identifier)
    {
        // Find collection name by identifier (could be alias or model class)
        $registry = Plugin::getInstance()->getRegistry();

        // Try to get the alias first
        $collectionName = $registry->getAlias($identifier);

        // If no alias, use normalized model class name
        if (!$collectionName) {
            $collectionName = $this->normalizeCollectionName($identifier);
        }

        $this->unregisterStandardRoutesForCollection($collectionName);
    }

    private function registerStandardRoutesForCollection(Collection $collection, $collectionName)
    {
        $endpoints = [
            new GetManyRoute($collection, $collectionName),    // GET /collection
            new CreateRoute($collection, $collectionName),     // POST /collection
            new GetOneRoute($collection, $collectionName),     // GET /collection/{id}
            new UpdateRoute($collection, $collectionName),     // PUT /collection/{id}
            new DeleteRoute($collection, $collectionName),     // DELETE /collection/{id}
        ];

        $this->registeredRoutes[$collectionName] = $endpoints;

        // If REST API has already been initialized, register immediately
        if (did_action('rest_api_init')) {
            foreach ($endpoints as $endpoint) {
                register_rest_route(
                    $endpoint->getNamespace(),
                    $collectionName . $endpoint->getRoute(),
                    $endpoint->getArgs()
                );
            }
        }

        do_action('gateway_standard_routes_registered', $collectionName, $endpoints);
    }

    private function unregisterStandardRoutesForCollection($collectionName)
    {
        if (isset($this->registeredRoutes[$collectionName])) {
            unset($this->registeredRoutes[$collectionName]);
            do_action('gateway_standard_routes_unregistered', $collectionName);
        }
    }

    private function normalizeCollectionName($modelClass)
    {
        // Extract class name from full namespace
        $className = basename(str_replace('\\', '/', $modelClass));

        // Convert PascalCase to kebab-case and make lowercase (e.g., "DocSet" -> "doc-set")
        $normalized = strtolower(preg_replace('/(?<!^)[A-Z]/', '-$0', $className));

        // Pluralize by adding 's' (basic pluralization)
        if (!str_ends_with($normalized, 's')) {
            $normalized .= 's';
        }

        return $normalized;
    }

    public function getRegisteredRoutes()
    {
        return $this->registeredRoutes;
    }

    public function getRoutesForCollection($collectionName)
    {
        return $this->registeredRoutes[$collectionName] ?? [];
    }

    public function hasRoutesForCollection($collectionName)
    {
        return isset($this->registeredRoutes[$collectionName]);
    }

    public function getRouteInfo()
    {
        $info = [];

        foreach ($this->registeredRoutes as $collectionName => $endpoints) {
            $info[$collectionName] = [];

            foreach ($endpoints as $endpoint) {
                $info[$collectionName][] = [
                    'method'      => $endpoint->getMethod(),
                    'route'       => $endpoint->getFullRoute(),
                    'type'        => $endpoint->getType(), // <-- use the route type from the endpoint
                    'description' => $this->getRouteDescription($endpoint)
                ];
            }
        }

        return $info;
    }

    private function getRouteDescription($endpoint)
    {
        $method = $endpoint->getMethod();
        $collectionName = $endpoint->getCollectionName();

        switch ($method) {
            case 'GET':
                return $endpoint->getType() === 'get_one'
                    ? "Get a single {$collectionName} item"
                    : "Get all {$collectionName} items";
            case 'POST':
                return "Create a new {$collectionName} item";
            case 'PUT':
                return "Update a {$collectionName} item";
            case 'DELETE':
                return "Delete a {$collectionName} item";
            default:
                return "Perform {$method} operation on {$collectionName}";
        }
    }

}
