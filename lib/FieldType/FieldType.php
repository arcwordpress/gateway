<?php

namespace Gateway\FieldType;

abstract class FieldType
{
    protected $key;
    protected $attributes = [];

    public function __construct($key)
    {
        $this->key = $key;
    }

    /**
     * Chainable attribute setters
     */
    public function label($label)
    {
        $this->attributes['label'] = $label;
        return $this;
    }

    public function required($required = true)
    {
        $this->attributes['required'] = $required;
        return $this;
    }

    public function default($value)
    {
        $this->attributes['default'] = $value;
        return $this;
    }

    public function placeholder($text)
    {
        $this->attributes['placeholder'] = $text;
        return $this;
    }

    public function helpText($text)
    {
        $this->attributes['helpText'] = $text;
        return $this;
    }

    /**
     * Get field key
     */
    public function getKey()
    {
        return $this->key;
    }

    /**
     * Get field label
     */
    public function getLabel()
    {
        return $this->getAttribute('label', ucfirst($this->key));
    }

    /**
     * Check if field is required
     */
    public function isRequired()
    {
        return $this->getAttribute('required', false);
    }

    /**
     * Get all attributes
     */
    public function getAttributes()
    {
        return $this->attributes;
    }

    /**
     * Get specific attribute
     */
    public function getAttribute($key, $default = null)
    {
        return $this->attributes[$key] ?? $default;
    }

    /**
     * Get the field type name
     */
    abstract public function getType();

    /**
     * Get database column definition
     */
    abstract public function getColumnDefinition();

    /**
     * Validate field value
     */
    abstract public function validate($value);

    /**
     * Render field as HTML
     */
    abstract public function render($value = null);
}
