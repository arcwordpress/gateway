<?php
namespace Gateway;

class Extension
{
    protected $key;

    public static function register()
    {
        $instance = new static();
        return \Gateway\Extensions\ExtensionRegistry::instance()->register($instance);
    }

    public function getKey()
    {
        if ($this->key) {
            return $this->key;
        }
        $className = class_basename(static::class);
        $key = strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $className));
        return $key;
    }
}