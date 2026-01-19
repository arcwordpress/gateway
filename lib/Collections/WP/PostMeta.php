<?php

namespace Gateway\Collections\WP;

class PostMeta extends \Gateway\Collection {

    protected $key    = 'wp_postmeta';
    protected $title  = 'Post Meta';
    protected $titlePlural = 'Post Meta';
    protected $table = 'postmeta';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'meta_id';

    /**
     * WordPress postmeta table doesn't use timestamps
     */
    public $timestamps = false;

    /**
     * Core fields for creating/editing post meta
     */
    protected $fields = [
        [
            'name'  => 'post_id',
            'type'  => 'number',
            'label' => 'Post ID',
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
