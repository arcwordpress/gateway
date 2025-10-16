<?php

namespace Gateway\Test;

use Gateway\Collection;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class TestCollection extends Collection
{

    protected $key = 'tests';
    protected $table = 'gateway_tests';
    protected $fillable = ['name', 'description', 'status'];

    /**
     * Configure routes for this collection
     */
    protected $routes = [
        'enabled' => true,
        'namespace' => 'gateway',
        'version' => 'v1',
        'route' => 'tests',
        'allow_basic_auth' => true,
        'methods' => [
            'get_many' => true, 
            'get_one' => true, 
            'create' => true, 
            'update' => true,  
            'delete' => true, 
        ],
        'permissions' => [
            '*' => [
                'type' => 'cookie_authentication',
                'settings' => []
            ]
        ],
    ];

    protected $fields = [
        'name' => [
            'type' => 'text',
            'label' => 'Test Name',
            'required' => true,
            'placeholder' => 'Enter test name',
        ],
        'description' => [
            'type' => 'textarea',
            'label' => 'Description',
            'rows' => 5,
            'placeholder' => 'Enter test description',
        ],
        'status' => [
            'type' => 'select',
            'label' => 'Status',
            'options' => [
                ['value' => 'active', 'label' => 'Active'],
                ['value' => 'pending', 'label' => 'Pending'],
                ['value' => 'inactive', 'label' => 'Inactive'],
            ],
            'default' => 'active',
        ],
    ];
}
