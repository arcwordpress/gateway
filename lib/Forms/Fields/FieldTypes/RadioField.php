<?php 

namespace Gateway\Forms\Fields\FieldTypes;

class RadioField extends \Gateway\Field {

    protected $type   = 'radio';
    protected $fields = [
        [
            'name'        => 'options',
            'label'       => 'Options',
            'type'        => 'textarea',
            'required'    => true,
            'placeholder' => 'Option 1' . "\n" . 'Option 2' . "\n" . 'Option 3',
            'description' => 'One option per line',
        ],
        [
            'name'        => 'layout',
            'label'       => 'Layout',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'vertical',
            'placeholder' => 'vertical',
            'description' => 'vertical or horizontal',
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
