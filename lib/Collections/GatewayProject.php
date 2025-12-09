<?php 

namespace Gateway\Collections;

class GatewayProject extends \Gateway\Collection {

    protected $key = 'gateway_project';
    protected $fields = [
        [
            'name'  => 'title',
            'type'  => 'text',
            'label' => 'Title'
        ]
    ];


}