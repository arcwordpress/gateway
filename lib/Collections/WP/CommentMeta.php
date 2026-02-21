<?php

namespace Gateway\Collections\WP;

class CommentMeta extends \Gateway\Collection {

    protected $core    = true;
    protected $key    = 'wp_commentmeta';
    protected $title  = 'Comment Meta';
    protected $titlePlural = 'Comment Meta';
    protected $table = 'commentmeta';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'meta_id';

    /**
     * WordPress commentmeta table doesn't use timestamps
     */
    public $timestamps = false;

    /**
     * Core fields for creating/editing comment meta
     */
    protected $fields = [
        [
            'name'  => 'comment_id',
            'type'  => 'number',
            'label' => 'Comment ID',
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
