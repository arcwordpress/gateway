<?php

namespace Gateway\Views\Facets;

abstract class Facet
{
    protected $key    = '';
    protected $field  = '';
    protected $label  = '';
    protected $type   = '';
    protected $config = [];

    public function getKey(): string
    {
        if ($this->key !== '') {
            return $this->key;
        }

        $className = class_basename(static::class);
        $className = preg_replace('/Facet$/', '', $className);
        return strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $className));
    }

    public function getField(): string
    {
        return $this->field;
    }

    public function getLabel(): string
    {
        return $this->label;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getConfig(): array
    {
        return $this->config;
    }

    public static function register(): static
    {
        $instance = new static();

        \Gateway\Plugin::getInstance()->getFacetRegistry()->register($instance);

        return $instance;
    }
}
