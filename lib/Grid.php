<?php

namespace Gateway;

/**
 * Abstract base class for all Gateway grid definitions.
 *
 * A Grid defines how a data source is presented in a tabular or list view:
 * which columns are shown and in what order, how results are filtered,
 * sorted, and paginated.
 *
 * ## Data Source Contract
 *
 * The $source property accepts any object that can supply records. When
 * $source is a \Gateway\Collection instance (or class name) the system can
 * leverage the full Collection API — Eloquent query builder, REST routes,
 * field definitions, and so on.
 *
 * For custom query objects or other data providers the source MUST expose
 * a method equivalent to `get()` that returns an iterable set of records.
 * A formal interface enforcing this contract will be introduced in a future
 * version; until then this expectation is documented here so implementors
 * know what they need to provide.
 *
 * ## Extending
 *
 * Properties may be set directly in the subclass. The source can also be
 * supplied or overridden at runtime via setSource():
 *
 * ```php
 * class TicketGrid extends \Gateway\Grid {
 *     protected $source       = TicketCollection::class;
 *     protected $columns      = ['id', 'title', 'status', 'created_at'];
 *     protected $defaultSort  = ['field' => 'created_at', 'direction' => 'desc'];
 *     protected $perPage      = 25;
 * }
 * ```
 */
abstract class Grid
{
    /**
     * Unique identifier for this grid. When left empty it is inferred from the
     * class name by stripping the "Grid" suffix and converting to snake_case
     * (e.g. PortfolioGrid → portfolio).
     *
     * @var string
     */
    protected $key = '';

    /**
     * Data Source.
     *
     * Typically a \Gateway\Collection instance or fully-qualified class name,
     * but any object that exposes a get() method (or equivalent) is accepted.
     * Custom query objects must guarantee they can return an iterable set of
     * records when their retrieval method is called.
     *
     * @var mixed
     */
    protected $source;

    /**
     * The fields (columns) to display, in the order they should appear.
     *
     * Providing an explicit list is strongly recommended so the grid does not
     * inadvertently expose fields that should remain hidden. When left empty
     * the grid consumer is responsible for determining column visibility.
     *
     * @var array
     */
    protected $columns = [];

    /**
     * Facet filter definitions for this grid.
     *
     * Each entry describes a filterable dimension (e.g. a status select, a
     * date range, a taxonomy picker). The exact shape of each entry is
     * determined by the filter renderer consuming this grid.
     *
     * @var array
     */
    protected $facetFilters = [];

    /**
     * Default sort applied when no explicit sort is requested.
     *
     * Expected shape: ['field' => 'column_name', 'direction' => 'asc'|'desc']
     *
     * @var array
     */
    protected $defaultSort = [];

    /**
     * Number of records to show per page.
     *
     * @var int
     */
    protected $perPage = 20;

    // -------------------------------------------------------------------------
    // Source
    // -------------------------------------------------------------------------

    /**
     * Set the data source.
     *
     * Allows the source to be supplied or overridden after instantiation — for
     * example when a controller resolves a query object based on request
     * parameters.
     *
     * @param  mixed  $source
     * @return static
     */
    public function setSource($source): static
    {
        $this->source = $source;

        return $this;
    }

    /**
     * Get the raw data source as assigned.
     *
     * @return mixed
     */
    public function getSource()
    {
        return $this->source;
    }

    /**
     * Return the source when it is (or resolves to) a \Gateway\Collection.
     *
     * Other parts of the system can call this to branch behaviour based on
     * whether the source is a full Collection (Eloquent, REST routes, field
     * definitions, etc.) versus a lighter custom query object. Returns null
     * when the source is not a Collection.
     *
     * @return \Gateway\Collection|null
     */
    public function getCollection(): ?\Gateway\Collection
    {
        $source = $this->source;

        // Allow a class-name string to be resolved to an instance.
        if (is_string($source) && is_a($source, \Gateway\Collection::class, true)) {
            return new $source();
        }

        if ($source instanceof \Gateway\Collection) {
            return $source;
        }

        return null;
    }

    // -------------------------------------------------------------------------
    // Columns
    // -------------------------------------------------------------------------

    /**
     * Get the ordered list of columns to display.
     *
     * @return array
     */
    public function getColumns(): array
    {
        return $this->columns;
    }

    // -------------------------------------------------------------------------
    // Filters
    // -------------------------------------------------------------------------

    /**
     * Get the facet filter definitions.
     *
     * @return array
     */
    public function getFacetFilters(): array
    {
        return $this->facetFilters;
    }

    // -------------------------------------------------------------------------
    // Sort
    // -------------------------------------------------------------------------

    /**
     * Get the default sort configuration.
     *
     * @return array
     */
    public function getDefaultSort(): array
    {
        return $this->defaultSort;
    }

    // -------------------------------------------------------------------------
    // Pagination
    // -------------------------------------------------------------------------

    /**
     * Get the number of records per page.
     *
     * @return int
     */
    public function getPerPage(): int
    {
        return $this->perPage;
    }

    // -------------------------------------------------------------------------
    // Identity
    // -------------------------------------------------------------------------

    /**
     * Get the unique key for this grid.
     *
     * Falls back to a snake_case derivation of the class name with any "Grid"
     * suffix removed (e.g. PortfolioGrid → portfolio).
     *
     * @return string
     */
    public function getKey(): string
    {
        if ($this->key !== '') {
            return $this->key;
        }

        $className = class_basename(static::class);
        $className = preg_replace('/Grid$/', '', $className);
        return strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $className));
    }

    // -------------------------------------------------------------------------
    // Registration
    // -------------------------------------------------------------------------

    /**
     * Register this grid with the GridRegistry.
     *
     * Subclasses call this as a static method:
     *
     * ```php
     * PortfolioGrid::register();
     * ```
     *
     * @return static
     */
    public static function register()
    {
        $instance = new static();
        return \Gateway\Plugin::getInstance()->getGridRegistry()->register($instance);
    }
}
