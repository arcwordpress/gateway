<?php 

namespace Gateway;

abstract class Field {

    public function getType() {
        return $this->type;
    }

    /**
     * Register this field type with the FieldTypeRegistry
     *
     * @return static
     */
    public static function register()
    {
        $instance = new static();
        return Plugin::getInstance()->getFieldTypeRegistry()->register($instance);
    }

}