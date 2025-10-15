<?php

namespace Gateway\Test;

use Gateway\Collection;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class TestCollection extends Collection
{
    /**
     * The Eloquent model for this collection
     */
    protected $model = Test::class;

    /**
     * Configure routes for this collection
     */
    protected $routes = [
        'enabled' => true,
        'namespace' => 'gateway',
        'version' => 'v1',
        'route' => 'tests', // Will be auto-generated as 'tests' if not specified
        'allow_basic_auth' => true,
        'methods' => [
            'get_many' => true,  // GET /gateway/v1/tests
            'get_one' => true,   // GET /gateway/v1/tests/{id}
            'create' => true,    // POST /gateway/v1/tests
            'update' => true,    // PUT /gateway/v1/tests/{id}
            'delete' => true,    // DELETE /gateway/v1/tests/{id}
        ],
        'permissions' => [
            // Require authentication via Basic Auth (Application Passwords) or cookie
            // Leave empty for basic login requirement, or set to false for public access
            '*' => [
                'type' => 'cookie_authentication',
                'settings' => [] // No capability required, just need to be logged in
            ]
        ],
    ];

    /**
     * Configure API behavior
     */
    protected $config = [
        'searchable' => ['name', 'description'],
        'filterable' => ['status'],
        'sortable' => ['id', 'name', 'created_at'],
        'relations' => [],
        'hidden' => [],
        'appends' => [],
        'per_page' => 15,
        'max_per_page' => 100,
    ];
}
