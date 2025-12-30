<?php 

namespace Gateway\Collections;

class WPUser extends \Gateway\Collection {

    protected $key    = 'wp_user';
    protected $title  = 'User';
    protected $titlePlural = 'Users';
    protected $table = 'users';
    
    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'ID';
    
    /**
     * WordPress users table uses custom timestamp columns
     */
    public $timestamps = false;

    /**
     * Core fields for creating/editing a user
     */
    protected $fields = [
        [
            'name'  => 'user_login',
            'type'  => 'text',
            'label' => 'Username',
            'required' => true
        ],
        [
            'name'  => 'user_email',
            'type'  => 'email',
            'label' => 'Email',
            'required' => true
        ],
        [
            'name'  => 'user_pass',
            'type'  => 'password',
            'label' => 'Password',
            'required' => true
        ],
        [
            'name'  => 'display_name',
            'type'  => 'text',
            'label' => 'Display Name'
        ],
        [
            'name'  => 'user_nicename',
            'type'  => 'slug',
            'label' => 'Nice Name (Slug)'
        ]
    ];

}
