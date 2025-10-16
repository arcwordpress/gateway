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
        add_action('gateway_collection_registered', [$this, 'onCollectionRegistered'], 10, 2);
        add_action('gateway_collection_unregistered', [$this, 'onCollectionUnregistered'], 10, 1);
    }

    public function registerRoutes()
    {
        error_log('=== Gateway: registerRoutes() called on rest_api_init ===');
        error_log('Total collections to register: ' . count($this->registeredRoutes));
        error_log('Collection names: ' . implode(', ', array_keys($this->registeredRoutes)));

        foreach ($this->registeredRoutes as $collectionName => $endpoints) {
            error_log('Processing collection: ' . $collectionName . ' with ' . count($endpoints) . ' endpoints');

            foreach ($endpoints as $endpoint) {
                $namespace = $endpoint->getNamespace();
                $route = $collectionName . $endpoint->getRoute();
                $fullRoute = $namespace . '/' . $route;

                error_log('Registering route: ' . $fullRoute . ' [' . $endpoint->getMethod() . ']');

                register_rest_route(
                    $namespace,
                    $route,
                    $endpoint->getArgs()
                );
            }
        }

        error_log('=== Gateway: registerRoutes() complete ===');
    }

    public function onCollectionRegistered($collectionClass, $collection)
    {
        error_log('=== Gateway: Collection Registration Start ===');
        error_log('Collection Class: ' . var_export($collectionClass, true));
        error_log('Collection Instance: ' . get_class($collection));
        error_log('Collection Key: ' . var_export($collection->getKey(), true));
        error_log('Collection Table: ' . $collection->getTable());
        error_log('Collection Route: ' . $collection->getRoute());
        error_log('Collection REST Namespace: ' . $collection->getRestNamespace());

        // Use the collection's key or route as the collection name
        $collectionName = $collection->getKey() ?: $collection->getRoute();
        error_log('Resolved Collection Name: ' . $collectionName);

        $this->registerStandardRoutesForCollection($collection, $collectionName);
        error_log('=== Gateway: Collection Registration End ===');
    }

    public function onCollectionUnregistered($key)
    {
        // Unregister routes for the collection by its key
        $this->unregisterStandardRoutesForCollection($key);
    }

    private function registerStandardRoutesForCollection(Collection $collection, $collectionName)
    {
        error_log('--- Registering Standard Routes for: ' . $collectionName . ' ---');

        $endpoints = [
            new GetManyRoute($collection, $collectionName),    // GET /collection
            new CreateRoute($collection, $collectionName),     // POST /collection
            new GetOneRoute($collection, $collectionName),     // GET /collection/{id}
            new UpdateRoute($collection, $collectionName),     // PUT /collection/{id}
            new DeleteRoute($collection, $collectionName),     // DELETE /collection/{id}
        ];

        $this->registeredRoutes[$collectionName] = $endpoints;
        error_log('Endpoints created: ' . count($endpoints));

        // If REST API has already been initialized, register immediately
        if (did_action('rest_api_init')) {
            error_log('REST API already initialized - registering routes immediately');
            foreach ($endpoints as $endpoint) {
                $namespace = $endpoint->getNamespace();
                $route = $collectionName . $endpoint->getRoute();
                $fullRoute = $namespace . '/' . $route;

                error_log('Registering route: ' . $fullRoute . ' [' . $endpoint->getMethod() . ']');

                register_rest_route(
                    $namespace,
                    $route,
                    $endpoint->getArgs()
                );
            }
        } else {
            error_log('REST API not yet initialized - routes will be registered on rest_api_init');
        }

        do_action('gateway_standard_routes_registered', $collectionName, $endpoints);
        error_log('--- Standard Routes Registration Complete ---');
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
