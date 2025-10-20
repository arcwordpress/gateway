<?php

namespace GatewayTest;

use Gateway\Collection;

if (!defined('ABSPATH')) {
    exit;
}

class TicketCollection extends Collection
{
    protected $key = 'tickets';
    protected $table = 'gateway_tickets';
    protected $fillable = ['title', 'description', 'due_date'];

    /**
     * Configure routes for this collection
     */
    protected $routes = [
        'enabled' => true,
        'namespace' => 'gateway',
        'version' => 'v1',
        'route' => 'tickets',
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
        'title' => [
            'type' => 'text',
            'label' => 'Ticket Title',
            'required' => true,
            'placeholder' => 'Enter ticket title',
        ],
        'description' => [
            'type' => 'textarea',
            'label' => 'Description',
            'rows' => 5,
            'placeholder' => 'Enter ticket description',
        ],
        'due_date' => [
            'type' => 'date',
            'label' => 'Due Date',
            'required' => true,
        ],
    ];

    protected $filters = [
        [
            'type' => 'text',
            'field' => 'search',
            'label' => 'Search Tickets',
            'placeholder' => 'Search by title or description...',
        ],
        [
            'type' => 'date_range',
            'field' => 'due_date',
            'label' => 'Due Date Range',
            'placeholder' => [
                'start' => 'From',
                'end' => 'To',
            ],
        ],
        [
            'type' => 'date_range',
            'field' => 'created_at',
            'label' => 'Created',
            'placeholder' => [
                'start' => 'Created After',
                'end' => 'Created Before',
            ],
        ],
    ];
}