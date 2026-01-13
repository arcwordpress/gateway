<?php

namespace Gateway\Collections\WP;

class Link extends \Gateway\Collection {

    protected $key    = 'wp_link';
    protected $title  = 'Link';
    protected $titlePlural = 'Links';
    protected $table = 'links';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'link_id';

    /**
     * WordPress links table doesn't use timestamps
     */
    public $timestamps = false;

    /**
     * Core fields for creating/editing a link
     */
    protected $fields = [
        [
            'name'  => 'link_url',
            'type'  => 'text',
            'label' => 'Link URL',
            'required' => true
        ],
        [
            'name'  => 'link_name',
            'type'  => 'text',
            'label' => 'Link Name',
            'required' => true
        ],
        [
            'name'  => 'link_description',
            'type'  => 'textarea',
            'label' => 'Description',
            'required' => false
        ],
        [
            'name'  => 'link_visible',
            'type'  => 'select',
            'label' => 'Visible',
            'options' => ['Y', 'N'],
            'required' => true
        ],
        [
            'name'  => 'link_rating',
            'type'  => 'number',
            'label' => 'Rating',
            'required' => false
        ],
        [
            'name'  => 'link_target',
            'type'  => 'text',
            'label' => 'Target',
            'required' => false
        ]
    ];

}
