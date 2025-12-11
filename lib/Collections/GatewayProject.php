<?php 

namespace Gateway\Collections;

class GatewayProject extends \Gateway\Collection {

    protected $key    = 'gateway_project';
    protected $title  = 'Project';
    protected $fields = [
        [
            'name'  => 'title',
            'type'  => 'text',
            'label' => 'Title'
        ],
        [
            'name'  => 'slug',
            'type'  => 'slug',
            'label' => 'Slug'
        ]
    ];


}