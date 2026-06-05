<?php
/**
 * Example: A custom Gateway collection compatible with the Gateway Grid block.
 *
 * Drop this class into your plugin/theme and register it with the
 * CollectionRegistry so it appears in the block's collection picker.
 *
 * The Gateway Grid block expects each record returned by the collection's
 * REST endpoint to have at minimum:
 *   - id     (int|string) — used as data-wp-each-key
 *   - title  (string)
 *   - status (string)    — compared against the status filter options
 *
 * Additional fields are returned by the API and available in context.record
 * but are not rendered by the default block columns (yet).
 *
 * TODO: Once the block is decomposed into child blocks, the rendered columns
 * will be driven by the collection's field definitions, not hardcoded.
 */

namespace MyPlugin\Collections;

use Gateway\Collection;

class Articles extends Collection
{
    /**
     * Unique key — this is the slug used by the block attribute collectionSlug
     * and in the REST route /wp-json/gateway/v1/collections/articles.
     */
    protected $key = 'articles';

    /** Database table (without WP prefix) */
    protected $table = 'articles';

    /**
     * Fields used for REST API output, search, and form generation.
     *
     * The 'status' field must return a plain string value that matches one of
     * the filter option values in the block (active, inactive, pending, draft,
     * published).  Map your own status values to these strings if needed, or
     * expand the STATUS_OPTIONS constant in index.js to add your own.
     *
     * TODO: Once the block reads status options dynamically from the collection
     * definition, add an 'options' key to the status field:
     *
     *   'status' => [
     *       'type'    => 'select',
     *       'label'   => 'Status',
     *       'options' => [
     *           ['value' => 'draft',     'label' => 'Draft'],
     *           ['value' => 'published', 'label' => 'Published'],
     *           ['value' => 'archived',  'label' => 'Archived'],
     *       ],
     *   ],
     */
    protected $fields = [
        'title' => [
            'type'     => 'text',
            'label'    => 'Title',
            'required' => true,
        ],
        'status' => [
            'type'  => 'text',  // change to 'select' with options when dynamic filter is implemented
            'label' => 'Status',
        ],
        'content' => [
            'type'  => 'textarea',
            'label' => 'Content',
        ],
        'author_id' => [
            'type'  => 'integer',
            'label' => 'Author',
        ],
    ];

    /**
     * Grid configuration — controls the admin-side TanStack grid.
     * Not used by the Gateway Grid block directly, but good practice to keep
     * in sync with what the block renders.
     */
    protected $grid = [
        'columns' => [
            ['field' => 'id',     'label' => 'ID',     'sortable' => true],
            ['field' => 'title',  'label' => 'Title',  'sortable' => true],
            ['field' => 'status', 'label' => 'Status', 'sortable' => true],
        ],
    ];
}
