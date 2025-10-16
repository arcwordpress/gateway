<?php

namespace Gateway;

class SchemaRoutes
{
    /**
     * Register REST API routes
     */
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    /**
     * Register the routes
     */
    public function registerRoutes()
    {
        // Get many schemas
        register_rest_route('gateway/v1', '/schemas', [
            'methods' => 'GET',
            'callback' => [$this, 'getMany'],
            'permission_callback' => [$this, 'checkPermission'],
        ]);

        // Get one schema by key
        register_rest_route('gateway/v1', '/schemas/(?P<key>[a-z_]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'getOne'],
            'permission_callback' => [$this, 'checkPermission'],
            'args' => [
                'key' => [
                    'required' => true,
                    'type' => 'string',
                    'pattern' => '^[a-z_]+$',
                ],
            ],
        ]);
    }

    /**
     * Check permission
     */
    public function checkPermission()
    {
        return current_user_can('manage_options');
    }

    /**
     * Get many schemas
     */
    public function getMany(\WP_REST_Request $request)
    {
        try {
            $schemas = SchemaRegistry::all();
            $result = [];

            foreach ($schemas as $key => $schemaClass) {
                if (class_exists($schemaClass)) {
                    $schema = new $schemaClass();
                    $result[] = $this->schemaToArray($key, $schemaClass, $schema);
                }
            }

            return new \WP_REST_Response([
                'data' => $result,
            ], 200);
        } catch (\Exception $e) {
            return new \WP_REST_Response([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get one schema by key
     */
    public function getOne(\WP_REST_Request $request)
    {
        try {
            $key = $request->get_param('key');

            $schemaClass = SchemaRegistry::get($key);

            if (!$schemaClass) {
                return new \WP_REST_Response([
                    'error' => 'Schema not found',
                ], 404);
            }

            if (!class_exists($schemaClass)) {
                return new \WP_REST_Response([
                    'error' => 'Schema class does not exist',
                ], 404);
            }

            $schema = new $schemaClass();

            return new \WP_REST_Response([
                'data' => $this->schemaToArray($key, $schemaClass, $schema),
            ], 200);
        } catch (\Exception $e) {
            return new \WP_REST_Response([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Convert schema to array
     */
    private function schemaToArray($key, $schemaClass, $schema)
    {
        $reflection = new \ReflectionClass($schema);
        $properties = [];

        foreach ($reflection->getProperties() as $property) {
            $property->setAccessible(true);
            $properties[$property->getName()] = $property->getValue($schema);
        }

        // Get collection properties if collection exists
        $collectionData = [];
        if (isset($properties['collection']) && class_exists($properties['collection'])) {
            $collectionClass = $properties['collection'];
            $collection = new $collectionClass();
            $collectionReflection = new \ReflectionClass($collection);

            // Get the model from the collection
            $modelProperty = $collectionReflection->getProperty('model');
            $modelProperty->setAccessible(true);
            $modelClass = $modelProperty->getValue($collection);

            // Get model properties
            $modelData = [];
            if (class_exists($modelClass)) {
                $model = new $modelClass();
                $modelReflection = new \ReflectionClass($model);

                // Get fillable properties
                $fillableProperty = $modelReflection->getProperty('fillable');
                $fillableProperty->setAccessible(true);
                $fillable = $fillableProperty->getValue($model);

                // Get casts if available
                $casts = [];
                if ($modelReflection->hasProperty('casts')) {
                    $castsProperty = $modelReflection->getProperty('casts');
                    $castsProperty->setAccessible(true);
                    $casts = $castsProperty->getValue($model);
                }

                // Get table name
                $table = $model->getTable();

                $modelData = [
                    'class' => $modelClass,
                    'table' => $table,
                    'fillable' => $fillable,
                    'casts' => $casts,
                ];
            }

            // Get route configuration from collection
            $routes = $collection->getRoutes();
            $restNamespace = $collection->getRestNamespace();
            $route = $collection->getRoute();

            // Build the full API endpoint URL
            $baseUrl = rest_url();
            $apiEndpoint = $baseUrl . $restNamespace . '/' . $route;

            $collectionData = [
                'class' => $collectionClass,
                'model' => $modelData,
                'routes' => [
                    'namespace' => $restNamespace,
                    'route' => $route,
                    'endpoint' => $apiEndpoint,
                    'methods' => $routes['methods'] ?? [],
                ],
            ];
        }

        return [
            'key' => $key,
            'class' => $schemaClass,
            'name' => basename(str_replace('\\', '/', $schemaClass)),
            'properties' => $properties,
            'collection' => $collectionData,
            'fields' => $schema->getFields(),
        ];
    }
}
