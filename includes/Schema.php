<?php

namespace Gateway;

abstract class Schema
{
    /**
     * The Collection class reference
     *
     * @var string
     */
    protected $collection;

    /**
     * Field configuration overrides
     *
     * Example:
     * protected $fields = [
     *     'priority' => ['hidden' => true],
     *     'status' => ['type' => 'select', 'options' => ['open', 'closed']],
     *     'description' => ['type' => 'textarea', 'rows' => 5],
     * ];
     *
     * @var array
     */
    protected $fields = [];

    /**
     * Register this schema with a key
     *
     * @param string $key Schema key (lowercase with underscores only)
     * @return void
     * @throws \InvalidArgumentException
     */
    public static function register($key)
    {
        // Validate key format
        if (!preg_match('/^[a-z_]+$/', $key)) {
            throw new \InvalidArgumentException(
                "Schema key must be lowercase letters and underscores only. Got: {$key}"
            );
        }

        SchemaRegistry::register($key, static::class);
    }

    /**
     * Get field configuration
     *
     * @return array
     */
    public function getFields()
    {
        return $this->fields;
    }
}
