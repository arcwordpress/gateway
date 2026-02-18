<?php

namespace Gateway\Forms\Fields\FieldTypes;

class TextField extends \Gateway\Field {

    protected $type   = 'text';
    protected $fields = [
        [
            'name'        => 'placeholder',
            'label'       => 'Placeholder',
            'type'        => 'text',
            'required'    => false,
            'default'     => '',
            'placeholder' => 'Enter text...',
            'description' => 'Placeholder text shown inside the input when empty.',
        ],
        [
            'name'        => 'default',
            'label'       => 'Default Value',
            'type'        => 'text',
            'required'    => false,
            'default'     => '',
            'placeholder' => '',
            'description' => 'Pre-filled value when a new entry is created.',
        ],
    ];

}
