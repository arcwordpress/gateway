<?php

namespace Gateway\Endpoints;

use Gateway\Endpoints\Standard\CreateRoute;
use Gateway\Endpoints\Standard\GetOneRoute;
use Gateway\Endpoints\Standard\GetManyRoute;
use Gateway\Endpoints\Standard\UpdateRoute;
use Gateway\Endpoints\Standard\DeleteRoute;

class StandardRoutes
{
    private $registeredRoutes = [];
    private $actualRegisteredRoutes = [];

    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
        add_action('gateway_collection_registered', [$this, 'onCollectionRegistered'], 10, 2);
        add_action('gateway_collection_unregistered', [$this, 'onCollectionUnregistered'], 10, 1);
    }

    public function registerRoutes()
    {
        foreach ($this->registeredRoutes as $collectionName => $endpoints) {
            if (!isset($this->actualRegisteredRoutes[$collectionName])) {
                $this->actualRegisteredRoutes[$collectionName] = [];
            }

            foreach ($endpoints as $endpoint) {
                $namespace = $endpoint->getNamespace();
                $route = $collectionName . $endpoint->getRoute();

                // Allow filtering of the route before registration
                $filteredRoute = apply_filters('gateway_register_route', $route, $collectionName, $endpoint);
                $filteredNamespace = apply_filters('gateway_register_namespace', $namespace, $collectionName, $endpoint);

                register_rest_route(
                    $filteredNamespace,
                    $filteredRoute,
                    $endpoint->getArgs()
                );

                // Store the actual registered route
                $this->actualRegisteredRoutes[$collectionName][] = [
                    'namespace' => $filteredNamespace,
                    'route' => $filteredRoute,
                    'full_route' => rtrim($filteredNamespace, '/') . '/' . ltrim($filteredRoute, '/'),
                    'method' => $endpoint->getMethod(),
                    'type' => $endpoint->getType(),
                ];
            }
        }
    }

    public function onCollectionRegistered($collectionClass, $collection)
    {
        // Use the collection's route (which converts underscores to hyphens)
        $collectionName = $collection->getRoute();
        $this->registerStandardRoutesForCollection($collection, $collectionName);
    }

    public function onCollectionUnregistered($key)
    {
        // Unregister routes for the collection by its key
        $this->unregisterStandardRoutesForCollection($key);
    }

    private function registerStandardRoutesForCollection($collection, $collectionName)
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
            if (!isset($this->actualRegisteredRoutes[$collectionName])) {
                $this->actualRegisteredRoutes[$collectionName] = [];
            }

            foreach ($endpoints as $endpoint) {
                $namespace = $endpoint->getNamespace();
                $route = $collectionName . $endpoint->getRoute();

                // Allow filtering of the route before registration
                $filteredRoute = apply_filters('gateway_register_route', $route, $collectionName, $endpoint);
                $filteredNamespace = apply_filters('gateway_register_namespace', $namespace, $collectionName, $endpoint);

                register_rest_route(
                    $filteredNamespace,
                    $filteredRoute,
                    $endpoint->getArgs()
                );

                // Store the actual registered route
                $this->actualRegisteredRoutes[$collectionName][] = [
                    'namespace' => $filteredNamespace,
                    'route' => $filteredRoute,
                    'full_route' => rtrim($filteredNamespace, '/') . '/' . ltrim($filteredRoute, '/'),
                    'method' => $endpoint->getMethod(),
                    'type' => $endpoint->getType(),
                ];
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

    public function getActualRegisteredRoutes()
    {
        return $this->actualRegisteredRoutes;
    }

    public function getActualRoutesForCollection($collectionName)
    {
        return $this->actualRegisteredRoutes[$collectionName] ?? [];
    }

    public function getRouteInfo()
    {
        $info = [];

        // Use actual registered routes if available (after rest_api_init)
        if (!empty($this->actualRegisteredRoutes)) {
            foreach ($this->actualRegisteredRoutes as $collectionName => $routes) {
                $info[$collectionName] = [];

                foreach ($routes as $route) {
                    $info[$collectionName][] = [
                        'method'      => $route['method'],
                        'route'       => $route['full_route'],
                        'namespace'   => $route['namespace'],
                        'path'        => $route['route'],
                        'type'        => $route['type'],
                        'description' => $this->getRouteDescriptionByType($route['type'], $collectionName)
                    ];
                }
            }
        } else {
            // Fallback: construct from endpoint objects (before rest_api_init)
            foreach ($this->registeredRoutes as $collectionName => $endpoints) {
                $info[$collectionName] = [];

                foreach ($endpoints as $endpoint) {
                    $info[$collectionName][] = [
                        'method'      => $endpoint->getMethod(),
                        'route'       => $endpoint->getFullRoute(),
                        'type'        => $endpoint->getType(),
                        'description' => $this->getRouteDescription($endpoint)
                    ];
                }
            }
        }

        return $info;
    }

    private function getRouteDescriptionByType($type, $collectionName)
    {
        switch ($type) {
            case 'get_one':
                return "Get a single {$collectionName} item";
            case 'get_many':
                return "Get all {$collectionName} items";
            case 'create':
                return "Create a new {$collectionName} item";
            case 'update':
                return "Update a {$collectionName} item";
            case 'delete':
                return "Delete a {$collectionName} item";
            default:
                return "Perform operation on {$collectionName}";
        }
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
