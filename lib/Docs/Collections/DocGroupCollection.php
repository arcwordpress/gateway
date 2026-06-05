<?php

namespace Gateway\Docs\Collections;

class DocGroupCollection extends \Gateway\Collection
{
    protected $key = 'doc_groups';
    protected $table = 'doc_groups';
    protected $package = 'docs';

    protected $routes = [
        'enabled' => true,
        'namespace' => 'gateway',
        'version' => 'v1',
        'permissions' => [
            'get_many' => ['type' => 'public'],
            'get_one'  => ['type' => 'public'],
        ],
    ];

    protected $fields = [
        'title' => [
            'type'        => 'text',
            'label'       => 'Doc Group Title',
            'required'    => true,
            'placeholder' => 'Doc group title...',
        ],
        'slug' => [
            'type'       => 'slug',
            'label'      => 'Slug',
            'required'   => true,
            'watchField' => 'title',
        ],
        'doc_set_id' => [
            'type'     => 'relation',
            'label'    => 'Doc Set',
            'required' => true,
            'relation' => [
                'endpoint'    => 'gateway/v1/doc-sets',
                'labelField'  => 'name',
                'valueField'  => 'id',
                'placeholder' => 'Select a doc set...',
            ],
        ],
        'position' => [
            'type'     => 'number',
            'label'    => 'Position',
            'required' => false,
            'default'  => 0,
        ],
    ];

    protected $filters = [
        [
            'type'        => 'text',
            'field'       => 'search',
            'label'       => 'Search',
            'placeholder' => 'Search doc groups...',
        ],
        [
            'type'             => 'select',
            'field'            => 'doc_set_id',
            'label'            => 'Doc Set',
            'placeholder'      => 'All Doc Sets',
            'options_endpoint' => '/wp-json/gateway/v1/doc-sets',
        ],
        [
            'type'        => 'date_range',
            'field'       => 'created_at',
            'label'       => 'Created Date',
            'placeholder' => ['start' => 'Start Date', 'end' => 'End Date'],
        ],
    ];

    public function docSet()
    {
        return $this->belongsTo(DocSetCollection::class, 'doc_set_id');
    }

    public function docs()
    {
        return $this->hasMany(DocCollection::class, 'doc_group_id');
    }
}
