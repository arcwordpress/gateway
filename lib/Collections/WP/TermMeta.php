<?php

namespace Gateway\Collections\WP;

class TermMeta extends \Gateway\Collection {

    protected $core    = true;
    protected $key    = 'wp_termmeta';
    protected $title  = 'Term Meta';
    protected $titlePlural = 'Term Meta';
    protected $table = 'termmeta';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'meta_id';

    /**
     * WordPress termmeta table doesn't use timestamps
     */
    public $timestamps = false;

    /**
     * Core fields for creating/editing term meta
     */
    protected $fields = [
        [
            'name'  => 'term_id',
            'type'  => 'number',
            'label' => 'Term ID',
            'required' => true
        ],
        [
            'name'  => 'meta_key',
            'type'  => 'text',
            'label' => 'Meta Key',
            'required' => true
        ],
        [
            'name'  => 'meta_value',
            'type'  => 'textarea',
            'label' => 'Meta Value',
            'required' => false
        ]
    ];

}
