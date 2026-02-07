<?php 

namespace Gateway\Forms\Fields\FieldTypes;

class TextField extends \Gateway\Field {

    protected $type   = 'text';
    protected $fields = [
        [
            'type'  => 'text',
            'name'  => 'title',
            'label' => 'Title',
        ]
    ];

}