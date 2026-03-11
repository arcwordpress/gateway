<?php

namespace Gateway;

abstract class View
{
    protected $key = '';

    protected $source;

    protected $columns = [];

    protected $facetFilters = [];

    protected $defaultSort = [];

    protected $perPage = 20;

    public function setSource($source): static
    {
        $this->source = $source;

        return $this;
    }

    public function getSource()
    {
        return $this->source;
    }

    public function getCollection(): ?\Gateway\Collection
    {
        $source = $this->source;

        if (is_string($source) && is_a($source, \Gateway\Collection::class, true)) {
            return new $source();
        }

        if ($source instanceof \Gateway\Collection) {
            return $source;
        }

        return null;
    }

    public function getColumns(): array
    {
        return $this->columns;
    }

    public function getFacetFilters(): array
    {
        return $this->facetFilters;
    }

    public function getDefaultSort(): array
    {
        return $this->defaultSort;
    }

    public function getPerPage(): int
    {
        return $this->perPage;
    }

    public function getKey(): string
    {
        if ($this->key !== '') {
            return $this->key;
        }

        $className = class_basename(static::class);
        $className = preg_replace('/View$/', '', $className);
        return strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $className));
    }

    public static function register()
    {
        $instance = new static();
        
        \Gateway\Plugin::getInstance()->getViewRegistry()->register($instance);

        return $instance;
    }
}
