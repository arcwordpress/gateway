<?php

namespace Gateway\Collections\WP;

class Term extends \Gateway\Collection {

    protected $key    = 'wp_term';
    protected $title  = 'Term';
    protected $titlePlural = 'Terms';
    protected $table = 'terms';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'term_id';

    /**
     * WordPress terms table doesn't use timestamps
     */
    public $timestamps = false;

    /**
     * Core fields for creating/editing a term
     */
    protected $fields = [
        [
            'name'  => 'name',
            'type'  => 'text',
            'label' => 'Name',
            'required' => true
        ],
        [
            'name'  => 'slug',
            'type'  => 'slug',
            'label' => 'Slug',
            'required' => true
        ],
        [
            'name'  => 'term_group',
            'type'  => 'number',
            'label' => 'Term Group',
            'required' => false
        ]
    ];

}
