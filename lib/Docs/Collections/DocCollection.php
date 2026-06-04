<?php

namespace Gateway\Docs\Collections;

class DocCollection extends \Gateway\Collection
{
    protected $key = 'docs';
    protected $table = 'docs';
    protected $package = 'docs';

    protected $searchable = ['title', 'content'];

    protected $routes = [
        'enabled' => true,
        'namespace' => 'gateway',
        'version' => 'v1',
        'route' => 'docs',
        'permissions' => [
            'get_many' => ['type' => 'public'],
            'get_one'  => ['type' => 'public'],
        ],
    ];

    protected $fields = [
        'doc_group_id' => [
            'type'     => 'relation',
            'label'    => 'Doc Group',
            'required' => true,
            'relation' => [
                'endpoint'    => 'gateway/v1/doc-groups',
                'labelField'  => 'title',
                'valueField'  => 'id',
                'placeholder' => 'Select a doc group...',
            ],
        ],
        'title' => [
            'type'        => 'text',
            'label'       => 'Doc Title',
            'required'    => true,
            'placeholder' => 'Doc title...',
        ],
        'slug' => [
            'type'       => 'slug',
            'label'      => 'Slug',
            'required'   => true,
            'watchField' => 'title',
        ],
        'content' => [
            'type'  => 'markdown',
            'label' => 'Content',
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
            'placeholder' => 'Search docs...',
        ],
        [
            'type'             => 'select',
            'field'            => 'doc_group_id',
            'label'            => 'Doc Group',
            'placeholder'      => 'All Doc Groups',
            'options_endpoint' => '/wp-json/gateway/v1/doc-groups',
        ],
        [
            'type'        => 'date_range',
            'field'       => 'created_at',
            'label'       => 'Created Date',
            'placeholder' => ['start' => 'Start Date', 'end' => 'End Date'],
        ],
    ];

    public function docGroup()
    {
        return $this->belongsTo(DocGroupCollection::class, 'doc_group_id');
    }
}
