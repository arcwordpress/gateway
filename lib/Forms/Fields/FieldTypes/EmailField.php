<?php 

namespace Gateway\Forms\Fields\FieldTypes;

class EmailField extends \Gateway\Field {

    protected $type   = 'email';
    protected $fields = [
        [
            'name'        => 'placeholder',
            'label'       => 'Placeholder',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'Enter email address',
            'placeholder' => 'Enter email address',
        ],
    ];

}
