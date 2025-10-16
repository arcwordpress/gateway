<?php

namespace Gateway\Test;

use Gateway\Schema;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class TestSchema extends Schema
{
    /**
     * The Collection class reference
     */
    protected $collection = \Gateway\Test\TestCollection::class;

    /**
     * Field configuration overrides
     */
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
