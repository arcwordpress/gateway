<?php 

namespace Gateway\Forms\Fields\FieldTypes;

class SelectField extends \Gateway\Field {

    protected $type   = 'select';
    protected $fields = [
        [
            'name'        => 'options',
            'label'       => 'Options',
            'type'        => 'text',
            'required'    => true,
            'placeholder' => 'Option 1, Option 2, Option 3',
            'description' => 'Comma-separated list of options',
        ],
        [
            'name'        => 'placeholder',
            'label'       => 'Placeholder',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'Select an option',
            'placeholder' => 'Select an option',
        ],
    ];

}
