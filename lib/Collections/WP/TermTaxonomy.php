<?php

namespace Gateway\Collections\WP;

class TermTaxonomy extends \Gateway\Collection {

    protected $core    = true;
    protected $key    = 'wp_term_taxonomy';
    protected $title  = 'Term Taxonomy';
    protected $titlePlural = 'Term Taxonomies';
    protected $table = 'term_taxonomy';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'term_taxonomy_id';

    /**
     * WordPress term_taxonomy table doesn't use timestamps
     */
    public $timestamps = false;

    /**
     * Core fields for creating/editing a term taxonomy
     */
    protected $fields = [
        [
            'name'  => 'term_id',
            'type'  => 'number',
            'label' => 'Term ID',
            'required' => true
        ],
        [
            'name'  => 'taxonomy',
            'type'  => 'text',
            'label' => 'Taxonomy',
            'required' => true
        ],
        [
            'name'  => 'description',
            'type'  => 'textarea',
            'label' => 'Description',
            'required' => false
        ],
        [
            'name'  => 'parent',
            'type'  => 'number',
            'label' => 'Parent Term ID',
            'required' => false
        ],
        [
            'name'  => 'count',
            'type'  => 'number',
            'label' => 'Count',
            'required' => false
        ]
    ];

}
