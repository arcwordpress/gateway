<?php

namespace GatewayExtensionScaffold\Collections;

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Record Collection
 *
 * A generic record collection demonstrating the Gateway collection pattern.
 * This collection extends Gateway\Collection which provides:
 * - Eloquent ORM model functionality
 * - Automatic REST API endpoint registration
 * - Field definitions for admin UI and validation
 * - Search capabilities
 */
class RecordCollection extends \Gateway\Collection
{
    /**
     * Unique key for this collection
     * Used for identification and table naming
     *
     * @var string
     */
    protected $key = 'record';

    /**
     * Display title (singular)
     *
     * @var string
     */
    protected $title = 'Record';

    /**
     * Display title (plural)
     *
     * @var string
     */
    protected $titlePlural = 'Records';

    /**
     * Database table name (without WordPress prefix)
     * The prefix is added automatically by Eloquent
     *
     * @var string
     */
    protected $table = 'extension_records';

    /**
     * Enable Eloquent timestamps (created_at, updated_at)
     *
     * @var bool
     */
    public $timestamps = true;

    /**
     * Field definitions for this collection
     *
     * Each field defines:
     * - name: Database column name
     * - type: Field type (text, textarea, number, email, date, checkbox, select, etc.)
     * - label: Human-readable label for admin UI
     * - required: Whether the field is required
     * - default: Default value (optional)
     *
     * @var array
     */
    protected $fields = [
        [
            'name' => 'title',
            'type' => 'text',
            'label' => 'Title',
            'required' => true,
        ],
        [
            'name' => 'description',
            'type' => 'textarea',
            'label' => 'Description',
            'required' => false,
        ],
        [
            'name' => 'status',
            'type' => 'select',
            'label' => 'Status',
            'required' => false,
            'default' => 'draft',
            'options' => [
                ['value' => 'draft', 'label' => 'Draft'],
                ['value' => 'active', 'label' => 'Active'],
                ['value' => 'archived', 'label' => 'Archived'],
            ],
        ],
    ];

    /**
     * Columns that are searchable via the search() method
     *
     * @var array
     */
    protected $searchable = ['title', 'description'];

    /**
     * REST API route configuration
     *
     * @var array
     */
    protected $routes = [
        'enabled' => true,
        'namespace' => 'gateway-extension-scaffold',
        'version' => 'v1',
        'route' => 'records',
        'methods' => [
            'get_many' => true,
            'get_one' => true,
            'create' => true,
            'update' => true,
            'delete' => true,
        ],
    ];

    /**
     * Grid configuration for admin list view
     *
     * @var array
     */
    protected $grid = [
        'columns' => [
            'title' => ['label' => 'Title', 'sortable' => true],
            'status' => ['label' => 'Status', 'sortable' => true],
            'created_at' => ['label' => 'Created', 'sortable' => true],
        ],
    ];
}
