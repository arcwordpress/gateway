<?php

namespace Gateway\Collections;

/**
 * TicketCollection - Example collection for testing field-based filtering
 *
 * This collection demonstrates automatic field filtering.
 * All fields defined in $fields are automatically filterable via query parameters.
 *
 * Examples:
 *   GET /gateway/v1/tickets/?status=active
 *   GET /gateway/v1/tickets/?priority=high
 *   GET /gateway/v1/tickets/?status=active&priority=high
 */
class TicketCollection extends \Gateway\Collection
{
    protected $key = 'ticket';
    protected $title = 'Ticket';
    protected $titlePlural = 'Tickets';

    protected $fields = [
        [
            'name' => 'title',
            'type' => 'text',
            'label' => 'Title',
            'required' => true
        ],
        [
            'name' => 'description',
            'type' => 'textarea',
            'label' => 'Description'
        ],
        [
            'name' => 'status',
            'type' => 'text',
            'label' => 'Status',
            'default' => 'active'
        ],
        [
            'name' => 'priority',
            'type' => 'text',
            'label' => 'Priority',
            'default' => 'medium'
        ],
        [
            'name' => 'assigned_to',
            'type' => 'text',
            'label' => 'Assigned To'
        ]
    ];

    protected $searchable = ['title', 'description'];
}
