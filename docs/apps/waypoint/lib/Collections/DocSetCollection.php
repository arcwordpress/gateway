<?php

namespace Waypoint\Collections;

class DocSetCollection extends \Gateway\Collection
{
    protected $key = 'doc_sets';
    protected $table = 'doc_sets';
    protected $package = 'waypoint';

    /**
     * @var array API route configuration
     */
    protected $routes = [
        'enabled' => true,
        'namespace' => 'gateway',
        'version' => 'v1',
        'permissions' => [
            'get_many' => [
                'type' => 'public',
            ],
            'get_one' => [
                'type' => 'public',
            ],
        ],
    ];

    /**
     * @var array Field definitions
     */
    protected $fields = [
        'name' => [
            'type' => 'text',
            'label' => 'Doc Set Name',
            'required' => true,
            'placeholder' => 'Doc set name...',
        ],
        'slug' => [
            'type'       => 'slug',
            'label'      => 'Slug',
            'required'   => true,
            'watchField' => 'name',
        ],
        'description' => [
            'type' => 'textarea',
            'label' => 'Description',
            'required' => false,
            'placeholder' => 'Doc set description...',
        ],
        'icon' => [
            'type' => 'text',
            'label' => 'Icon',
            'required' => false,
            'placeholder' => 'Icon name or URL...',
        ],
    ];

    /**
     * @var array Filter definitions
     */
    protected $filters = [
        [
            'type' => 'text',
            'field' => 'search',
            'label' => 'Search',
            'placeholder' => 'Search doc sets...',
        ],
        [
            'type' => 'date_range',
            'field' => 'created_at',
            'label' => 'Created Date',
            'placeholder' => [
                'start' => 'Start Date',
                'end' => 'End Date',
            ],
        ],
    ];

    public function docGroup()
    {
        return $this->belongsTo(
            DocSetCollection::class,
            'doc_set_id'
        );
    }

}
