<?php

namespace Gateway\Forms\Fields;

class FieldTypeRoutes
{
    private $fieldTypeRegistry;
    private $namespace = 'gateway/v1';
    private $route = 'field-types';

    public function __construct()
    {
        $this->fieldTypeRegistry = \Gateway\Plugin::getInstance()->getFieldTypeRegistry();
        $this->register();
    }

    private function register()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    public function registerRoutes()
    {
        // GET /gateway/v1/field-types - Get all field types with their configurations
        register_rest_route(
            $this->namespace,
            '/' . $this->route,
            [
                'methods' => 'GET',
                'callback' => [$this, 'getFieldTypes'],
                'permission_callback' => [$this, 'checkPermission'],
            ]
        );

        // GET /gateway/v1/field-types/{type} - Get a specific field type with its configuration
        register_rest_route(
            $this->namespace,
            '/' . $this->route . '/(?P<type>[a-zA-Z0-9_-]+)',
            [
                'methods' => 'GET',
                'callback' => [$this, 'getFieldType'],
                'permission_callback' => [$this, 'checkPermission'],
            ]
        );
    }

    /**
     * Get all field types with their configurations
     *
     * @return \WP_REST_Response
     */
    public function getFieldTypes(\WP_REST_Request $request)
    {
        $fieldTypes = [];

        foreach ($this->fieldTypeRegistry->getAll() as $type => $fieldTypeInstance) {
            $fieldTypes[] = $this->formatFieldType($fieldTypeInstance);
        }

        return rest_ensure_response([
            'success' => true,
            'data' => $fieldTypes,
            'total' => count($fieldTypes),
        ]);
    }

    /**
     * Get a specific field type with its configuration
     *
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response
     */
    public function getFieldType(\WP_REST_Request $request)
    {
        $type = $request->get_param('type');

        try {
            $fieldTypeInstance = $this->fieldTypeRegistry->get($type);
            return rest_ensure_response([
                'success' => true,
                'data' => $this->formatFieldType($fieldTypeInstance),
            ]);
        } catch (\InvalidArgumentException $e) {
            return rest_ensure_response([
                'success' => false,
                'message' => 'Field type not found: ' . esc_html($type),
            ], 404);
        }
    }

    /**
     * Format a field type instance for API response
     *
     * @param \Gateway\Field $fieldTypeInstance
     * @return array
     */
    private function formatFieldType(\Gateway\Field $fieldTypeInstance)
    {
        $reflection = new \ReflectionClass($fieldTypeInstance);
        $typeProperty = $reflection->getProperty('type');
        $typeProperty->setAccessible(true);
        $type = $typeProperty->getValue($fieldTypeInstance);

        $fieldsProperty = $reflection->getProperty('fields');
        $fieldsProperty->setAccessible(true);
        $fields = $fieldsProperty->getValue($fieldTypeInstance);

        return [
            'type' => $type,
            'class' => get_class($fieldTypeInstance),
            'fields' => is_array($fields) ? $fields : [],
        ];
    }

    /**
     * Check if user has permission to access field type routes
     *
     * @return bool
     */
    public function checkPermission()
    {
        // Allow anyone to read field types, but you can restrict this as needed
        return current_user_can('manage_options');
    }
}
