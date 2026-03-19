<?php

namespace Gateway\Render;

class Attribute {
    
    protected $id = null;
    protected $elementId = null;
    protected $name = '';
    protected $value = '';

    /**
     * Create a new Attribute
     *
     * @param int $elementId Foreign key to Element
     * @param string $name Attribute name
     * @param string $value Attribute value
     * @param int|null $id Attribute ID
     */
    public function __construct($elementId, $name, $value, $id = null)
    {
        $this->id = $id;
        $this->elementId = $elementId;
        $this->name = $name;
        $this->value = $value;
    }

    /**
     * Get attribute ID
     *
     * @return int|null
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Get element ID (foreign key)
     *
     * @return int
     */
    public function getElementId()
    {
        return $this->elementId;
    }

    /**
     * Get attribute name
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Get attribute value
     *
     * @return string
     */
    public function getValue()
    {
        return $this->value;
    }

    /**
     * Convert to array for database insertion
     *
     * @return array
     */
    public function toArray()
    {
        return [
            'id' => $this->id,
            'element_id' => $this->elementId,
            'name' => $this->name,
            'value' => $this->value,
        ];
    }
}
