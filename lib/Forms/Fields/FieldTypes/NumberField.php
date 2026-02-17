<?php 

namespace Gateway\Forms\Fields\FieldTypes;

class NumberField extends \Gateway\Field {

    protected $type   = 'number';
    protected $fields = [
        [
            'name'        => 'min',
            'label'       => 'Minimum Value',
            'type'        => 'text',
            'required'    => false,
            'placeholder' => '0',
        ],
        [
            'name'        => 'max',
            'label'       => 'Maximum Value',
            'type'        => 'text',
            'required'    => false,
            'placeholder' => '100',
        ],
        [
            'name'        => 'step',
            'label'       => 'Step',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'any',
            'placeholder' => 'any',
            'description' => 'Increment value: any, 1, 0.1, etc.',
        ],
        [
            'name'        => 'placeholder',
            'label'       => 'Placeholder',
            'type'        => 'text',
            'required'    => false,
            'placeholder' => '',
        ],
    ];

}
