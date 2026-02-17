<?php 

namespace Gateway\Forms\Fields\FieldTypes;

class ButtonGroupField extends \Gateway\Field {

    protected $type   = 'button-group';
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
            'name'        => 'default',
            'label'       => 'Default Value',
            'type'        => 'text',
            'required'    => false,
            'placeholder' => '',
            'description' => 'Value of the pre-selected option',
        ],
    ];

}
