<?php 

namespace Gateway\Forms\Fields;

class FieldTypeRegistry
{
    protected $fieldTypes = [];

    public function __construct()
    {
        // Auto-discover and register field types from the FieldTypes folder
        $this->discoverAndRegisterFieldTypes();
    }

    /**
     * Auto-discover and register field types from the FieldTypes directory
     */
    private function discoverAndRegisterFieldTypes()
    {
        $fieldTypesDir = dirname(__FILE__) . '/FieldTypes';

        if (!is_dir($fieldTypesDir)) {
            return;
        }

        $files = glob($fieldTypesDir . '/*.php');

        if (!$files) {
            return;
        }

        foreach ($files as $file) {
            $className = pathinfo($file, PATHINFO_FILENAME);
            $fullyQualifiedClass = 'Gateway\\Forms\\Fields\\FieldTypes\\' . $className;

            // Skip if class doesn't exist
            if (!class_exists($fullyQualifiedClass)) {
                continue;
            }

            // Use reflection to check if it extends Gateway\Field
            $reflectionClass = new \ReflectionClass($fullyQualifiedClass);
            if (!$reflectionClass->isSubclassOf('Gateway\\Field')) {
                continue;
            }

            // Instantiate and register the field type
            try {
                $instance = new $fullyQualifiedClass();
                $this->register($instance);
            } catch (\Throwable $e) {
                error_log('Failed to register field type ' . $fullyQualifiedClass . ': ' . $e->getMessage());
            }
        }
    }

    /**
     * Register a field type instance
     *
     * @param \Gateway\Field $fieldType Field type instance to register
     * @return \Gateway\Field
     */
    public function register($fieldType)
    {
        if (!$fieldType instanceof \Gateway\Field) {
            throw new \InvalidArgumentException("Must pass a Field instance");
        }

        $type = $fieldType->getType();

        // Type is required for all field types
        if (empty($type)) {
            throw new \InvalidArgumentException(
                sprintf("Field type '%s' must have a type set", get_class($fieldType))
            );
        }

        // Store the field type instance by its type
        $this->fieldTypes[$type] = $fieldType;

        // Fire action hook
        do_action('gateway_field_type_registered', $type, get_class($fieldType), $fieldType);

        return $fieldType;
    }

    /**
     * Get a registered field type by type
     *
     * @param string $type Field type
     * @return \Gateway\Field
     */
    public function get($type)
    {
        if (!isset($this->fieldTypes[$type])) {
            throw new \InvalidArgumentException(
                sprintf("Field type '%s' is not registered", esc_html($type))
            );
        }

        return $this->fieldTypes[$type];
    }

    /**
     * Check if a field type is registered by type
     *
     * @param string $type Field type
     * @return bool
     */
    public function has($type)
    {
        return isset($this->fieldTypes[$type]);
    }

    /**
     * Unregister a field type by type
     *
     * @param string $type Field type
     * @return bool
     */
    public function unregister($type)
    {
        if (isset($this->fieldTypes[$type])) {
            unset($this->fieldTypes[$type]);
            do_action('gateway_field_type_unregistered', $type);
            return true;
        }

        return false;
    }

    /**
     * Get all registered field types
     *
     * @return array
     */
    public function getAll()
    {
        return $this->fieldTypes;
    }

    /**
     * Get all registered field type names
     *
     * @return array
     */
    public function getRegistered()
    {
        return array_keys($this->fieldTypes);
    }

    /**
     * Count registered field types
     *
     * @return int
     */
    public function count()
    {
        return count($this->fieldTypes);
    }

    /**
     * Clear all registered field types
     */
    public function clear()
    {
        $this->fieldTypes = [];
        do_action('gateway_field_type_registry_cleared');
    }

    /**
     * Export field type configurations
     *
     * @return array
     */
    public function export()
    {
        $export = [];

        foreach ($this->fieldTypes as $type => $fieldType) {
            $export[] = [
                'type' => $type,
                'field_type_class' => get_class($fieldType),
            ];
        }

        return $export;
    }

    /**
     * Get registry statistics
     *
     * @return array
     */
    public function getStats()
    {
        $stats = [
            'total_field_types' => count($this->fieldTypes),
            'field_types' => [],
        ];

        foreach ($this->fieldTypes as $type => $fieldType) {
            $stats['field_types'][] = [
                'type' => $type,
                'field_type_class' => get_class($fieldType),
            ];
        }

        return $stats;
    }
}