<?php

namespace Gateway\Collections\WP;

class Option extends \Gateway\Collection {

    protected $core    = true;
    protected $key    = 'wp_option';
    protected $title  = 'Option';
    protected $titlePlural = 'Options';
    protected $table = 'options';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'option_id';

    /**
     * WordPress options table doesn't use timestamps
     */
    public $timestamps = false;

    /**
     * Core fields for creating/editing an option
     */
    protected $fields = [
        [
            'name'  => 'option_name',
            'type'  => 'text',
            'label' => 'Option Name',
            'required' => true
        ],
        [
            'name'  => 'option_value',
            'type'  => 'textarea',
            'label' => 'Option Value',
            'required' => false
        ],
        [
            'name'  => 'autoload',
            'type'  => 'select',
            'label' => 'Autoload',
            'options' => ['yes', 'no'],
            'required' => true
        ]
    ];

}
