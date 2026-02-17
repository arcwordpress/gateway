<?php 

namespace Gateway\Forms\Fields\FieldTypes;

class ButtonGroupField extends \Gateway\Field {

    protected $type   = 'button-group';
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
            'name'        => 'default',
            'label'       => 'Default Value',
            'type'        => 'text',
            'required'    => false,
            'placeholder' => '',
            'description' => 'Value of the pre-selected option',
        ],
    ];

}
