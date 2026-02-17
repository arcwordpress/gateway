<?php 

namespace Gateway\Forms\Fields\FieldTypes;

class SelectField extends \Gateway\Field {

    protected $type   = 'select';
    protected $fields = [
        [
            'name'        => 'options',
            'label'       => 'Options',
            'type'        => 'array',
            'required'    => true,
            'placeholder' => 'Option 1' . "\n" . 'Option 2' . "\n" . 'Option 3',
            'description' => 'One option per line',
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
