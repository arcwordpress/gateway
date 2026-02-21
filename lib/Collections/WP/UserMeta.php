<?php

namespace Gateway\Collections\WP;

class UserMeta extends \Gateway\Collection {

    protected $core    = true;
    protected $key    = 'wp_usermeta';
    protected $title  = 'User Meta';
    protected $titlePlural = 'User Meta';
    protected $table = 'usermeta';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'umeta_id';

    /**
     * WordPress usermeta table doesn't use timestamps
     */
    public $timestamps = false;

    /**
     * Core fields for creating/editing user meta
     */
    protected $fields = [
        [
            'name'  => 'user_id',
            'type'  => 'number',
            'label' => 'User ID',
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
