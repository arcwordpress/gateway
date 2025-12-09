<?php

namespace Gateway;

class Field
{
    protected $type;
    protected $key;
    protected $attributes = [];

    private static $fieldTypes = [];

    /**
     * Register a new field type
     */
    public static function registerType($type, $className)
    {
        self::$fieldTypes[$type] = $className;
    }

    /**
     * Create a field instance
     */
    public static function create($type, $key)
    {
        // Check if custom field type exists
        if (isset(self::$fieldTypes[$type])) {
            $className = self::$fieldTypes[$type];
            return new $className($type, $key);
        }

        // Fall back to base Field
        return new self($type, $key);
    }

    /**
     * Magic method for static field creation
     * Field::text('name') becomes Field::create('text', 'name')
     */
    public static function __callStatic($method, $args)
    {
        $key = $args[0] ?? null;
        if (!$key) {
            throw new \Exception("Field key is required");
        }

        // $method is the type (text, textarea, etc.)
        // $args[0] is the key
        return self::create($method, $key);
    }

    public function __construct($type, $key)
    {
        $this->type = $type;
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

    public function maxLength($length)
    {
        $this->attributes['maxLength'] = $length;
        return $this;
    }

    public function options($options)
    {
        $this->attributes['options'] = $options;
        return $this;
    }

    public function helpText($text)
    {
        $this->attributes['helpText'] = $text;
        return $this;
    }

    public function min($value)
    {
        $this->attributes['min'] = $value;
        return $this;
    }

    public function max($value)
    {
        $this->attributes['max'] = $value;
        return $this;
    }

    public function step($value)
    {
        $this->attributes['step'] = $value;
        return $this;
    }

    public function append($text)
    {
        $this->attributes['append'] = $text;
        return $this;
    }

    public function prepend($text)
    {
        $this->attributes['prepend'] = $text;
        return $this;
    }

    public function sortableChildren($config)
    {
        $this->attributes['sortable_children'] = $config;
        return $this;
    }

    /**
     * Get field metadata
     */
    public function getType()
    {
        return $this->type;
    }

    public function getKey()
    {
        return $this->key;
    }

    public function getLabel()
    {
        return $this->getAttribute('label', ucfirst($this->key));
    }

    public function isRequired()
    {
        return $this->getAttribute('required', false);
    }

    public function getValidation()
    {
        $validation = [];

        if ($maxLength = $this->getAttribute('maxLength')) {
            $validation['max_length'] = $maxLength;
        }

        // Add other validation rules as needed
        // Example: min_length, pattern, etc.

        return !empty($validation) ? $validation : null;
    }

    public function getAttributes()
    {
        return $this->attributes;
    }

    public function getAttribute($key, $default = null)
    {
        return $this->attributes[$key] ?? $default;
    }

    /**
     * Render as HTML input (basic implementation)
     */
    public function render($value = null)
    {
        $label = $this->getAttribute('label', ucfirst($this->key));
        $required = $this->getAttribute('required') ? 'required' : '';
        $placeholder = $this->getAttribute('placeholder', '');
        $helpText = $this->getAttribute('helpText', '');

        $html = '<div class="arc-field">';
        $html .= '<label for="' . $this->key . '">' . esc_html($label);
        if ($this->getAttribute('required')) {
            $html .= ' <span class="required">*</span>';
        }
        $html .= '</label>';

        $html .= '<input type="text" ';
        $html .= 'id="' . $this->key . '" ';
        $html .= 'name="' . $this->key . '" ';
        $html .= 'value="' . esc_attr($value ?? '') . '" ';
        $html .= 'placeholder="' . esc_attr($placeholder) . '" ';
        $html .= $required . ' />';

        if ($helpText) {
            $html .= '<p class="help-text">' . esc_html($helpText) . '</p>';
        }

        $html .= '</div>';

        return $html;
    }

    /**
     * Validate field value
     */
    public function validate($value)
    {
        $errors = [];

        // Required check
        if ($this->getAttribute('required') && empty($value)) {
            $label = $this->getAttribute('label', $this->key);
            $errors[] = $label . ' is required';
        }

        // Max length check
        if ($maxLength = $this->getAttribute('maxLength')) {
            if (strlen($value) > $maxLength) {
                $errors[] = $this->key . ' must be less than ' . $maxLength . ' characters';
            }
        }

        return $errors;
    }

    /**
     * Get database column definition
     */
    public function getColumnDefinition()
    {
        $type = 'VARCHAR(255)';

        // Map field types to SQL types
        switch ($this->type) {
            case 'text':
            case 'email':
            case 'url':
                $maxLength = $this->getAttribute('maxLength', 255);
                $type = "VARCHAR({$maxLength})";
                break;
            case 'textarea':
            case 'wysiwyg':
                $type = 'TEXT';
                break;
            case 'number':
            case 'integer':
                $type = 'INT';
                break;
            case 'range':
                // Range fields can be INT or DECIMAL depending on step
                $step = $this->getAttribute('step', 1);
                $type = ($step < 1) ? 'DECIMAL(10,2)' : 'INT';
                break;
            case 'decimal':
                $type = 'DECIMAL(10,2)';
                break;
            case 'boolean':
                $type = 'TINYINT(1)';
                break;
            case 'date':
            case 'date_picker':
                $type = 'DATE';
                break;
            case 'datetime':
            case 'datetime_picker':
                $type = 'DATETIME';
                break;
            case 'time_picker':
                $type = 'TIME';
                break;
            case 'image':
            case 'file':
                // Store attachment ID as BIGINT UNSIGNED
                $type = 'BIGINT(20) UNSIGNED';
                break;
            case 'gallery':
            case 'link':
                // Store JSON object/array
                $type = 'LONGTEXT';
                break;
            case 'oembed':
                // Store embed URL as TEXT
                $type = 'TEXT';
                break;
            case 'post_object':
            case 'user':
                // Store post/user ID as BIGINT UNSIGNED
                $type = 'BIGINT(20) UNSIGNED';
                break;
        }

        $nullable = $this->getAttribute('required') ? 'NOT NULL' : 'NULL';
        $default = '';

        if ($defaultValue = $this->getAttribute('default')) {
            if (is_string($defaultValue)) {
                $default = "DEFAULT '{$defaultValue}'";
            } else {
                $default = "DEFAULT {$defaultValue}";
            }
        }

        return "`{$this->key}` {$type} {$nullable} {$default}";
    }

    /**
     * Export field as array for API/JSON
     */
    public function toArray()
    {
        return [
            'type' => $this->type,
            'key' => $this->key,
            'attributes' => $this->attributes
        ];
    }
}

// Register built-in field types (can be overridden)
Field::registerType('text', Field::class);
Field::registerType('textarea', Field::class);
Field::registerType('number', Field::class);
Field::registerType('email', Field::class);
Field::registerType('url', Field::class);
Field::registerType('password', Field::class);
Field::registerType('range', Field::class);
Field::registerType('radio', Field::class);
Field::registerType('button_group', Field::class);
Field::registerType('wysiwyg', Field::class);
Field::registerType('color', Field::class);
Field::registerType('date', Field::class);
Field::registerType('boolean', Field::class);
Field::registerType('sortable_children', \Gateway\FieldType\SortableChildrenField::class);
Field::registerType('date_picker', Field::class);
Field::registerType('time_picker', Field::class);
Field::registerType('datetime_picker', Field::class);
Field::registerType('image', Field::class);
Field::registerType('file', Field::class);
Field::registerType('gallery', Field::class);
Field::registerType('link', Field::class);
Field::registerType('oembed', Field::class);
Field::registerType('post_object', Field::class);
Field::registerType('user', Field::class);
