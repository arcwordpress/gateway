<?php

namespace Gateway\Collections\WP;

class TermRelationship extends \Gateway\Collection {

    protected $core    = true;
    protected $key    = 'wp_term_relationship';
    protected $title  = 'Term Relationship';
    protected $titlePlural = 'Term Relationships';
    protected $table = 'term_relationships';

    /**
     * The primary key for the model.
     * Note: This table actually has a composite key (object_id, term_taxonomy_id)
     *
     * @var string
     */
    protected $primaryKey = 'object_id';

    /**
     * WordPress term_relationships table doesn't use timestamps
     */
    public $timestamps = false;

    /**
     * Core fields for creating/editing a term relationship
     */
    protected $fields = [
        [
            'name'  => 'object_id',
            'type'  => 'number',
            'label' => 'Object ID',
            'required' => true
        ],
        [
            'name'  => 'term_taxonomy_id',
            'type'  => 'number',
            'label' => 'Term Taxonomy ID',
            'required' => true
        ],
        [
            'name'  => 'term_order',
            'type'  => 'number',
            'label' => 'Term Order',
            'required' => false
        ]
    ];

}
